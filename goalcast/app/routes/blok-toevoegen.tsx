import {
  Form,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useEffect, useRef, useState, useCallback } from "react";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import type { CanvasEditorHandle } from "~/components/canvas/CanvasEditor.client";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { Props as CanvasEditorProps } from "~/components/canvas/CanvasEditor.client";
import { createBrowserClient } from "@supabase/auth-helpers-remix";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const folderId = url.searchParams.get("folderId");
  if (!folderId) return redirect("/projecten");

  const supabase = getSupabaseServerClient({
    request,
    response: new Response(),
  });

  await supabase.auth.refreshSession();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) return redirect("/login");

  const { data: folder, error: folderError } = await supabase
    .from("folders")
    .select("id")
    .eq("id", folderId)
    .single();

  if (folderError || !folder) return redirect("/projecten");

  const { data: settings } = await supabase
    .from("settings")
    .select("background_color, accent_color_primary, accent_color_secondary, logo_url")
    .eq("user_id", user.id)
    .single();

  return { folderId, settings };
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  try {
    const supabase = getSupabaseServerClient({ request, response });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userData?.user || userError) return redirect("/login");

    const form = await request.formData();
    const folderId = form.get("folderId") as string;
    const title = form.get("title") as string;
    const type = form.get("templateType") as string;

    const blokImageUrl = (form.get("blokImageUrl") as string) || null;

    const backgroundColor = form.get("backgroundColor") as string;
    const stripeColor1 = form.get("stripeColor1") as string;
    const stripeColor2 = form.get("stripeColor2") as string;
    const afbeeldingUrl = form.get("afbeeldingUrl") as string;
    const logoUrl = form.get("logoUrl") as string;

    const columns = JSON.parse((form.get("columns") as string) || "[]");
    const tableRows = JSON.parse((form.get("tableRows") as string) || "[]");

    const homeTeam = form.get("homeTeam") as string;
    const awayTeam = form.get("awayTeam") as string;
    const matchDate = form.get("matchDate") as string;
    const matchTime = form.get("matchTime") as string;
    const address = form.get("address") as string;

    const galleryUrls = JSON.parse((form.get("galleryUrls") as string) || "[]");
    const galleryCols = parseInt((form.get("galleryCols") as string) || "3");
    const galleryGap = parseInt((form.get("galleryGap") as string) || "20");
    const galleryPadding = parseInt((form.get("galleryPadding") as string) || "100");
    const galleryTitle = (form.get("galleryTitle") as string) || "";

    const blok = {
      image_url: blokImageUrl,
      logoUrl,
      afbeeldingUrl,
      backgroundColor,
      stripeColor1,
      stripeColor2,
      columns,
      tableRows,
      homeTeam,
      awayTeam,
      matchDate,
      matchTime,
      address,
      galleryUrls,
      galleryCols,
      galleryGap,
      galleryPadding,
      galleryTitle,
    };

    const { error: insertError } = await supabase
      .from("blocks")
      .insert({
        folder_id: folderId,
        user_id: userData.user.id,
        title,
        type,
        blok,
      });

    if (insertError) {
      return new Response("Fout bij opslaan in database", { status: 500 });
    }

    return redirect(`/projecten/${folderId}`, { headers: response.headers });
  } catch {
    return new Response("Interne serverfout", { status: 500 });
  }
}

export default function BlokToevoegen() {
  const { folderId, settings } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [CanvasEditor, setCanvasEditor] = useState<
    ForwardRefExoticComponent<CanvasEditorProps & RefAttributes<CanvasEditorHandle>> | null
  >(null);
  const canvasRef = useRef<CanvasEditorHandle | null>(null);

  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error("Supabase env ontbreekt. Zet VITE_SUPABASE_URL/_ANON_KEY in .env");
      return;
    }
    supabaseRef.current = createBrowserClient(url, key);
  }, []);

  useEffect(() => {
    import("~/components/canvas/CanvasEditor.client").then((mod) => {
      setCanvasEditor(() => mod.default);
    });
  }, []);

  const extFromMime = (mime: string) => {
    if (mime.includes("png")) return ".png";
    if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
    if (mime.includes("webp")) return ".webp";
    if (mime.includes("gif")) return ".gif";
    return "";
  };

  const dataUrlToBlob = async (dataUrl: string) => {
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const uploadBlob = useCallback(
    async (blob: Blob, folder: string) => {
      const supabase = supabaseRef.current!;
      const mime = blob.type || "application/octet-stream";
      const ext = extFromMime(mime) || "";
      const path = `${folder}/${crypto.randomUUID()}${ext}`;
      const { error } = await supabase.storage
        .from("block-exports")
        .upload(path, blob, { contentType: mime, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("block-exports").getPublicUrl(path);
      return data.publicUrl;
    },
    []
  );

  const ensureUrl = useCallback(
    async (maybeDataUrlOrUrl: string | null | undefined, folder: string) => {
      if (!maybeDataUrlOrUrl) return "";
      if (maybeDataUrlOrUrl.startsWith("data:")) {
        const blob = await dataUrlToBlob(maybeDataUrlOrUrl);
        return uploadBlob(blob, folder);
      }
      return maybeDataUrlOrUrl;
    },
    [uploadBlob]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (!supabaseRef.current) {
      alert("Supabase client ontbreekt (check VITE_SUPABASE_* env)");
      return;
    }

    if (canvasRef.current) {
      const state = canvasRef.current.exportState();

      // 1) Canvas export (PNG) → upload → URL
      let blokImageUrl = "";
      if (state.imageDataUrl) {
        const blob = await dataUrlToBlob(state.imageDataUrl);
        blokImageUrl = await uploadBlob(blob, "blocks");
      }

      // 2) Overige afbeeldingen: forceer URLs
      const afbeeldingUrl = await ensureUrl(state.afbeeldingUrl ?? "", "uploads");
      const logoUrl = await ensureUrl(state.logoUrl ?? "", "logos");

      const galleryUrls = await (async () => {
        const list = (state as any).galleryUrls ?? [];
        const out: string[] = [];
        for (const u of list) out.push(await ensureUrl(u, "gallery"));
        return out;
      })();

      (form.elements.namedItem("blokImageUrl") as HTMLInputElement).value = blokImageUrl;
      (form.elements.namedItem("templateType") as HTMLInputElement).value = state.type;
      (form.elements.namedItem("backgroundColor") as HTMLInputElement).value = state.backgroundColor;
      (form.elements.namedItem("stripeColor1") as HTMLInputElement).value = state.stripeColor1;
      (form.elements.namedItem("stripeColor2") as HTMLInputElement).value = state.stripeColor2;
      (form.elements.namedItem("columns") as HTMLInputElement).value = JSON.stringify(state.columns ?? []);
      (form.elements.namedItem("tableRows") as HTMLInputElement).value = JSON.stringify(state.tableRows ?? []);
      (form.elements.namedItem("afbeeldingUrl") as HTMLInputElement).value = afbeeldingUrl;
      (form.elements.namedItem("homeTeam") as HTMLInputElement).value = (state as any).homeTeam ?? "";
      (form.elements.namedItem("awayTeam") as HTMLInputElement).value = (state as any).awayTeam ?? "";
      (form.elements.namedItem("matchDate") as HTMLInputElement).value = (state as any).matchDate ?? "";
      (form.elements.namedItem("matchTime") as HTMLInputElement).value = (state as any).matchTime ?? "";
      (form.elements.namedItem("address") as HTMLInputElement).value = (state as any).address ?? "";
      (form.elements.namedItem("galleryUrls") as HTMLInputElement).value = JSON.stringify(galleryUrls);
      (form.elements.namedItem("galleryCols") as HTMLInputElement).value = String((state as any).galleryCols ?? 3);
      (form.elements.namedItem("galleryGap") as HTMLInputElement).value = String((state as any).galleryGap ?? 20);
      (form.elements.namedItem("galleryPadding") as HTMLInputElement).value = String((state as any).galleryPadding ?? 100);
      (form.elements.namedItem("galleryTitle") as HTMLInputElement).value = String((state as any).galleryTitle ?? "");
      (form.elements.namedItem("logoUrl") as HTMLInputElement).value = logoUrl;
    }

    form.submit();
  }

  return (
    <>
      <h1>Nieuwe slide toevoegen</h1>
      <div className="c-blok-form">
        <Form method="post" onSubmit={handleSubmit}>
          <input type="hidden" name="folderId" value={folderId} />

          <input type="hidden" name="blokImageUrl" />

          <input type="hidden" name="templateType" />
          <input type="hidden" name="backgroundColor" />
          <input type="hidden" name="stripeColor1" />
          <input type="hidden" name="stripeColor2" />
          <input type="hidden" name="columns" />
          <input type="hidden" name="tableRows" />
          <input type="hidden" name="afbeeldingUrl" />
          <input type="hidden" name="homeTeam" />
          <input type="hidden" name="awayTeam" />
          <input type="hidden" name="matchDate" />
          <input type="hidden" name="matchTime" />
          <input type="hidden" name="address" />
          <input type="hidden" name="galleryUrls" />
          <input type="hidden" name="galleryCols" />
          <input type="hidden" name="galleryGap" />
          <input type="hidden" name="galleryPadding" />
          <input type="hidden" name="galleryTitle" />
          <input type="hidden" name="logoUrl" />

          {CanvasEditor && (
            <div className="mb-4">
              <CanvasEditor
                ref={canvasRef}
                defaultImage={settings?.logo_url ?? null}
                defaultBackgroundColor={settings?.background_color ?? "#ffffff"}
                defaultStripeColor1={settings?.accent_color_primary ?? "#002b7f"}
                defaultStripeColor2={settings?.accent_color_secondary ?? "#ff0000"}
              />
            </div>
          )}

          <div className="c-blok-form__section">
            <label className="c-blok-form__section--label">Titel</label>
            <input
              type="text"
              name="title"
              className="c-blok-form__section--input"
              required
              placeholder="Naam van de slide"
            />
          </div>

          <button type="submit" className="c-blok-form__submit" disabled={isSubmitting}>
            {isSubmitting ? "Toevoegen..." : "Slide toevoegen"}
          </button>
        </Form>
      </div>
    </>
  );
}
