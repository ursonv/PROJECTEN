import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import { createBrowserClient } from "@supabase/auth-helpers-remix";

const supabase = createBrowserClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const params = new URLSearchParams(location.search);

      const oauthErr = params.get("error");
      const oauthDesc = params.get("error_description");
      if (oauthErr) {
        setError(decodeURIComponent(oauthDesc ?? oauthErr));
        navigate("/", { replace: true });
        return;
      }

      if (!params.get("code")) {
        navigate("/", { replace: true });
        return;
      }

      const { error: exchError } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );
      if (exchError) {
        setError(exchError.message);
        navigate("/", { replace: true });
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("settings").upsert(
          {
            user_id: session.user.id,
            notifications_enabled: true,
            email_notifications: true,
            push_notifications: true,
            dark_mode: false,
            default_view: "folders",
          },
          { onConflict: "user_id" }
        );
        navigate("/", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    })();
  }, [location.search, navigate]);

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-light">
      <div className="text-center">
        <div
          className="spinner-border text-warning mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        />
        <h2>Even geduld… je wordt doorgestuurd.</h2>
      </div>
    </div>
  );
}
