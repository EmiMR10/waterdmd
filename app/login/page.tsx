import Link from "next/link";

export default function LoginPage() { return <main className="empty-page"><p className="eyebrow">Tu cuenta</p><h1>Inicia sesión para guardar estancias y administrar tus reservas.</h1><Link className="button button--coral" href="/api/auth/signin">Continuar con GitHub</Link><Link className="text-link" href="/">Volver a explorar</Link></main>; }
