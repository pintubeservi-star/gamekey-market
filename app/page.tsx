"use client";
import { ArrowDown, ArrowRight, Download, Gamepad2, Menu, ShieldAlert, Smartphone, X } from "lucide-react";
import { useState } from "react";

const shots = [
 {src:"https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_14.10e7v.06pcm_t.jpg?akim=1&imdensity=1&imwidth=1600",alt:"Jason y Lucia",label:"JASON & LUCIA"},
 {src:"https://www.rockstargames.com/VI/_next/static/media/Vice_City_13.0iq8ff474tsdx.jpg?akim=1&imdensity=1&imwidth=1600",alt:"Vice City",label:"VICE CITY"},
 {src:"https://www.rockstargames.com/VI/_next/static/media/Leonida_Keys_07.0z9tb69ssp4rq.jpg?akim=1&imdensity=1&imwidth=1600",alt:"Leonida Keys",label:"LEONIDA KEYS"}
];
export default function Home(){
 const [menuOpen,setMenuOpen]=useState(false);
 const scrollTo=(id:string)=>{document.getElementById(id)?.scrollIntoView({behavior:"smooth"});setMenuOpen(false)};
 return <main className="gta-page">
  <section className="gta-video-intro" aria-label="Intro cinematográfica de GTA">
   <iframe src="https://drive.google.com/file/d/1v1NT5-i9abHRno_uNASCGWX8Cwt9HBdX/preview?autoplay=1" title="Intro de GTA" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>
   <div className="gta-video-caption"><span>GAMEKEY MARKET PRESENTS</span><b>VICE CITY IS CALLING</b><a href="#top">ENTRAR AL SITIO <ArrowDown size={14}/></a></div>
  </section>
  <div className="gta-topline"><span>GAMEKEY MARKET ORIGINALS</span><span>LEONIDA · USA　/　2026</span></div>
  <header className="gta-header">
   <a className="gta-logo" href="#top"><span className="gta-logo-icon"><Gamepad2 size={22}/></span><span>GAMEKEY <b>MARKET</b><small>THE DIGITAL GAME DISTRICT</small></span></a>
   <nav className={menuOpen?"gta-nav open":"gta-nav"}><button onClick={()=>scrollTo("world")}>EL JUEGO</button><button onClick={()=>scrollTo("gallery")}>GALERÍA</button><button onClick={()=>scrollTo("android")}>ANDROID</button></nav>
   <button className="gta-menu" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Menú">{menuOpen?<X/>:<Menu/>}</button>
   <button className="gta-header-cta" onClick={()=>scrollTo("android")}>VERSIÓN ANDROID <ArrowRight size={15}/></button>
  </header>
  <section className="gta-hero" id="top"><div className="gta-hero-art"/><div className="gta-hero-shade"/>
   <div className="gta-hero-copy"><div className="gta-overline"><span/> ROCKSTAR'S WORLD · LEONIDA</div><div className="gta-logo-title">VI</div>
    <h1>GRAND THEFT<br/><em>AUTO</em></h1><p className="gta-hero-sub">BIENVENIDO A VICE CITY.</p>
    <p className="gta-hero-text">Una ciudad que nunca duerme. Dos protagonistas. Un mundo abierto donde cada decisión escribe tu propia historia.</p>
    <div className="gta-hero-actions"><button className="gta-main-btn" onClick={()=>scrollTo("android")}>EXPLORAR ANDROID <Download size={17}/></button><button className="gta-ghost-btn" onClick={()=>scrollTo("gallery")}>DESCUBRIR EL JUEGO <ArrowDown size={15}/></button></div>
    <div className="gta-platform-note"><span>GAMEKEY MARKET</span><span>FAN PAGE INDEPENDIENTE</span></div>
   </div><div className="gta-hero-index">VICE CITY <b>01 / 03</b></div><div className="gta-hero-bottom"><span>THE CITY IS YOURS</span><span>SCROLL TO EXPLORE ↓</span></div>
  </section>
  <section className="gta-intro" id="world"><div className="gta-intro-label">01 — EL UNIVERSO</div><div className="gta-intro-main"><p className="gta-kicker">EL REGRESO A VICE CITY</p><h2>EL PARAÍSO<br/>TIENE <em>OTRO LADO.</em></h2><p>Explora el estado de Leonida, desde las luces de Vice City hasta sus carreteras, playas y rincones más salvajes. La historia sigue a Jason y Lucia en una aventura criminal de alto riesgo.</p><div className="gta-facts"><div><b>2</b><span>PROTAGONISTAS</span></div><div><b>1</b><span>ESTADO: LEONIDA</span></div><div><b>∞</b><span>POSIBILIDADES</span></div></div></div><div className="gta-intro-image"><img src={shots[0].src} alt="Jason y Lucia"/><span>JASON & LUCIA — PARTNERS IN CRIME</span></div></section>
  <section className="gta-gallery" id="gallery"><div className="gta-section-heading"><div><span className="gta-kicker">02 — CAPTURAS OFICIALES</span><h2>POSTALES DE <em>LEONIDA.</em></h2></div><a href="https://www.rockstargames.com/VI/media/screenshots" target="_blank" rel="noreferrer">GALERÍA ROCKSTAR <ArrowRight size={15}/></a></div>
   <div className="gta-shot-grid">{shots.map((s,i)=><figure className={"gta-shot shot-"+i} key={s.label}><img src={s.src} alt={s.alt}/><figcaption><span>0{i+1}</span>{s.label}</figcaption></figure>)}</div>
  </section>
  <section className="gta-android" id="android"><div className="gta-android-bg"/><div className="gta-android-copy"><div className="gta-kicker">03 — EXPERIENCIA MÓVIL</div><h2>VICE CITY<br/><em>EN TU ANDROID.</em></h2><p>Estamos preparando el espacio para publicar el paquete comprimido que has preparado. Aquí encontrarás los detalles del archivo, instrucciones de instalación y el acceso de descarga cuando esté cargado.</p>
   <div className="gta-download-panel"><div className="gta-download-icon"><Smartphone size={25}/></div><div className="gta-download-info"><b>PAQUETE ANDROID</b><span>Archivo de instalación · publicación pendiente</span></div><span className="gta-status">PRÓXIMAMENTE</span></div>
   <div className="gta-android-note"><ShieldAlert size={17}/><span>Esta página es independiente y no está afiliada a Rockstar Games. GTA VI no tiene una versión oficial para Android anunciada por Rockstar. Publica únicamente archivos que tengas autorización para distribuir y verifica su seguridad antes de instalarlos.</span></div>
  </div><div className="gta-phone-art"><div className="gta-phone-frame"><img src={shots[1].src} alt="Vice City"/><div className="gta-phone-overlay"><span>GAMEKEY MARKET</span><b>VICE CITY<br/>GOES MOBILE</b><small>ANDROID EDITION · COMMUNITY</small></div></div></div></section>
  <section className="gta-final"><span className="gta-kicker">GAMEKEY MARKET PRESENTS</span><h2>LA CIUDAD<br/><em>TE ESTÁ LLAMANDO.</em></h2><button className="gta-main-btn" onClick={()=>scrollTo("android")}>IR A ANDROID <ArrowRight size={17}/></button></section>
  <footer className="gta-footer"><a className="gta-logo" href="#top"><span className="gta-logo-icon"><Gamepad2 size={20}/></span><span>GAMEKEY <b>MARKET</b><small>DIGITAL GAME DISTRICT</small></span></a><p>Un espacio independiente para fans de los videojuegos.</p><div className="gta-footer-legal">GRAND THEFT AUTO, GTA VI Y SUS ELEMENTOS RELACIONADOS SON MARCAS Y PROPIEDAD DE SUS RESPECTIVOS TITULARES. ESTA PÁGINA NO ES OFICIAL NI ESTÁ PATROCINADA POR ROCKSTAR GAMES.</div><div className="gta-footer-bottom"><span>© 2026 GAMEKEY MARKET</span><a href="https://www.rockstargames.com/VI" target="_blank" rel="noreferrer">SITIO OFICIAL DE GTA VI ↗</a></div></footer>
 </main>
}