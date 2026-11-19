"use client";

import { useMemo, useState } from "react";
import { Upload, Scissors, Sparkles, Film, Download, ShieldCheck, Activity, Clock3 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_ARTEX_API_URL || "";

export default function ClipperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(60);
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState("");
  const size = useMemo(() => file ? (file.size / 1024 / 1024).toFixed(1) + " MB" : "", [file]);

  async function start() {
    if (!file || !rights || !API) return;
    setBusy(true); setError(""); setStatus("Subiendo video…"); setJob(null);
    try {
      const data = new FormData(); data.append("file", file); data.append("max_clip_seconds", String(duration));
      const res = await fetch(API + "/api/jobs", { method: "POST", headers: { "X-Content-Rights": "confirmed" }, body: data });
      if (!res.ok) throw new Error((await res.text()) || "No se pudo enviar el video");
      const created = await res.json(); setJob(created);
      let current = created;
      while (current.status === "queued" || current.status === "processing") {
        setStatus(current.message || "Analizando video…");
        await new Promise(r => setTimeout(r, 2500));
        const poll = await fetch(API + "/api/jobs/" + created.id);
        if (!poll.ok) throw new Error("Se perdió la conexión con el procesamiento");
        current = await poll.json(); setJob(current);
      }
      if (current.status === "failed") throw new Error(current.error || "El procesamiento falló");
      setStatus("¡Clips listos!");
    } catch (e: any) { setError(e.message || "Error inesperado"); setStatus(""); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#090b10] text-white">
    <header className="border-b border-white/10 bg-black/30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <a href="/" className="font-black tracking-[.22em]">ARTEX <span className="text-cyan-400">CLIPPER</span></a>
        <span className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs text-cyan-300">AI VIDEO STUDIO</span>
      </div>
    </header>
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-14">
      <div className="max-w-3xl">
        <p className="mb-4 text-xs font-bold tracking-[.35em] text-cyan-300">CREA MÁS. EDITA MENOS.</p>
        <h1 className="text-4xl font-black leading-tight sm:text-6xl">Convierte videos largos en <span className="text-cyan-300">clips verticales.</span></h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-400">Sube un video que tengas derecho a utilizar. ARTEX analiza escenas, propone fragmentos y prepara clips listos para revisar y publicar.</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-3xl border border-white/10 bg-[#11151e] p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3"><Film className="text-cyan-300"/><h2 className="text-xl font-bold">Nuevo proyecto</h2></div>
          <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-400/5 p-6 text-center hover:bg-cyan-400/10">
            <Upload className="mb-3 h-8 w-8 text-cyan-300"/>
            <strong>{file ? file.name : "Selecciona o arrastra tu video"}</strong>
            <span className="mt-2 text-sm text-slate-400">{file ? size + " · listo para procesar" : "MP4, MOV, MKV o WEBM"}</span>
            <input type="file" accept="video/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/>
          </label>
          <div className="mt-7">
            <div className="mb-3 flex justify-between"><label className="text-sm font-semibold">Duración máxima por clip</label><b className="text-cyan-300">{duration}s</b></div>
            <input aria-label="Duración máxima" type="range" min="15" max="240" step="15" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-cyan-400"/>
            <div className="flex justify-between text-xs text-slate-500"><span>15 segundos</span><span>4 minutos</span></div>
          </div>
          <label className="mt-7 flex items-start gap-3 text-sm text-slate-300"><input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)} className="mt-1 accent-cyan-400"/><span>Confirmo que soy propietario del video o tengo autorización para editarlo y reutilizarlo.</span></label>
          <button disabled={!file || !rights || busy || !API} onClick={start} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-4 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"><Scissors size={18}/>{busy ? "Procesando…" : "Analizar y crear clips"}</button>
          {!API && <p className="mt-3 text-xs text-amber-300">El motor de video aún no está conectado. Configura NEXT_PUBLIC_ARTEX_API_URL al desplegar el backend.</p>}
          {status && <p className="mt-4 text-sm text-cyan-300">{status}</p>}
          {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        </div>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#11151e] p-6">
            <Sparkles className="mb-4 text-cyan-300"/><h3 className="text-lg font-bold">Qué prepara</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">{["Detección de cambios de escena","Fragmentos verticales 9:16","Exportación MP4 para redes","Revisión antes de publicar"].map(x=><li key={x} className="flex gap-2"><ShieldCheck size={17} className="shrink-0 text-cyan-300"/>{x}</li>)}</ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#11151e] p-6">
            <Activity className="mb-4 text-cyan-300"/><h3 className="text-lg font-bold">Estado del proyecto</h3>
            <p className="mt-2 text-sm text-slate-400">{job ? "ID: " + job.id : "Todavía no has iniciado un procesamiento."}</p>
            {job?.clips?.map((clip: any, i: number) => <div key={clip.id || i} className="mt-4 rounded-xl bg-black/30 p-3"><div className="flex items-center justify-between text-sm font-semibold"><span>Clip {i+1}</span><span className="text-cyan-300">{Math.round(clip.duration)}s</span></div><p className="mt-1 text-xs text-slate-500">{clip.start.toFixed(1)}s – {clip.end.toFixed(1)}s</p><a className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-300 underline" href={API + clip.url} target="_blank" rel="noreferrer"><Download size={15}/> Descargar MP4</a></div>)}
          </div>
          <p className="px-2 text-xs leading-5 text-slate-500"><Clock3 className="mr-1 inline" size={13}/> El análisis de esta primera versión detecta cambios de escena; no garantiza viralidad ni sustituye la revisión editorial.</p>
        </aside>
      </div>
    </section>
  </main>;
}
