import subprocess, json
from pathlib import Path

def run(args):
    p = subprocess.run(args, capture_output=True, text=True, timeout=7200)
    if p.returncode: raise RuntimeError((p.stderr or "FFmpeg error")[-1800:])
    return p.stdout

def make_clips(source, out_dir, job_id, max_seconds):
    probe = json.loads(run(["ffprobe","-v","error","-show_entries","format=duration","-of","json",source]))
    duration = float(probe["format"]["duration"])
    if duration < 3: raise ValueError("El video es demasiado corto.")
    # FFmpeg scene-change timestamps are candidates, not semantic/virality scores.
    raw = run(["ffmpeg","-hide_banner","-i",source,"-vf","select='gt(scene,0.28)',showinfo","-an","-f","null","-"])
    import re
    points = [0.0] + [float(x) for x in re.findall(r"pts_time:([0-9.]+)", raw)] + [duration]
    points = sorted(set(x for x in points if 0 <= x <= duration))
    segments = []
    for i in range(len(points)-1):
        a,b=points[i],points[i+1]
        if b-a >= 8: segments.append((a,min(b,a+max_seconds)))
    if not segments:
        start=0.0
        while start < duration:
            end=min(duration,start+max_seconds)
            if end-start >= 5: segments.append((start,end))
            start=end
    results=[]
    for idx,(start,end) in enumerate(segments[:12]):
        name=f"{job_id}_{idx+1}.mp4"; dest=out_dir/name
        run(["ffmpeg","-y","-ss",str(start),"-i",source,"-t",str(end-start),"-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920","-c:v","libx264","-preset","veryfast","-crf","23","-c:a","aac","-b:a","128k","-movflags","+faststart",str(dest)])
        results.append({"id":name,"start":start,"end":end,"duration":end-start,"url":"/outputs/"+name})
    return results
