import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  data,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { uploadAvatar, uploadLogo } from "~/utils/storage";
import Modal from "~/components/popup/Modal";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  await supabase.auth.refreshSession();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Response("Niet ingelogd", { status: 401 });

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle(); // ← voorkomt error als er nog geen rij is

  return data({ user, settings }, { headers: response.headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Response("Niet ingelogd", { status: 401 });

  const { data: existingSettings, error: fetchErr } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr) {
    console.error("Settings ophalen faalde:", fetchErr);
    return data({ error: "Fout bij ophalen instellingen." }, { status: 500 });
  }

  const first_name = (form.get("first_name") as string | null)?.trim() || "";
  const last_name  = (form.get("last_name") as string | null)?.trim() || "";
  const full_name  = [first_name, last_name].filter(Boolean).join(" ");
  const email      = (form.get("email") as string | null)?.trim() || "";
  const password   = (form.get("password") as string | null) || "";
  const confirmPassword = (form.get("confirm_password") as string | null) || "";

  const hasPrimary   = form.has("accent_color_primary");
  const hasSecondary = form.has("accent_color_secondary");
  const hasBg        = form.has("background_color");
  const hasNotif     = form.has("notifications");

  const accent_color_primary = hasPrimary
    ? String(form.get("accent_color_primary"))
    : (existingSettings?.accent_color_primary ?? "#000000");

  const accent_color_secondary = hasSecondary
    ? String(form.get("accent_color_secondary"))
    : (existingSettings?.accent_color_secondary ?? "#ffffff");

  const background_color = hasBg
    ? String(form.get("background_color"))
    : (existingSettings?.background_color ?? "#ffffff");

  const notifications_enabled = hasNotif
    ? form.get("notifications") === "on"
    : (existingSettings?.notifications_enabled ?? true);

  let logo_url = existingSettings?.logo_url || "";

  const profileFile = form.get("profile_file");
  const logoFile    = form.get("logo_file");

  if (profileFile instanceof File && profileFile.size > 0) {
    try {
      const avatarUrl = await uploadAvatar(profileFile, user.id);
      if (avatarUrl) {

      }
    } catch (e) {
      console.error("Avatar upload faalde:", e);
    }
  }

  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      const lUrl = await uploadLogo(logoFile, user.id);
      if (lUrl) logo_url = lUrl;
    } catch (e) {
      console.error("Logo upload faalde:", e);
    }
  }

  if (password && password !== confirmPassword) {
    return data({ error: "Wachtwoorden komen niet overeen." }, { status: 400 });
  }

  const userMetadata: Record<string, string> = {};
  if (first_name) { userMetadata.first_name = first_name; userMetadata.firstName = first_name; }
  if (last_name)  { userMetadata.last_name  = last_name;  userMetadata.lastName  = last_name; }
  if (full_name)  { userMetadata.full_name  = full_name; }

  const updates: {
    email?: string;
    password?: string;
    data?: Record<string, string>;
  } = {};
  if (email && email !== user.email) updates.email = email;
  if (password) updates.password = password;
  if (Object.keys(userMetadata).length > 0) updates.data = userMetadata;

  if (Object.keys(updates).length > 0) {
    const { error: authErr } = await supabase.auth.updateUser(updates);
    if (authErr) {
      console.error("Auth update faalde:", authErr);
      return data({ error: `Update mislukt: ${authErr.message}` }, { status: 500 });
    }
  }

  const payload = {
    user_id: user.id,
    accent_color_primary,
    accent_color_secondary,
    background_color,
    logo_url,
    notifications_enabled,
  };

  const { data: updRows, error: updErr } = await supabase
    .from("settings")
    .update(payload)
    .eq("user_id", user.id)
    .select("user_id"); 

  if (updErr) {
    console.error("Settings update faalde:", updErr);
    return data({ error: "Opslaan mislukt (update)." }, { status: 500 });
  }

  if (!updRows || updRows.length === 0) {
    const { error: insErr } = await supabase.from("settings").insert(payload);
    if (insErr) {
      console.error("Settings insert faalde:", insErr);
      return data({ error: "Opslaan mislukt (insert)." }, { status: 500 });
    }
  }

  return redirect("/instellingen", { headers: response.headers });
}



export default function InstellingenPagina() {
  const { user, settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const meta: any = user.user_metadata || {};

  const resolveFirstName =
    meta.first_name ||
    meta.firstName ||
    meta.given_name ||
    (meta.full_name ? String(meta.full_name).split(" ")[0] : "") ||
    "";

  const resolveLastName =
    meta.last_name ||
    meta.lastName ||
    meta.family_name ||
    (meta.full_name ? String(meta.full_name).split(" ").slice(1).join(" ") : "") ||
    "";

  const resolveAvatar =
    meta.profile_image_url ||
    meta.avatar_url ||
    meta.picture ||
    "/default-avatar-photo.jpg";

  const [activeTab, setActiveTab] = useState<"profiel" | "notificaties" | "standaard">("profiel");
  const [avatarPreview, setAvatarPreview] = useState(resolveAvatar);
  const [logoPreview, setLogoPreview] = useState(settings?.logo_url || "/default-avatar-photo.jpg");

  useEffect(() => {
    if (meta?.profile_image_url || meta?.avatar_url || meta?.picture) {
      setAvatarPreview(resolveAvatar);
    }
    if (settings?.logo_url) setLogoPreview(settings.logo_url);
  }, [meta, settings]);

  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function submitSettings() {
    if (!formRef.current) return;
    formRef.current.requestSubmit ? formRef.current.requestSubmit() : formRef.current.submit();
    setConfirmOpen(false);
  }

  return (
    <>
      <h1 data-tour="instelling-title">Instellingen</h1>
      <div className="instellingen__container">
        <div className="instellingen__sidebar">
          <div className="instellingen__tabs">
            <button
              className={`instellingen__tab ${activeTab === "profiel" ? "active" : ""}`}
              onClick={() => setActiveTab("profiel")}
              data-tour="instelling-profile"
            >
              Profiel
            </button>
            <button
              className={`instellingen__tab ${activeTab === "notificaties" ? "active" : ""}`}
              onClick={() => setActiveTab("notificaties")}
              data-tour="instelling-notificatie"
            >
              Notificaties
            </button>
            <button
              className={`instellingen__tab ${activeTab === "standaard" ? "active" : ""}`}
              onClick={() => setActiveTab("standaard")}
              data-tour="instelling-standard"
            >
              Standaard
            </button>
          </div>
        </div>

        <div className="instellingen__content">
          {actionData?.error && <div className="alert alert-danger">{actionData.error}</div>}

          <Form ref={formRef} method="post" encType="multipart/form-data">
            {activeTab === "profiel" && (
              <div className="instellingen__card">
                <h2>Profiel</h2>
                <p className="py-1">Beheer standaardinstellingen bij het aanmaken van blokken.</p>

                <div className="instellingen__avatar-section">
                  <img src={avatarPreview} alt="Avatar" className="avatar" />
                  <input
                    type="file"
                    name="profile_file"
                    accept="image/*"
                    onChange={(e) =>
                      setAvatarPreview(
                        e.target.files?.[0]
                          ? URL.createObjectURL(e.target.files[0])
                          : avatarPreview
                      )
                    }
                  />
                </div>

                <div className="instellingen__form">
                  <div className="form-group">
                    <label>Voornaam</label>
                    <input
                      type="text"
                      name="first_name"
                      className="instellingen__form--input"
                      defaultValue={resolveFirstName}
                    />
                  </div>
                  <div className="form-group">
                    <label>Achternaam</label>
                    <input
                      type="text"
                      name="last_name"
                      className="instellingen__form--input"
                      defaultValue={resolveLastName}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" defaultValue={user.email ?? ""} />
                  </div>
                  <div className="form-group">
                    <label>Wachtwoord</label>
                    <input type="password" name="password" placeholder="Nieuw wachtwoord" />
                  </div>
                  <div className="form-group">
                    <label>Bevestig wachtwoord</label>
                    <input type="password" name="confirm_password" placeholder="Bevestig wachtwoord" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notificaties" && (
              <div className="instellingen__card">
                <h2>Meldingen</h2>
                <p className="py-1">Beheer welke meldingen je ontvangt.</p>
                <label className="form-switch">
                  Pushmeldingen
                  <input
                    className="form-check-input bg-warning border-0"
                    type="checkbox"
                    name="notifications"
                    defaultChecked={settings?.notifications_enabled ?? true}
                  />
                </label>
              </div>
            )}

            {activeTab === "standaard" && (
              <div className="instellingen__card">
                <h2>Standaardinstellingen</h2>
                <p className="py-1">Beheer standaardinstellingen bij het aanmaken van blokken.</p>
                <div className="instellingen__logo-section">
                  <label>Standaard Logo</label>
                  <img src={logoPreview} alt="Logo" className="avatar" />
                  <input
                    type="file"
                    name="logo_file"
                    accept="image/*"
                    onChange={(e) =>
                      setLogoPreview(
                        e.target.files?.[0]
                          ? URL.createObjectURL(e.target.files[0])
                          : logoPreview
                      )
                    }
                  />
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3 c-instellingen-form">
                    <label className="form-label">AccentKleur #1</label>
                    <input
                      type="color"
                      name="accent_color_primary"
                      defaultValue={settings?.accent_color_primary || "#000000"}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-4 mb-3 c-instellingen-form">
                    <label className="form-label">AccentKleur #2</label>
                    <input
                      type="color"
                      name="accent_color_secondary"
                      defaultValue={settings?.accent_color_secondary || "#ffffff"}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-4 mb-3 c-instellingen-form">
                    <label className="form-label">Achtergrondkleur</label>
                    <input
                      type="color"
                      name="background_color"
                      defaultValue={settings?.background_color || "#ffffff"}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-end mt-5">
              <button
                type="button"
                className="btn primary-button fs-5"
                onClick={() => setConfirmOpen(true)}
              >
                UPDATE
              </button>
            </div>
          </Form>

          <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <h3>Ben je zeker dat je je instellingen wil updaten?</h3>
            <div className="d-flex justify-content-end" style={{ gap: ".75rem", marginTop: "1rem" }}>
              <button className="btn btn-confirm" onClick={() => setConfirmOpen(false)}>
                Nee
              </button>
              <button className="btn primary-button btn-confirm" onClick={submitSettings}>
                Ja, updaten
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
}
