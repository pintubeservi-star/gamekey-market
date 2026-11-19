import os, uuid, shutil, subprocess, threading
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .processor import make_clips

ROOT = Path(os.getenv("ARTEX_STORAGE", "/data"))
INBOX, OUT = ROOT / "uploads", ROOT / "outputs"
INBOX.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)
MAX_MB = int(os.getenv("MAX_UPLOAD_MB", "800"))
JOBS = {}
app = FastAPI(title="ARTEX CLIPPER API", version="0.2.0")
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])
app.mount("/outputs", StaticFiles(directory=str(OUT)), name="outputs")

@app.get("/health")
def health(): return {"ok": True, "service": "artex-clipper"}

def worker(job_id, source, seconds):
    JOBS[job_id]["status"] = "processing"; JOBS[job_id]["message"] = "Detectando escenas y preparando clips…"
    try:
        clips = make_clips(source, OUT, job_id, seconds)
        JOBS[job_id].update(status="completed", message="Clips listos", clips=clips)
    except Exception as exc:
        JOBS[job_id].update(status="failed", error=str(exc), message="No se pudo procesar el video")
    finally:
        try: Path(source).unlink(missing_ok=True)
        except Exception: pass

@app.post("/api/jobs")
async def create_job(file: UploadFile = File(...), max_clip_seconds: int = 60, x_content_rights: str = Header(default="")):
    if x_content_rights != "confirmed": raise HTTPException(400, "Confirma que tienes derechos para usar este video.")
    if not file.filename or Path(file.filename).suffix.lower() not in {".mp4",".mov",".mkv",".webm",".m4v"}:
        raise HTTPException(415, "Formato no compatible. Usa MP4, MOV, MKV o WEBM.")
    if max_clip_seconds < 15 or max_clip_seconds > 240: raise HTTPException(400, "Duración permitida: 15 a 240 segundos.")
    job_id = uuid.uuid4().hex[:12]; target = INBOX / f"{job_id}{Path(file.filename).suffix.lower()}"
    total = 0
    try:
        with target.open("wb") as out:
            while chunk := await file.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_MB * 1024 * 1024: raise HTTPException(413, f"El límite es {MAX_MB} MB.")
                out.write(chunk)
    except Exception:
        target.unlink(missing_ok=True); raise
    JOBS[job_id] = {"id": job_id, "status":"queued", "message":"Video recibido", "clips":[]}
    threading.Thread(target=worker, args=(job_id, str(target), max_clip_seconds), daemon=True).start()
    return JOBS[job_id]

@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    if job_id not in JOBS: raise HTTPException(404, "Proyecto no encontrado o reiniciado.")
    return JOBS[job_id]
