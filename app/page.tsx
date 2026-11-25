"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clapperboard,
  Edit3, Info, ListPlus, Lock, LogOut, Play, Plus, Search, Settings, Shield,
  Sparkles, Trash2, User, Users, X
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Title = {
  id: string; title: string; synopsis: string; category: string; content_type: "movie" | "series";
  release_year: number | null; maturity_rating: string; seasons: number | null;
  runtime_minutes: number | null; poster_url: string; hero_image_url: string;
  video_url: string; trailer_url: string; featured: boolean; published: boolean; tags: string[];
};
type ViewerProfile = { id: string; name: string; language: string; is_kids: boolean; maturity: string; avatar: string };
const avatars = ["#e50914", "#087e8b", "#7b2cbf", "#e76f51", "#2a9d8f", "#457b9d"];
const demoTitles: Title[] = [
  { id:"demo-1", title:"Horizonte Carmesí", synopsis:"Una anomalía magnética deja aislada una estación espacial. La tripulación descubre que las señales que recibe desde la Tierra llegan desde diez años en el futuro.", category:"Ciencia ficción", content_type:"series", release_year:2026, maturity_rating:"16+", seasons:3, runtime_minutes:null, poster_url:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=650&q=85", hero_image_url:"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1900&q=90", video_url:"", trailer_url:"", featured:true, published:true, tags:["Espacio","Misterio"] },
  { id:"demo-2", title:"La última frontera", synopsis:"Un equipo de exploradores se adentra en un territorio que no aparece en ningún mapa.", category:"Aventura", content_type:"movie", release_year:2025, maturity_rating:"13+", seasons:null, runtime_minutes:118, poster_url:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=650&q=85", hero_image_url:"", video_url:"", trailer_url:"", featured:false, published:true, tags:["Aventura"] },
  { id:"demo-3", title:"Código Niebla", synopsis:"Una analista descubre un patrón oculto detrás de una serie de ataques digitales.", category:"Suspenso", content_type:"series", release_year:2026, maturity_rating:"16+", seasons:2, runtime_minutes:null, poster_url:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=650&q=85", hero_image_url:"", video_url:"", trailer_url:"", featured:false, published:true, tags:["Tecnología"] },
  { id:"demo-4", title:"Océano profundo", synopsis:"Una misión submarina encuentra una estructura que desafía todo lo conocido.", category:"Documental", content_type:"movie", release_year:2024, maturity_rating:"7+", seasons:null, runtime_minutes:92, poster_url:"https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=650&q=85", hero_image_url:"", video_url:"", trailer_url:"", featured:false, published:true, tags:["Naturaleza"] },
  { id:"demo-5", title:"Ciudad de sombras", synopsis:"En una ciudad donde todos guardan un secreto, una detective sigue la pista de una desaparición.", category:"Drama", content_type:"series", release_year:2025, maturity_rating:"16+", seasons:1, runtime_minutes:null, poster_url:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=650&q=85", hero_image_url:"", video_url:"", trailer_url:"", featured:false, published:true, tags:["Drama"] },
  { id:"demo-6", title:"Más allá del tiempo", synopsis:"Dos desconocidos descubren que sus vidas están conectadas por una decisión del pasado.", category:"Romance", content_type:"movie", release_year:2025, maturity_rating:"13+", seasons:null, runtime_minutes:106, poster_url:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=650&q=85", hero_image_url:"", video_url:"", trailer_url:"", featured:false, published:true, tags:["Romance"] }
];
const defaultProfiles: ViewerProfile[] = [{ id:"local-main", name:"Principal", language:"Español (Latinoamérica)", is_kids:false, maturity:"ALL", avatar:avatars[0] }];
const maturityRank: Record<string, number> = { "7+":1, "13+":2, "16+":3, "18+":4, "ALL":4 };

export default function Home() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [profiles,setProfiles] = useState<ViewerProfile[]>(defaultProfiles);
  const [activeProfile,setActiveProfile] = useState<ViewerProfile | null>(null);
  const [titles,setTitles] = useState<Title[]>(demoTitles);
  const [watchlist,setWatchlist] = useState<string[]>([]);
  const [view,setView] = useState<"profiles"|"browse"|"account">("profiles");
  const [manage,setManage] = useState(false);
  const [editing,setEditing] = useState<ViewerProfile | null>(null);
  const [profileModalOpen,setProfileModalOpen] = useState(false);
  const [profileName,setProfileName] = useState("");
  const [profileKids,setProfileKids] = useState(false);
  const [profileMaturity,setProfileMaturity] = useState("ALL");
  const [profileLang,setProfileLang] = useState("Español (Latinoamérica)");
  const [avatar,setAvatar] = useState(avatars[0]);
  const [selected,setSelected] = useState<Title | null>(null);
  const [playing,setPlaying] = useState<Title | null>(null);
  const [search,setSearch] = useState("");
  const [searchOpen,setSearchOpen] = useState(false);
  const [category,setCategory] = useState("Inicio");
  const [userEmail,setUserEmail] = useState("");
  const [password,setPassword] = useState("");
  const [authMode,setAuthMode] = useState<"signin"|"signup">("signin");
  const [authMessage,setAuthMessage] = useState("");
  const [sessionEmail,setSessionEmail] = useState<string | null>(null);
  const [toast,setToast] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("redflix-profiles");
      if (saved) setProfiles(JSON.parse(saved));
      const savedList = localStorage.getItem("redflix-watchlist");
      if (savedList) setWatchlist(JSON.parse(savedList));
    } catch {}
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => setSessionEmail(data.session?.user.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event,session) => setSessionEmail(session?.user.email ?? null));
    supabase.from("redflix_titles").select("*").eq("published",true).order("created_at",{ascending:false})
      .then(({data,error}) => { if (!error && data?.length) setTitles(data as Title[]); });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const allowedTitles = titles.filter((item) => {
    if (!activeProfile) return true;
    if (activeProfile.is_kids) return (maturityRank[item.maturity_rating] ?? 4) <= 1;
    return (maturityRank[item.maturity_rating] ?? 4) <= (maturityRank[activeProfile.maturity] ?? 4);
  });
  const visibleTitles = allowedTitles.filter((item) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [item.title,item.category,item.synopsis,...(item.tags ?? [])].join(" ").toLowerCase().includes(term);
    const matchesCategory = category === "Inicio" || (category === "Series" ? item.content_type === "series" : category === "Películas" ? item.content_type === "movie" : category === "Mi lista" ? watchlist.includes(item.id) : category === "Novedades" ? (item.release_year ?? 0) >= 2025 : item.category === category);
    return matchesSearch && matchesCategory;
  });
  const featured = allowedTitles.find((item) => item.featured) ?? allowedTitles[0];

  const saveProfiles = (next: ViewerProfile[]) => {
    setProfiles(next);
    localStorage.setItem("redflix-profiles",JSON.stringify(next));
  };
  const openEditor = (profile?: ViewerProfile) => {
    setProfileModalOpen(true); setEditing(profile ?? null); setProfileName(profile?.name ?? ""); setProfileKids(profile?.is_kids ?? false);
    setProfileMaturity(profile?.maturity ?? "ALL"); setProfileLang(profile?.language ?? "Español (Latinoamérica)");
    setAvatar(profile?.avatar ?? avatars[0]);
  };
  const saveProfile = async () => {
    const name = profileName.trim();
    if (!name) { setToast("Escribe un nombre para el perfil"); return; }
    const nextProfile: ViewerProfile = { id:editing && !editing.id.startsWith("local-") ? editing.id : crypto.randomUUID(), name, language:profileLang, is_kids:profileKids, maturity:profileKids ? "7+" : profileMaturity, avatar };
    const next = editing ? profiles.map((p) => p.id === editing.id ? nextProfile : p) : [...profiles,nextProfile];
    saveProfiles(next); setEditing(null); setProfileModalOpen(false); setToast("Perfil guardado");
    if (supabase && sessionEmail) {
      const {data:{user}} = await supabase.auth.getUser();
      if (user) {
        await supabase.from("redflix_viewer_profiles").upsert({id:nextProfile.id, user_id:user.id, name:nextProfile.name, language:nextProfile.language, is_kids:nextProfile.is_kids, maturity:nextProfile.maturity, avatar:nextProfile.avatar});
      }
    }
  };
  const removeProfile = (id: string) => {
    if (profiles.length === 1) { setToast("Debes conservar al menos un perfil"); return; }
    saveProfiles(profiles.filter((p) => p.id !== id)); setEditing(null); setToast("Perfil eliminado");
  };
  const chooseProfile = (profile: ViewerProfile) => { setActiveProfile(profile); setView("browse"); setManage(false); };
  useEffect(() => {
    if (!supabase || !sessionEmail) return;
    let alive = true;
    const sync = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{data:remoteProfiles},{data:remoteList}] = await Promise.all([
        supabase.from("redflix_viewer_profiles").select("*").eq("user_id",user.id).order("created_at"),
        supabase.from("redflix_watchlist").select("title_id").eq("user_id",user.id)
      ]);
      if (!alive) return;
      if (remoteProfiles?.length) {
        const mapped = remoteProfiles.map((p:any) => ({id:p.id,name:p.name,language:p.language,is_kids:p.is_kids,maturity:p.maturity,avatar:p.avatar}));
        setProfiles(mapped); localStorage.setItem("redflix-profiles",JSON.stringify(mapped));
      } else {
        const local = JSON.parse(localStorage.getItem("redflix-profiles") || "[]") as ViewerProfile[];
        if (local.length) {
          const migrated = local.map((p) => ({...p,id:crypto.randomUUID()}));
          const {error:profileError} = await supabase.from("redflix_viewer_profiles").insert(migrated.map((p)=>({id:p.id,user_id:user.id,name:p.name,language:p.language,is_kids:p.is_kids,maturity:p.maturity,avatar:p.avatar})));
          if (!profileError && alive) { setProfiles(migrated); localStorage.setItem("redflix-profiles",JSON.stringify(migrated)); }
        }
      }
      if (remoteList) {
        const ids = remoteList.map((row:any)=>row.title_id);
        setWatchlist(ids); localStorage.setItem("redflix-watchlist",JSON.stringify(ids));
      }
    };
    void sync();
    return () => { alive = false; };
  }, [supabase,sessionEmail]);
  const toggleList = async (item: Title) => {
    const exists = watchlist.includes(item.id);
    const next = exists ? watchlist.filter((id) => id !== item.id) : [...watchlist,item.id];
    setWatchlist(next); localStorage.setItem("redflix-watchlist",JSON.stringify(next));
    if (supabase && sessionEmail && !item.id.startsWith("demo-") && activeProfile) {
      const {data:{user}} = await supabase.auth.getUser();
      if (user) {
        if (exists) await supabase.from("redflix_watchlist").delete().eq("user_id",user.id).eq("title_id",item.id).eq("viewer_profile_id",activeProfile.id);
        else await supabase.from("redflix_watchlist").insert({user_id:user.id,title_id:item.id,viewer_profile_id:activeProfile.id});
      }
    }
    setToast(exists ? "Eliminado de Mi lista" : "Añadido a Mi lista");
  };
  const signInOrUp = async () => {
    if (!supabase) { setAuthMessage("La conexión con la base de datos todavía no está configurada."); return; }
    setAuthMessage("Procesando…");
    const result = authMode === "signin" ? await supabase.auth.signInWithPassword({email:userEmail,password}) : await supabase.auth.signUp({email:userEmail,password});
    setAuthMessage(result.error?.message ?? (authMode === "signin" ? "Sesión iniciada." : "Revisa tu correo para confirmar la cuenta."));
  };
  const signOut = async () => { if (supabase) await supabase.auth.signOut(); setSessionEmail(null); setActiveProfile(null); setView("profiles"); setToast("Sesión cerrada"); };
  const saveProgress = async (item:Title, seconds:number, completed=false) => {
    if (!supabase || !sessionEmail || !activeProfile || item.id.startsWith("demo-")) return;
    const {data:{user}} = await supabase.auth.getUser();
    if (user) await supabase.from("redflix_watch_progress").upsert({user_id:user.id,viewer_profile_id:activeProfile.id,title_id:item.id,progress_seconds:Math.floor(seconds),completed,updated_at:new Date().toISOString()},{onConflict:"user_id,viewer_profile_id,title_id"});
  };
  const openPlayer = (item: Title) => { setPlaying(item); setSelected(null); };
  const categories = ["Series","Películas","Novedades","Mi lista"];
  const rows = [
    {name:"Tendencias en Redflix",items:allowedTitles},
    {name:"Series para descubrir",items:allowedTitles.filter((t)=>t.content_type==="series")},
    {name:"Películas para tu noche",items:allowedTitles.filter((t)=>t.content_type==="movie")},
    {name:"Explora por género",items:allowedTitles.filter((t)=>t.category)}
  ];

  return (
    <main className="redflix-app">
      {view === "profiles" && <section className="profiles-screen">
        <header className="profiles-header"><button className="wordmark" onClick={()=>setView("profiles")}>REDFLIX</button><span className="profile-header-tag">ENTRETENIMIENTO A TU MANERA</span></header>
        <div className="profiles-center">
          <h1>{manage ? "Administrar perfiles" : "¿Quién está viendo ahora?"}</h1>
          <div className="profiles-grid">
            {profiles.map((profile) => <div className="profile-tile" key={profile.id}>
              <button className="profile-avatar-wrap" onClick={()=>manage ? openEditor(profile) : chooseProfile(profile)} aria-label={profile.name}>
                <span className="profile-avatar" style={{background:profile.avatar}}>{profile.is_kids ? "✦" : profile.name.slice(0,1).toUpperCase()}</span>
                {manage && <span className="edit-avatar"><Edit3 size={18}/></span>}
              </button>
              <button className="profile-name" onClick={()=>manage ? openEditor(profile) : chooseProfile(profile)}>{profile.name}</button>
              {profile.is_kids && <span className="kids-label">INFANTIL</span>}
            </div>)}
            {!manage && profiles.length < 5 && <button className="add-profile" onClick={()=>openEditor()}><span><Plus size={30}/></span><b>Añadir perfil</b></button>}
          </div>
          <button className="manage-profiles" onClick={()=>setManage(!manage)}>{manage ? "Listo" : "Administrar perfiles"}</button>
        </div>
        <footer>Redflix Entertainment © 2026 · Tu espacio de entretenimiento</footer>
      </section>}

      {view === "browse" && <>
        <nav className="main-nav">
          <div className="nav-left"><button className="wordmark" onClick={()=>{setCategory("Inicio");setSearch("");}}>REDFLIX</button>
            <div className="desktop-links"><button className={category==="Inicio"?"active":""} onClick={()=>setCategory("Inicio")}>Inicio</button>{categories.map((c)=><button className={category===c?"active":""} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
          </div>
          <div className="nav-right">
            {searchOpen && <input autoFocus className="search-field" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Títulos, géneros..."/>}
            <button className="icon-button" onClick={()=>{setSearchOpen(!searchOpen);if(searchOpen)setSearch("");}} aria-label="Buscar"><Search/></button>
            <button className="icon-button notification-button" onClick={()=>setToast("No tienes notificaciones nuevas")} aria-label="Notificaciones"><Bell/><i/></button>
            <button className="nav-profile" onClick={()=>setView("profiles")}><span style={{background:activeProfile?.avatar}}>{activeProfile?.name.slice(0,1)}</span><ChevronDown size={15}/></button>
          </div>
        </nav>
        {featured && <section className="hero" style={{backgroundImage:`linear-gradient(90deg,#141414 0%,rgba(20,20,20,.78) 36%,rgba(20,20,20,.08) 100%),linear-gradient(0deg,#141414 2%,transparent 56%),url("${featured.hero_image_url || featured.poster_url}")`}}>
          <div className="hero-copy"><div className="hero-kicker"><span>R</span> REDFLIX ORIGINAL</div><h1>{featured.title}</h1>
            <div className="hero-meta"><b>98% para ti</b><span>{featured.release_year ?? "Nuevo"}</span><span className="maturity">{featured.maturity_rating}</span><span>{featured.content_type==="series" ? `${featured.seasons ?? 1} temporadas` : `${featured.runtime_minutes ?? 100} min`}</span><span className="quality">HD</span></div>
            <p>{featured.synopsis}</p><div className="hero-actions"><button className="play-button" onClick={()=>openPlayer(featured)}><Play fill="currentColor"/> Reproducir</button><button className="more-button" onClick={()=>setSelected(featured)}><Info/> Más información</button></div>
          </div>
        </section>}
        <section className="catalog">
          {category==="Inicio" ? rows.map((row)=><MovieRow key={row.name} title={row.name} items={row.items} onSelect={setSelected} onPlay={openPlayer}/>) :
            <MovieRow title={category==="Mi lista"?"Mi lista":category} items={visibleTitles} onSelect={setSelected} onPlay={openPlayer}/>}
          {visibleTitles.length===0 && <div className="empty-state"><Clapperboard size={35}/><b>No encontramos títulos</b><span>Prueba otra búsqueda o categoría.</span></div>}
        </section>
        <footer className="browse-footer">REDFLIX <span>Entretenimiento en cualquier pantalla</span><button onClick={()=>setView("account")}>Cuenta y configuración</button><a href="/admin">Administración</a></footer>
      </>}

      {view === "account" && <section className="account-screen">
        <header><button className="wordmark" onClick={()=>setView("browse")}>REDFLIX</button><button onClick={()=>setView("browse")} className="account-back"><ChevronLeft/> Volver a Redflix</button></header>
        <main className="account-content"><h1>Cuenta</h1><p className="account-subtitle">Administra tu acceso y la experiencia de tus perfiles.</p>
          <div className="account-panel"><div><span>CUENTA</span><b>{sessionEmail ?? "No has iniciado sesión"}</b><small>{sessionEmail ? "Cuenta conectada a Redflix" : "Inicia sesión para sincronizar tus perfiles y listas."}</small></div>
            {sessionEmail ? <button className="account-action" onClick={signOut}><LogOut size={16}/> Cerrar sesión</button> : <div className="auth-box"><div className="auth-tabs"><button className={authMode==="signin"?"chosen":""} onClick={()=>setAuthMode("signin")}>Iniciar sesión</button><button className={authMode==="signup"?"chosen":""} onClick={()=>setAuthMode("signup")}>Crear cuenta</button></div><input value={userEmail} onChange={(e)=>setUserEmail(e.target.value)} placeholder="Correo electrónico" type="email"/><input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Contraseña" type="password"/><button className="account-action" onClick={signInOrUp}>{authMode==="signin"?"Entrar":"Crear cuenta"}</button>{authMessage && <small>{authMessage}</small>}</div>}
          </div>
          <div className="account-panel"><div><span>PERFILES</span><b>{profiles.length} perfil(es)</b><small>Idioma, clasificación por edad y perfiles infantiles.</small></div><button className="account-action" onClick={()=>{setManage(true);setView("profiles");}}>Administrar perfiles</button></div>
          <div className="account-panel"><div><span>PRIVACIDAD Y SEGURIDAD</span><b><Shield size={16}/> Protección de perfiles</b><small>Los perfiles infantiles filtran títulos por clasificación.</small></div><Lock size={21}/></div>
          <div className="account-panel"><div><span>AYUDA</span><b><CircleHelp size={16}/> Centro de ayuda</b><small>Soporte y preguntas frecuentes de Redflix.</small></div><button className="account-action" onClick={()=>setToast("Centro de ayuda: próximamente")}>Abrir ayuda</button></div>
        </main>
      </section>}

      {profileModalOpen && <div className="modal-backdrop" onClick={()=>{setEditing(null);setProfileModalOpen(false);}}><section className="profile-modal" onClick={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>{setEditing(null);setProfileModalOpen(false);}}><X/></button><h2>{editing?"Editar perfil":"Crear perfil"}</h2><div className="profile-form-grid"><div className="avatar-editor"><div className="avatar-preview" style={{background:avatar}}>{profileKids?"✦":(profileName||"R").slice(0,1).toUpperCase()}</div><div className="avatar-colors">{avatars.map((color)=><button key={color} style={{background:color}} className={avatar===color?"chosen":""} onClick={()=>setAvatar(color)} aria-label="Elegir avatar"/></div></div>
          <div className="profile-fields"><label>Nombre<input value={profileName} maxLength={20} onChange={(e)=>setProfileName(e.target.value)} placeholder="Nombre del perfil"/></label><label>Idioma<select value={profileLang} onChange={(e)=>setProfileLang(e.target.value)}><option>Español (Latinoamérica)</option><option>Español (España)</option><option>English</option><option>Português</option></select></label><label className="kids-check"><input type="checkbox" checked={profileKids} onChange={(e)=>setProfileKids(e.target.checked)}/><span><b>¿Perfil de niños?</b><small>Solo muestra títulos clasificados para menores de 12 años.</small></span></label><label>Clasificación por edad<select value={profileMaturity} disabled={profileKids} onChange={(e)=>setProfileMaturity(e.target.value)}><option value="ALL">Todos los niveles (18+)</option><option value="16+">16+ y menores</option><option value="13+">13+ y menores</option><option value="7+">7+ (Niños)</option></select></label></div></div>
        <div className="modal-actions">{editing && <button className="danger-button" onClick={()=>removeProfile(editing.id)}>Eliminar perfil</button>}<button className="secondary-button" onClick={()=>{setEditing(null);setProfileModalOpen(false);}}>Cancelar</button><button className="save-button" onClick={saveProfile}>Guardar</button></div>
      </section></div>}

      {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><section className="details-modal" onClick={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>setSelected(null)}><X/></button><div className="details-art" style={{backgroundImage:`linear-gradient(0deg,#181818,transparent 70%),url("${selected.hero_image_url || selected.poster_url}")`}}/>
        <div className="details-copy"><span className="hero-kicker">REDFLIX · {selected.content_type==="series"?"SERIE":"PELÍCULA"}</span><h2>{selected.title}</h2><div className="hero-meta"><b>{selected.release_year}</b><span className="maturity">{selected.maturity_rating}</span><span>{selected.category}</span></div><p>{selected.synopsis}</p><div className="details-actions"><button className="play-button" onClick={()=>openPlayer(selected)}><Play fill="currentColor"/> Reproducir</button><button className="list-button" onClick={()=>toggleList(selected)}>{watchlist.includes(selected.id)?<Check/>:<Plus/>}{watchlist.includes(selected.id)?"En Mi lista":"Mi lista"}</button></div></div>
      </section></div>}

      {playing && <div className="player-backdrop"><div className="player-top"><b>REDFLIX <span>/{playing.title}</span></b><button onClick={()=>setPlaying(null)}><X/></button></div><div className="player-content">
        {playing.video_url ? <video src={playing.video_url} controls autoPlay playsInline className="video-player" onPause={(e)=>void saveProgress(playing,e.currentTarget.currentTime)} onEnded={(e)=>void saveProgress(playing,e.currentTarget.currentTime,true)}/> : <div className="player-placeholder"><Clapperboard size={54}/><h2>{playing.title}</h2><p>Este título todavía no tiene un archivo de reproducción conectado.</p><small>El administrador puede añadir el enlace de vídeo desde /admin.</small></div>}
      </div></div>}

      {toast && <div className="toast-message"><Sparkles size={16}/>{toast}</div>}
    </main>
  );
}

function MovieRow({title,items,onSelect,onPlay}:{title:string;items:Title[];onSelect:(item:Title)=>void;onPlay:(item:Title)=>void}) {
  const [offset,setOffset] = useState(0);
  if (!items.length) return null;
  return <section className="movie-row"><div className="row-heading"><h2>{title}</h2><div><button onClick={()=>setOffset(Math.max(0,offset-1))} aria-label="Anterior"><ChevronLeft/></button><button onClick={()=>setOffset(Math.min(Math.max(0,items.length-4),offset+1))} aria-label="Siguiente"><ChevronRight/></button></div></div><div className="movie-track">{items.slice(offset,offset+6).map((item)=><article className="movie-card" key={item.id}><button className="poster-button" onClick={()=>onSelect(item)}><img src={item.poster_url || item.hero_image_url} alt={item.title}/><span className="poster-rating">{item.maturity_rating}</span></button><div className="card-hover"><b>{item.title}</b><div><button onClick={()=>onPlay(item)} aria-label="Reproducir"><Play fill="currentColor"/></button><button onClick={()=>onSelect(item)} aria-label="Información"><Info/></button></div><small>{item.release_year} · {item.category}</small></div></article>)}</div></section>;
}
