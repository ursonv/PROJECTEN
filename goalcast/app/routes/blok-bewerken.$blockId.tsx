import {
  useLoaderData,
  Form,
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

export async function loader({ params, request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const blockId = params.blockId;

  const { data: block, error } = await supabase
    .from("blocks")
    .select("id, title, type, folder_id, blok")
    .eq("id", blockId)
    .single();

  if (error || !block) throw new Response("Blok niet gevonden", { status: 404 });

  return { block };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const response = new Response();
  const form = await request.formData();

  const title = form.get("title") as string;
  const type = form.get("templateType") as string;
  const folderId = form.get("folderId") as string;

  const blokImageUrl = (form.get("blokImageUrl") as string) || "";

  const backgroundColor = form.get("backgroundColor") as string;
  const stripeColor1 = form.get("stripeColor1") as string;
  const stripeColor2 = form.get("stripeColor2") as string;
  const logoUrl = form.get("logoUrl") as string;
  const afbeeldingUrl = form.get("afbeeldingUrl") as string;

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

  const supabase = getSupabaseServerClient({ request, response });
  const blockId = params.blockId;

  const { data: currentBlock, error: fetchError } = await supabase
    .from("blocks")
    .select("blok")
    .eq("id", blockId)
    .single();

  if (fetchError) {
    console.error("Kan bestaande blokdata niet ophalen:", fetchError);
    return new Response("Fout bij ophalen blokdata", { status: 500 });
  }

  const updatedBlok = {
    ...(currentBlock?.blok || {}),
    image_url: blokImageUrl || currentBlock?.blok?.image_url || "",
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

  const { error: updateError } = await supabase
    .from("blocks")
    .update({
      title,
      type,
      blok: updatedBlok,
    })
    .eq("id", blockId);

  if (updateError) {
    console.error("Update mislukt:", updateError);
    return new Response("Fout bij opslaan", { status: 500 });
  }

  return redirect(`/projecten/${folderId}`, { headers: response.headers });
}

export default function BlokBewerken() {
  const { block } = useLoaderData<typeof loader>();
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

      // 1) Canvas export → upload → URL
      let blokImageUrl = "";
      if (state.imageDataUrl) {
        const blob = await dataUrlToBlob(state.imageDataUrl);
        blokImageUrl = await uploadBlob(blob, "blocks");
      }

      // 2) Overige afbeeldingen naar URLs
      const afbeeldingUrl = await ensureUrl(state.afbeeldingUrl ?? block.blok?.afbeeldingUrl ?? "", "uploads");
      const logoUrl = await ensureUrl(state.logoUrl ?? block.blok?.logoUrl ?? "", "logos");

      const galleryUrls = await (async () => {
        const list = (state as any).galleryUrls ?? block.blok?.galleryUrls ?? [];
        const out: string[] = [];
        for (const u of list) out.push(await ensureUrl(u, "gallery"));
        return out;
      })();

      (form.elements.namedItem("blokImageUrl") as HTMLInputElement).value = blokImageUrl;
      (form.elements.namedItem("templateType") as HTMLInputElement).value = state.type ?? block.type;
      (form.elements.namedItem("backgroundColor") as HTMLInputElement).value = state.backgroundColor ?? block.blok?.backgroundColor ?? "#ffffff";
      (form.elements.namedItem("stripeColor1") as HTMLInputElement).value = state.stripeColor1 ?? block.blok?.stripeColor1 ?? "#002b7f";
      (form.elements.namedItem("stripeColor2") as HTMLInputElement).value = state.stripeColor2 ?? block.blok?.stripeColor2 ?? "#ff0000";
      (form.elements.namedItem("columns") as HTMLInputElement).value = JSON.stringify(state.columns ?? block.blok?.columns ?? []);
      (form.elements.namedItem("tableRows") as HTMLInputElement).value = JSON.stringify(state.tableRows ?? block.blok?.tableRows ?? []);
      (form.elements.namedItem("afbeeldingUrl") as HTMLInputElement).value = afbeeldingUrl;
      (form.elements.namedItem("homeTeam") as HTMLInputElement).value = (state as any).homeTeam ?? block.blok?.homeTeam ?? "";
      (form.elements.namedItem("awayTeam") as HTMLInputElement).value = (state as any).awayTeam ?? block.blok?.awayTeam ?? "";
      (form.elements.namedItem("matchDate") as HTMLInputElement).value = (state as any).matchDate ?? block.blok?.matchDate ?? "";
      (form.elements.namedItem("matchTime") as HTMLInputElement).value = (state as any).matchTime ?? block.blok?.matchTime ?? "";
      (form.elements.namedItem("address") as HTMLInputElement).value = (state as any).address ?? block.blok?.address ?? "";
      (form.elements.namedItem("logoUrl") as HTMLInputElement).value = logoUrl;
      (form.elements.namedItem("galleryUrls") as HTMLInputElement).value = JSON.stringify(galleryUrls);
      (form.elements.namedItem("galleryCols") as HTMLInputElement).value = String((state as any).galleryCols ?? block.blok?.galleryCols ?? 3);
      (form.elements.namedItem("galleryGap") as HTMLInputElement).value = String((state as any).galleryGap ?? block.blok?.galleryGap ?? 20);
      (form.elements.namedItem("galleryPadding") as HTMLInputElement).value = String((state as any).galleryPadding ?? block.blok?.galleryPadding ?? 100);
      (form.elements.namedItem("galleryTitle") as HTMLInputElement).value = String((state as any).galleryTitle ?? block.blok?.galleryTitle ?? "");
    }

    form.submit();
  }

  return (
    <>
      <h1>Slide bewerken</h1>
      <div className="c-blok-form">
        <Form method="post" onSubmit={handleSubmit}>
          <input type="hidden" name="folderId" value={block.folder_id} />

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
          <input type="hidden" name="logoUrl" />
          <input type="hidden" name="galleryUrls" />
          <input type="hidden" name="galleryCols" />
          <input type="hidden" name="galleryGap" />
          <input type="hidden" name="galleryPadding" />
          <input type="hidden" name="galleryTitle" />

          {CanvasEditor && (
            <div className="mb-4">
              <CanvasEditor
                ref={canvasRef}
                defaultImage={block.blok?.logoUrl ?? null}
                defaultTemplateType={block.type}
                defaultBackgroundColor={block.blok?.backgroundColor}
                defaultStripeColor1={block.blok?.stripeColor1}
                defaultStripeColor2={block.blok?.stripeColor2}
                defaultColumns={block.blok?.columns}
                defaultTableRows={block.blok?.tableRows}
                defaultAfbeeldingUrl={block.blok?.afbeeldingUrl}
                defaultHomeTeam={block.blok?.homeTeam}
                defaultAwayTeam={block.blok?.awayTeam}
                defaultMatchDate={block.blok?.matchDate}
                defaultMatchTime={block.blok?.matchTime}
                defaultAddress={block.blok?.address}
                defaultGalleryUrls={block.blok?.galleryUrls}
                defaultGalleryCols={block.blok?.galleryCols}
                defaultGalleryGap={block.blok?.galleryGap}
                defaultGalleryPadding={block.blok?.galleryPadding}
                defaultGalleryTitle={block.blok?.galleryTitle}
              />
            </div>
          )}

          <div className="c-blok-form__section">
            <label className="c-blok-form__section--label">Titel</label>
            <input
              name="title"
              type="text"
              required
              className="c-blok-form__section--input"
              defaultValue={block.title}
            />
          </div>

          <button type="submit" className="c-blok-form__submit" disabled={isSubmitting}>
            {isSubmitting ? "Opslaan..." : "Opslaan"}
          </button>
        </Form>
      </div>
    </>
  );
}
