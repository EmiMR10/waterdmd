"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "register";
type Role = "guest" | "host";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("guest");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url =
        mode === "register"
          ? "/api/auth/register"
          : "/api/auth/login";

      const body =
        mode === "register"
          ? { name, email, password, role }
          : { email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocurrió un error");
        return;
      }

      if (mode === "register") {
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!loginResponse.ok) {
          setMode("login");
          setError("Cuenta creada. Ahora inicia sesión.");
          return;
        }
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="empty-page">
      <p className="eyebrow">Tu cuenta</p>

      <h1>
        {mode === "login"
          ? "Inicia sesión en WaterDMD"
          : "Crea tu cuenta"}
      </h1>

      <p>
        {mode === "login"
          ? "Accede a tus reservas y estancias guardadas."
          : "Elige cómo quieres usar WaterDMD."}
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <button
          type="button"
          className={
            mode === "login"
              ? "button button--coral"
              : "button"
          }
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          className={
            mode === "register"
              ? "button button--coral"
              : "button"
          }
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Crear cuenta
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          display: "grid",
          gap: "14px",
          margin: "0 auto",
        }}
      >
        {mode === "register" && (
          <>
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              style={{ padding: "14px" }}
            />

            <div>
              <p style={{ marginBottom: "10px" }}>
                ¿Cómo quieres usar WaterDMD?
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setRole("guest")}
                  className={
                    role === "guest"
                      ? "button button--coral"
                      : "button"
                  }
                >
                  Huésped
                </button>

                <button
                  type="button"
                  onClick={() => setRole("host")}
                  className={
                    role === "host"
                      ? "button button--coral"
                      : "button"
                  }
                >
                  Anfitrión
                </button>
              </div>
            </div>
          </>
        )}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{ padding: "14px" }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          style={{ padding: "14px" }}
        />

        {error && (
          <p style={{ color: "#b42318" }}>
            {error}
          </p>
        )}

        <button
          className="button button--coral"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Procesando..."
            : mode === "login"
            ? "Iniciar sesión"
            : "Crear mi cuenta"}
        </button>
      </form>

      <Link
        className="text-link"
        href="/"
        style={{ marginTop: "24px" }}
      >
        Volver a explorar
      </Link>
    </main>
  );
}
