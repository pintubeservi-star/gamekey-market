"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Check, ChevronDown, Gamepad2, Headphones, Menu, PackageCheck, Search, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, X, Zap } from "lucide-react";

type Product = { id: number; name: string; platform: string; category: string; price: number; oldPrice?: number; tag: string; image: string; description: string };
const products: Product[] = [
  { id: 1, name: "Grand Theft Auto VI", platform: "PS5 · Xbox Series X|S", category: "Acción", price: 5, tag: "DESTACADO", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85", description: "Ficha de demostración. No incluye código, licencia ni acceso al videojuego." },
  { id: 2, name: "Cyberpunk 2077", platform: "PC · PS5 · Xbox", category: "RPG", price: 19.99, oldPrice: 39.99, tag: "OFERTA DEMO", image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=900&q=85", description: "Producto de muestra para probar la experiencia de catálogo." },
  { id: 3, name: "Elden Ring", platform: "PC · PS5 · Xbox", category: "Aventura", price: 29.99, tag: "POPULAR", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85", description: "Producto de muestra para probar la experiencia de catálogo." },
  { id: 4, name: "Forza Horizon", platform: "PC · Xbox", category: "Carreras", price: 24.99, tag: "RECOMENDADO", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85", description: "Producto de muestra para probar la experiencia de catálogo." },
];

const money = (n: number) => "$" + n.toFixed(2);

export default function Home() {
  const [cart, setCart] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [platform, setPlatform] = useState("PS5");
  const [edition, setEdition] = useState("Estándar");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [view, setView] = useState<"home" | "catalog" | "cart" | "checkout" | "orders" | "admin">("home");
  const [email, setEmail] = useState("");
  const [orderDone, setOrderDone] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);
  const filtered = products.filter(p => (category === "Todos" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase()));

  function addToCart(product: Product) {
    setCart(prev => [...prev, product]);
    setSelected(null);
    setNotice("Añadido al carrito de demostración");
    window.setTimeout(() => setNotice(""), 2600);
  }

  function nav(next: typeof view) { setView(next); setMobileMenu(false); setSelected(null); }

  return (
    <main className="site-shell">
      <div className="announcement"><Sparkles size={13}/> EXPERIENCIA DE TIENDA DIGITAL · PROTOTIPO INTERACTIVO <span>NO SE REALIZAN COBROS REALES</span></div>
      <header className="header">
        <button className="brand" onClick={() => nav("home")}><span className="brand-mark"><Gamepad2 size={22}/></span><span>GAMEKEY<span className="brand-light"> MARKET</span><small>DIGITAL GAME STORE</small></span></button>
        <nav className={mobileMenu ? "nav open" : "nav"}>
          <button className={view === "home" ? "active" : ""} onClick={() => nav("home")}>Inicio</button>
          <button className={view === "catalog" ? "active" : ""} onClick={() => nav("catalog")}>Videojuegos</button>
          <button onClick={() => nav("orders")}>Mis pedidos</button>
        </nav>
        <div className="header-actions">
          <button className="icon-btn" aria-label="Buscar" onClick={() => nav("catalog")}><Search size={19}/></button>
          <button className="cart-btn" onClick={() => nav("cart")}><ShoppingCart size={18}/> <span>Carrito</span><b>{cart.length}</b></button>
          <button className="icon-btn mobile-toggle" aria-label="Menú" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button>
        </div>
      </header>

      {view === "home" && <>
        <section className="hero">
          <div className="hero-bg"/>
          <div className="hero-content">
            <div className="eyebrow"><span/> EL UNIVERSO GAMING TE ESPERA</div>
            <p className="hero-kicker">PRÓXIMA GENERACIÓN. NUEVAS HISTORIAS.</p>
            <h1>PLAY THE<br/><em>NEXT LEVEL.</em></h1>
            <p className="hero-copy">Descubre títulos destacados, explora plataformas y encuentra tu próxima aventura.</p>
            <div className="hero-buttons"><button className="primary-btn" onClick={() => nav("catalog")}>EXPLORAR CATÁLOGO <ArrowRight size={17}/></button><button className="text-btn" onClick={() => {setSelected(products[0]);setPlatform("PS5");}}>VER DESTACADO <ChevronDown size={16}/></button></div>
            <div className="hero-proof"><span><ShieldCheck size={15}/> Catálogo organizado</span><span><Zap size={15}/> Experiencia digital</span></div>
          </div>
          <div className="hero-side-note">GAMEKEY MARKET <span>01 / 04</span></div>
          <div className="hero-bottom"><span>DISCOVER · CHOOSE · PLAY</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>
        <section className="trust-strip"><div><ShieldCheck/><span><b>Compra transparente</b><small>Información clara del producto</small></span></div><div><Zap/><span><b>Experiencia digital</b><small>Flujo de compra simplificado</small></span></div><div><Headphones/><span><b>Atención al cliente</b><small>Soporte y seguimiento</small></span></div><div><BadgeCheck/><span><b>Productos verificables</b><small>Licencias sujetas a proveedor</small></span></div></section>
        <section className="section">
          <div className="section-heading"><div><div className="eyebrow">SELECCIÓN GAMEKEY</div><h2>JUEGOS <em>DESTACADOS</em></h2><p>Una muestra del catálogo que tendrá la tienda.</p></div><button className="view-all" onClick={() => nav("catalog")}>VER CATÁLOGO <ArrowRight size={16}/></button></div>
          <div className="product-grid">{products.slice(0,3).map(p => <ProductCard key={p.id} product={p} onClick={() => setSelected(p)}/>)}</div>
        </section>
        <section className="promo-band"><div><div className="eyebrow">TU PRÓXIMA AVENTURA</div><h2>ELIGE TU JUEGO.<br/><em>PREPARA EL MANDO.</em></h2><p>Explora por género y plataforma desde un solo lugar.</p></div><button className="primary-btn" onClick={() => nav("catalog")}>DESCUBRIR JUEGOS <ArrowRight size={17}/></button></section>
      </>}

      {view === "catalog" && <section className="section page-section"><div className="eyebrow">GAMEKEY MARKET / CATÁLOGO</div><h2>EXPLORA <em>VIDEOJUEGOS</em></h2><p className="muted">Productos de muestra para evaluar la tienda.</p><div className="catalog-tools"><div className="search-field"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar videojuegos..."/></div><div className="chips">{["Todos","Acción","RPG","Aventura","Carreras"].map(c => <button className={category===c?"chip selected":"chip"} key={c} onClick={() => setCategory(c)}>{c}</button>)}</div></div><div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => setSelected(p)}/>)}</div>{filtered.length===0 && <p className="empty">No encontramos productos con esa búsqueda.</p>}</section>}

      {view === "cart" && <section className="section page-section"><div className="eyebrow">GAMEKEY MARKET / CARRITO</div><h2>TU <em>CARRITO</em></h2>{cart.length===0 ? <div className="empty-state"><ShoppingBag size={38}/><h3>Tu carrito está vacío</h3><p>Explora el catálogo y agrega productos de demostración.</p><button className="primary-btn" onClick={() => nav("catalog")}>EXPLORAR JUEGOS <ArrowRight size={16}/></button></div> : <div className="checkout-layout"><div className="cart-list">{cart.map((p,i)=><div className="cart-line" key={i}><img src={p.image} alt=""/><div><b>{p.name}</b><small>{p.platform}</small><button className="remove" onClick={() => setCart(prev=>prev.filter((_,j)=>j!==i))}>Eliminar</button></div><strong>{money(p.price)}</strong></div>)}</div><aside className="summary"><h3>RESUMEN</h3><div><span>Subtotal</span><b>{money(total)}</b></div><div><span>Impuestos</span><b>US$0.00</b></div><div className="summary-total"><span>Total simulado</span><b>{money(total)}</b></div><button className="primary-btn full" onClick={() => nav("checkout")}>CONTINUAR <ArrowRight size={16}/></button><small>Este prototipo no procesa pagos.</small></aside></div>}</section>}

      {view === "checkout" && <section className="section page-section"><div className="eyebrow">GAMEKEY MARKET / CHECKOUT</div><h2>FINALIZAR <em>PEDIDO</em></h2><div className="checkout-layout"><div className="form-panel"><div className="demo-alert"><ShieldCheck size={18}/> MODO DEMOSTRACIÓN — NO SE COBRARÁ DINERO</div><label>Correo electrónico</label><input className="form-input" type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/><label>País</label><select className="form-input" defaultValue="DO"><option value="DO">República Dominicana</option><option value="US">Estados Unidos</option><option value="OTHER">Otro</option></select><button className="primary-btn full" disabled={!email.includes("@") || cart.length===0} onClick={() => {setOrderDone(true);setCart([]);nav("orders");}}>SIMULAR PEDIDO <ArrowRight size={16}/></button><p className="muted tiny">No se solicitan datos de tarjetas ni se transmite información de pago.</p></div><aside className="summary"><h3>RESUMEN DEL PEDIDO</h3><div><span>Artículos</span><b>{cart.length}</b></div><div className="summary-total"><span>Total simulado</span><b>{money(total)}</b></div></aside></div></section>}

      {view === "orders" && <section className="section page-section"><div className="eyebrow">GAMEKEY MARKET / CUENTA</div><h2>MIS <em>PEDIDOS</em></h2><div className="empty-state">{orderDone ? <><Check size={42}/><h3>Pedido de prueba creado</h3><p>La simulación terminó correctamente. No se realizó ningún cobro ni se emitió una licencia.</p></> : <><PackageCheck size={42}/><h3>Aún no tienes pedidos</h3><p>Cuando realices una compra de demostración, aparecerá aquí.</p></>}<button className="primary-btn" onClick={() => nav("catalog")}>VOLVER AL CATÁLOGO</button></div></section>}

      {view === "admin" && <section className="section page-section"><div className="eyebrow">GAMEKEY MARKET / ADMINISTRACIÓN</div><h2>PANEL <em>DE CONTROL</em></h2><div className="admin-grid"><div className="admin-card"><span>Productos de muestra</span><b>04</b></div><div className="admin-card"><span>Artículos en carrito actual</span><b>{cart.length}</b></div><div className="admin-card"><span>Estado de pagos</span><b>OFF</b></div></div><div className="demo-alert">Panel demostrativo. No existe inventario de licencias ni pedidos reales conectados.</div></section>}

      <footer className="footer"><div className="footer-top"><div className="brand footer-brand"><span className="brand-mark"><Gamepad2 size={22}/></span><span>GAMEKEY<span className="brand-light"> MARKET</span><small>DIGITAL GAME STORE</small></span></div><p>Tu espacio para descubrir videojuegos.</p><button className="footer-admin" onClick={() => nav("admin")}>Panel demo</button></div><div className="footer-bottom"><span>© 2026 GAMEKEY MARKET · PROTOTIPO</span><span>Independiente. No afiliado a Rockstar Games ni a otros editores.</span></div></footer>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="product-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X/></button><img className="modal-image" src={selected.image} alt=""/><div className="modal-body"><div className="eyebrow">{selected.tag} · FICHA DE DEMOSTRACIÓN</div><h2>{selected.name}</h2><p>{selected.description}</p><div className="platform-picker"><label>Plataforma</label><div className="chips">{(selected.id===1?["PS5","Xbox"]:["PC","PS5","Xbox"]).map(p=><button className={platform===p?"chip selected":"chip"} key={p} onClick={()=>setPlatform(p)}>{p}</button>)}</div></div><div className="platform-picker"><label>Edición</label><div className="chips">{["Estándar","Deluxe"].map(e=><button className={edition===e?"chip selected":"chip"} key={e} onClick={()=>setEdition(e)}>{e}</button>)}</div></div><div className="modal-buy"><strong>{money(selected.price)}</strong><button className="primary-btn" onClick={() => addToCart(selected)}>AÑADIR AL CARRITO <ShoppingCart size={16}/></button></div><div className="demo-alert"><ShieldCheck size={17}/> Producto demostrativo: no incluye licencia ni código de activación.</div></div></div></div>}
      {notice && <div className="toast"><Check size={17}/>{notice}</div>}
    </main>
  );
}

function ProductCard({product,onClick}:{product:Product;onClick:()=>void}) {
  return <article className="product-card"><button className="product-image" onClick={onClick}><img src={product.image} alt=""/><span className="product-tag">{product.tag}</span><span className="quick-view">VER DETALLES <ArrowRight size={14}/></span></button><div className="product-info"><div className="product-category">{product.category} <span>{product.platform}</span></div><h3>{product.name}</h3><div className="product-price"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}<button onClick={onClick} aria-label="Ver producto"><ArrowRight size={18}/></button></div></div></article>;
}
