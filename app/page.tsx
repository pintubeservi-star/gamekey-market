"use client";

import { useEffect } from "react";
import { ArrowDown, ArrowRight, CheckCircle2, Download, Gamepad2, ShieldCheck, Smartphone, Zap } from "lucide-react";

declare global {
  interface Window { paypal?: { HostedButtons: (args: { hostedButtonId: string }) => { render: (selector: string) => Promise<unknown> | unknown } } }
}

export default function Home() {
  useEffect(() => {
    const container = document.getElementById("paypal-container-G9SNDRRG5PDZN");
    if (!container) return;
    const renderButton = () => {
      if (window.paypal && !container.dataset.paypalRendered) {
        container.dataset.paypalRendered = "true";
        window.paypal.HostedButtons({ hostedButtonId: "G9SNDRRG5PDZN" }).render("#paypal-container-G9SNDRRG5PDZN");
      }
    };
    if (window.paypal) {
      renderButton();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-gta-paypal="true"]');
    if (existing) {
      existing.addEventListener("load", renderButton);
      return () => existing.removeEventListener("load", renderButton);
    }
    const script = document.createElement("script");
    script.dataset.gtaPaypal = "true";
    script.src = "https://www.paypal.com/sdk/js?client-id=BAAlFzwu03LxQ-hFxYtajTJnIUxXD5ineu4oqSAfpgMjYrhXl8fn5HtOspodzQrK4CFlm3lICc1S_78bFM&components=hosted-buttons&disable-funding=venmo&currency=USD";
    script.async = true;
    script.onload = renderButton;
    script.onerror = () => { container.textContent = "PayPal no está disponible en este momento. Recarga la página para intentarlo de nuevo."; };
    document.body.appendChild(script);
    return () => { script.onload = null; };
  }, []);

  const goToPay = () => document.getElementById("comprar")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="store-page">
      <div className="store-topline">GTA 6 MÓVILES <span>EDICIÓN DIGITAL PARA ANDROID</span><span className="top-status">VENTA DIGITAL</span></div>
      <header className="store-header">
        <a className="store-brand" href="#inicio"><span className="store-brand-icon"><Gamepad2 size={23}/></span><span>GTA 6 <b>MÓVILES</b><small>EXPERIENCIA DIGITAL ANDROID</small></span></a>
        <nav><a href="#detalles">DETALLES</a><a href="#requisitos">REQUISITOS</a><a href="#comprar">COMPRAR</a></nav>
        <button className="store-nav-cta" onClick={goToPay}>OBTENER ACCESO <ArrowRight size={15}/></button>
      </header>

      <section className="store-hero" id="inicio">
        <div className="store-hero-image"/>
        <div className="store-hero-overlay"/>
        <div className="store-hero-content">
          <div className="store-eyebrow"><span/> EDICIÓN DIGITAL · ANDROID</div>
          <div className="store-roman">VI</div>
          <h1>GRAND THEFT<br/><em>AUTO VI</em></h1>
          <p className="store-lead">LEONIDA EN LA PALMA DE TU MANO.</p>
          <p className="store-description">Descubre la propuesta digital para Android de GTA 6 Móviles. Consulta los detalles de esta edición y consigue acceso mediante un pago seguro procesado por PayPal.</p>
          <div className="store-hero-actions"><button onClick={goToPay} className="store-primary">COMPRAR POR US$5 <ArrowRight size={17}/></button><a href="#detalles" className="store-secondary">VER DETALLES <ArrowDown size={15}/></a></div>
          <div className="store-hero-foot"><span><ShieldCheck size={15}/> PAGO PROCESADO POR PAYPAL</span><span><Smartphone size={15}/> PARA ANDROID</span></div>
        </div>
        <div className="store-hero-caption">VICE CITY / LEONIDA</div>
      </section>

      <section className="store-value" id="detalles">
        <div className="store-section-tag">01 / LA EXPERIENCIA</div>
        <div className="store-value-copy"><span className="store-kicker">GTA 6 MÓVILES</span><h2>UNA NUEVA FORMA<br/>DE LLEVAR <em>LA ACCIÓN.</em></h2><p>Esta página ofrece una edición digital para Android distribuida de forma independiente. Antes de comprar, revisa los requisitos y la información técnica que acompañan al archivo. La disponibilidad y el funcionamiento dependen de la compatibilidad real de tu dispositivo.</p><div className="store-feature-row"><div><CheckCircle2/><b>Compra digital</b><small>Pago online con PayPal</small></div><div><Smartphone/><b>Enfoque Android</b><small>Consulta compatibilidad</small></div><div><Download/><b>Acceso digital</b><small>Tras confirmar el pago</small></div></div></div>
        <div className="store-art-card"><img src="https://www.rockstargames.com/VI/_next/static/media/Vice_City_13.0iq8ff474tsdx.jpg?akim=1&imdensity=1&imwidth=1600" alt="Paisaje de Vice City"/><span>VICE CITY · LEONIDA</span></div>
      </section>

      <section className="store-details-band" id="requisitos">
        <div><span className="store-kicker">02 / ANTES DE COMPRAR</span><h2>REVISA LOS<br/><em>DETALLES.</em></h2><p>Para evitar compras equivocadas, comprueba que tu móvil cumple los requisitos publicados por el distribuidor y que dispones de espacio suficiente. No se debe asumir compatibilidad universal con todos los teléfonos Android.</p></div>
        <div className="store-checklist"><div><span>01</span><p><b>Compatibilidad</b><small>Confirma versión de Android y modelo admitido en la ficha técnica del archivo.</small></p></div><div><span>02</span><p><b>Almacenamiento</b><small>Verifica el tamaño final de la descarga y el espacio libre necesario.</small></p></div><div><span>03</span><p><b>Conexión</b><small>Usa una conexión estable para descargar el contenido digital.</small></p></div><div><span>04</span><p><b>Distribución independiente</b><small>Esta tienda no está afiliada ni representa a Rockstar Games.</small></p></div></div>
      </section>

      <section className="store-buy" id="comprar">
        <div className="store-buy-copy"><span className="store-kicker">03 / ACCESO DIGITAL</span><h2>HAZLO TUYO<br/><em>POR US$5.</em></h2><p>Precio especial de lanzamiento para esta oferta digital.</p><div className="store-price"><span>US$</span><b>5</b><small>USD · PAGO ÚNICO</small></div><ul><li><CheckCircle2/> Pago procesado por PayPal</li><li><CheckCircle2/> Compra digital</li><li><CheckCircle2/> Revisa los requisitos antes de pagar</li></ul></div>
        <div className="store-checkout"><div className="store-checkout-head"><ShieldCheck/><div><b>CHECKOUT SEGURO</b><small>Completa tu pago con PayPal</small></div></div><div id="paypal-container-G9SNDRRG5PDZN" className="paypal-hosted" aria-label="Botón de pago PayPal"></div><p className="store-paypal-note">El importe definitivo lo determina la configuración del botón alojado en PayPal. Confirma que ese botón esté configurado en US$5 antes de aceptar pagos.</p></div>
      </section>

      <section className="store-delivery"><Zap/><div><b>IMPORTANTE SOBRE LA ENTREGA</b><p>El botón de PayPal procesa el pago, pero esta página todavía no valida automáticamente la transacción ni libera una descarga protegida. No se mostrará un enlace de descarga hasta configurar la confirmación del pago y la entrega segura del archivo.</p></div></section>


      <footer className="store-footer"><a className="store-brand" href="#inicio"><span className="store-brand-icon"><Gamepad2 size={20}/></span><span>GTA 6 <b>MÓVILES</b><small>EDICIÓN DIGITAL INDEPENDIENTE</small></span></a><p>Distribución independiente. No afiliada, patrocinada ni aprobada por Rockstar Games o Take-Two Interactive.</p><small>Grand Theft Auto, GTA y los elementos relacionados son marcas de sus respectivos propietarios. Las imágenes promocionales pertenecen a sus titulares y se muestran con fines de identificación editorial.</small></footer>
    </main>
  );
}
