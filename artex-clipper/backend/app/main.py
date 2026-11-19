import os, uuid, shutil, threading
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .processor import make_clips, GEMINI_MODEL

ROOT = Path(os.getenv("ARTEX_STORAGE", "/data"))
INBOX, OUT = ROOT / "uploads", ROOT / "outputs"
INBOX.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)
MAX_MB = int(os.getenv("MAX_UPLOAD_MB", "250"))
JOBS = {}
app = FastAPI(title="ARTEX CLIPPER AI", version="0.3.0")
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])
app.mount("/outputs", StaticFiles(directory=str(OUT)), name="outputs")

@app.get("/health")
def health():
    return {"ok": True, "service": "artex-clipper", "video_engine": "ffmpeg", "ai_model": GEMINI_MODEL, "ai_key_required": True, "ai_mode": "gemini-vision-with-local-fallback"}

@app.get("/api/ai/status")
def ai_status():
    return {"provider":"Google Gemini","model":GEMINI_MODEL,"free_tier":"available subject to Google AI Studio quotas","configured_on_server":bool(os.getenv("GEMINI_API_KEY")),"per_request_key_supported":True,"key_url":"https://aistudio.google.com/app/apikey"}

def worker(job_id, source, seconds, ai_key):
    JOBS[job_id].update(status="processing", message="Preparando y analizando el video…")
    try:
        result = make_clips(source, OUT, job_id, seconds, ai_key=ai_key)
        if not result or not result.get("full_video"):
            raise RuntimeError("El procesador no pudo exportar el video completo.")
        clips = result.get("clips", [])
        engine = result.get("engine", "local")
        message = "Video completo exportado y mejores momentos seleccionados con Gemini" if engine == "gemini" else "Video completo exportado; clips divididos automáticamente."
        JOBS[job_id].update(status="completed", message=message, clips=clips, full_video=result["full_video"], source_duration=result.get("source_duration"), engine=engine, ai_warning=result.get("ai_warning"))
    except Exception as exc:
        JOBS[job_id].update(status="failed", error=str(exc), message="No se pudo procesar el video")
    finally:
        try: Path(source).unlink(missing_ok=True)
        except Exception: pass

@app.post("/api/jobs")
async def create_job(file: UploadFile = File(...), max_clip_seconds: int = Form(default=60), x_content_rights: str = Header(default=""), x_gemini_api_key: str = Header(default="")):
    if x_content_rights != "confirmed": raise HTTPException(400, "Confirma que tienes derechos para usar este video.")
    if not file.filename or Path(file.filename).suffix.lower() not in {".mp4",".mov",".mkv",".webm",".m4v"}:
        raise HTTPException(415, "Formato no compatible. Usa MP4, MOV, MKV o WEBM.")
    if max_clip_seconds < 15 or max_clip_seconds > 240: raise HTTPException(400, "Duración permitida: 15 a 240 segundos.")
    ai_key = x_gemini_api_key.strip() or os.getenv("GEMINI_API_KEY", "")
    if ai_key and len(ai_key) < 20: raise HTTPException(400, "La clave de Gemini no parece válida.")
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
    JOBS[job_id] = {"id": job_id, "status":"queued", "message":"Video recibido", "clips":[], "engine":("gemini" if ai_key else "local")}
    threading.Thread(target=worker, args=(job_id, str(target), max_clip_seconds, ai_key), daemon=True).start()
    return JOBS[job_id]

@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    if job_id not in JOBS: raise HTTPException(404, "Proyecto no encontrado o reiniciado.")
    return JOBS[job_id]
