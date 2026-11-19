import base64, json, re, subprocess, urllib.request, urllib.error
from pathlib import Path

GEMINI_MODEL = "gemini-3.1-flash-lite"

def run(args, capture_stderr=False):
    p = subprocess.run(args, capture_output=True, text=True, timeout=7200)
    if p.returncode:
        raise RuntimeError((p.stderr or "FFmpeg error")[-2400:])
    return p.stderr if capture_stderr else p.stdout

def probe_duration(source):
    probe = json.loads(run(["ffprobe","-v","error","-show_entries","format=duration","-of","json",source]))
    return float(probe["format"]["duration"])

def extract_frames(source, temp_dir, duration):
    # Muestreo visual espaciado: suficiente para encontrar cambios, acciones y momentos expresivos.
    count = min(36, max(4, int(duration // 5) + 1))
    step = duration / count
    frames = []
    for i in range(count):
        timestamp = min(duration - 0.15, i * step + step * 0.35)
        target = temp_dir / f"frame_{i:02d}.jpg"
        run(["ffmpeg","-y","-ss",str(timestamp),"-i",source,"-frames:v","1","-vf","scale=512:-2","-q:v","5",str(target)])
        if target.exists() and target.stat().st_size:
            frames.append((timestamp, target))
    return frames

def gemini_segments(source, temp_dir, duration, max_seconds, api_key):
    frames = extract_frames(source, temp_dir, duration)
    if len(frames) < 2:
        raise RuntimeError("No fue posible extraer fotogramas para el análisis visual.")
    prompt = (
        "Eres ARTEX, un editor experto de videos cortos para TikTok, Reels y Shorts. "
        "Analiza los fotogramas del video en el orden recibido. Cada imagen viene precedida "
        "por su tiempo exacto en segundos. Encuentra los 8 mejores fragmentos consecutivos que tengan "
        "un gancho visual, acción, emoción, sorpresa, humor, transformación, explicación útil, una acción o una historia que se entienda visualmente. "
        "o una historia que se entienda. No inventes diálogo ni eventos fuera de los fotogramas. "
        "Prioriza inicios que atrapen y finales que dejen una idea completa. "
        f"Duración total: {duration:.2f}s. Duración máxima por clip: {max_seconds}s. "
        "Devuelve SOLO JSON válido con esta forma: "
        '{"clips":[{"start":0.0,"end":25.0,"score":92,"hook":"...","reason":"...","caption":"..."}]}. '
        "Los tiempos deben estar dentro del video, end mayor que start, cada clip entre 3 segundos "
        "y el máximo indicado. Devuelve hasta 8 fragmentos destacados, ordenados por puntuación. No devuelvas markdown. Si no hay momentos diferenciados, selecciona "
        "los mejores intervalos disponibles y explica honestamente la razón."
    )
    parts = [{"text": prompt}]
    for timestamp, path in frames:
        parts.append({"text": f"Fotograma en {timestamp:.2f} segundos:"})
        parts.append({"inline_data":{"mime_type":"image/jpeg","data":base64.b64encode(path.read_bytes()).decode("ascii")}})
    payload = json.dumps({"contents":[{"role":"user","parts":parts}],"generationConfig":{"temperature":0.2,"responseMimeType":"application/json"}}).encode()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    req = urllib.request.Request(url, data=payload, headers={"Content-Type":"application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:900]
        if exc.code in (400, 401, 403):
            raise RuntimeError("Gemini rechazó la clave o la solicitud. Revisa la clave gratuita de Google AI Studio. " + detail)
        if exc.code == 429:
            raise RuntimeError("Se alcanzó el límite gratuito temporal de Gemini. Espera y vuelve a intentar.")
        raise RuntimeError(f"Error de Gemini ({exc.code}): {detail}")
    text = "".join(part.get("text","") for part in data.get("candidates",[{}])[0].get("content",{}).get("parts",[]))
    try:
        parsed = json.loads(text)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match: raise RuntimeError("La IA respondió en un formato que no se pudo interpretar.")
        parsed = json.loads(match.group(0))
    clips = []
    for item in parsed.get("clips", []):
        try:
            start = max(0.0, min(duration - 3.0, float(item["start"])))
            end = min(duration, max(start + 3.0, float(item["end"])))
            end = min(end, start + max_seconds)
            if end - start < 3: continue
            clips.append({"start":start,"end":end,"score":max(0,min(100,int(item.get("score",70)))),"hook":str(item.get("hook","Momento destacado"))[:180],"reason":str(item.get("reason","Seleccionado por análisis visual"))[:260],"caption":str(item.get("caption",""))[:220]})
        except (KeyError, TypeError, ValueError):
            continue
    clips.sort(key=lambda x: x["score"], reverse=True)
    return clips[:8]

def fallback_segments(duration, max_seconds):
    # Motor local sin IA: divide el video en fragmentos reproducibles, sin fingir análisis semántico.
    if duration <= max_seconds:
        return [{"start":0.0,"end":duration,"score":50,"hook":"Fragmento del video","reason":"Selección automática por duración; IA semántica no configurada.","caption":""}]
    clips = []
    start = 0.0
    while start < duration:
        end = min(duration, start + max_seconds)
        if end - start >= 3:
            clips.append({"start":start,"end":end,"score":50,"hook":"Fragmento del video","reason":"Selección automática por duración; IA semántica no configurada.","caption":""})
        start = end
    return clips

def make_clips(source, out_dir, job_id, max_seconds, api_key=None):
    duration = probe_duration(source)
    if duration < 3:
        raise ValueError("El video es demasiado corto. Usa uno de al menos 3 segundos.")
    temp_dir = out_dir / f"analysis_{job_id}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    engine = "gemini" if api_key else "local"
    ai_warning = None
    try:
        # Primero asegura una exportación íntegra: un fallo de IA nunca debe borrar el video final.
        full_name = f"{job_id}_video_completo.mp4"
        full_dest = out_dir / full_name
        run(["ffmpeg","-y","-i",source,"-map","0:v:0","-map","0:a?","-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1","-c:v","libx264","-preset","veryfast","-crf","23","-c:a","aac","-b:a","128k","-movflags","+faststart",str(full_dest)])
        if not full_dest.exists() or full_dest.stat().st_size < 1024:
            raise RuntimeError("No se pudo exportar el video completo.")
        if api_key:
            try:
                segments = gemini_segments(source, temp_dir, duration, max_seconds, api_key)
                if not segments:
                    raise RuntimeError("La IA no encontró fragmentos destacados.")
            except Exception as exc:
                engine = "local_fallback"
                ai_warning = str(exc)[:500]
                segments = fallback_segments(duration, max_seconds)
        else:
            segments = fallback_segments(duration, max_seconds)
        results = []
        for idx, segment in enumerate(segments):
            name = f"{job_id}_{idx+1}.mp4"
            dest = out_dir / name
            start, end = segment["start"], segment["end"]
            # Escalado vertical con recorte centrado y conservación de audio cuando existe.
            run(["ffmpeg","-y","-ss",str(start),"-i",source,"-t",str(end-start),"-map","0:v:0","-map","0:a?","-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920","-c:v","libx264","-preset","veryfast","-crf","23","-c:a","aac","-b:a","128k","-movflags","+faststart",str(dest)])
            if not dest.exists() or dest.stat().st_size < 1024:
                raise RuntimeError("FFmpeg no generó un archivo de video válido.")
            results.append({"id":name,"start":start,"end":end,"duration":end-start,"score":segment["score"],"hook":segment["hook"],"reason":segment["reason"],"caption":segment["caption"],"engine":engine,"url":"/outputs/"+name})
        return {"clips": results, "full_video": {"id": full_name, "duration": duration, "url": "/outputs/" + full_name}, "source_duration": duration, "engine": engine, "ai_warning": ai_warning}
    finally:
        for item in temp_dir.glob("*"):
            item.unlink(missing_ok=True)
        temp_dir.rmdir()
