import Link from "next/link";

export default function NotFound() {
  return <main className="empty-page"><p className="eyebrow">Error 404</p><h1>Esta pista todavía no aparece en la guía.</h1><Link className="button button--coral" href="/">Volver a explorar</Link></main>;
}
