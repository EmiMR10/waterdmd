import Link from "next/link";
import { Menu, UserRound } from "lucide-react";

export function Brand() {
  return <Link className="brand" href="/" aria-label="waterdmd, inicio"><span className="brand__mark"><img src="/media/mini-airbnb-mark-mexican.png" alt="" /></span><span className="brand__wordmark">waterdmd</span></Link>;
}

export function SiteHeader({ detail = false }: { detail?: boolean }) {
  return (
    <header className={`site-header ${detail ? "site-header--detail" : ""}`}>
      <Brand />
      {!detail && <nav className="main-nav"><Link href="/#explorar">Explorar</Link><Link href="/#pistas">Pistas locales</Link><Link href="/#como-funciona">Cómo funciona</Link></nav>}
      <div className="header-actions"><Link className="host-link" href="/mis-reservas">Mis reservas</Link><Link className="profile-button" aria-label="Abrir tu cuenta" href="/api/auth/signin"><Menu size={17} /><UserRound size={17} /></Link></div>
    </header>
  );
}
