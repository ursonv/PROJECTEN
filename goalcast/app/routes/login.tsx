import { useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { Link, useNavigate } from "@remix-run/react";

const supabase = createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    else navigate("/");

    setLoading(false);
  }

  async function handleOAuthLogin() {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Deze route handelt de code-exchange + normalisatie af
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // optioneel, maar handig voor consistente velden
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="c-auth-form">
        <div className="c-auth-form__logo mb-3">
          <img
            src="/logo-dark.png"
            alt="logo-dark"
            className="c-auth-form__logo--img"
          />
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div className="mb-3 c-auth-form__section">
            <label className="form-label c-auth-form__section--label">
              Email
            </label>
            <input
              type="email"
              className="form-control c-auth-form__section--input"
              placeholder="user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="mb-4 c-auth-form__section">
            <label className="form-label c-auth-form__section--label">
              Wachtwoord
            </label>
            <input
              type="password"
              className="form-control c-auth-form__section--input"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

          <button
            type="submit"
            className="btn c-auth-form__button"
            disabled={loading}
          >
            {loading ? "Even geduld…" : "Login"}
          </button>
        </form>

        <div className="text-center mt-5 mb-3 c-auth-form__line-section">
          <span className="c-auth-form__line-section--line-1"></span>
          <span>Social Logins</span>
          <span className="c-auth-form__line-section--line-2"></span>
        </div>

        <div className="d-flex justify-content-center c-auth-form__social-btn mb-4">
          <button
            className="btn c-auth-form__social-btn--button rounded-circle"
            onClick={handleOAuthLogin}
            style={{ width: 45, height: 45 }}
            disabled={loading}
          >
            <i className="fa-brands fa-google"></i>
          </button>
        </div>

        <div className="text-center c-auth-form__link">
          Nog geen account?
          <Link to="/register">
            <div className="c-auth-form__link--other">Registreren</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
