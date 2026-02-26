import { useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { Link, useNavigate } from "@remix-run/react";

const supabase = createBrowserClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export default function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!firstName.trim()) return setErrorMessage("Voornaam is verplicht.");
    if (!lastName.trim()) return setErrorMessage("Achternaam is verplicht.");
    if (!email.trim() || !validateEmail(email))
      return setErrorMessage("Voer een geldig e-mailadres in.");
    if (password.length < 6)
      return setErrorMessage("Wachtwoord moet minstens 6 tekens bevatten.");
    if (password !== repeatPassword)
      return setErrorMessage("Wachtwoorden komen niet overeen.");

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          profile_image_url: "/default-avatar-photo.jpg",
          firstName,
          lastName,
          avatar_url: "/default-avatar-photo.jpg",
        },
      },
    });

    if (!error) navigate("/");
    else setErrorMessage(error.message);

    setLoading(false);
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
        <form onSubmit={handleRegister} noValidate>
          <div className="mb-3 c-auth-form__section">
            <label className="form-label c-auth-form__section--label">
              Voornaam
            </label>
            <input
              type="text"
              className="form-control c-auth-form__section--input"
              placeholder="Voornaam"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="mb-3 c-auth-form__section">
            <label className="form-label c-auth-form__section--label">
              Achternaam
            </label>
            <input
              type="text"
              className="form-control c-auth-form__section--input"
              placeholder="Achternaam"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>
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
            />
          </div>
          <div className="mb-3 c-auth-form__section">
            <label className="form-label c-auth-form__section--label">
              Wachtwoord
            </label>
            <input
              type="password"
              className="form-control c-auth-form__section--input"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="mb-5 c-auth-form__section">
            <label className="form-label c-auth-form__section--label">
              Bevestig wachtwoord
            </label>
            <input
              type="password"
              className="form-control c-auth-form__section--input"
              placeholder="******"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {errorMessage && (
            <div className="alert alert-danger py-2 mb-4">{errorMessage}</div>
          )}
          <button
            type="submit"
            className="btn c-auth-form__button"
            disabled={loading}
          >
            {loading ? "Even geduld…" : "Registreren"}
          </button>
        </form>
        <div className="text-center c-auth-form__link mt-4">
          Heb je al een account?
          <Link to="/login">
            <div className="c-auth-form__link--other">login</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
