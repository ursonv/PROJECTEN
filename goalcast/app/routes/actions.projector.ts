import { data } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import FormData from "form-data";
import fetch from "node-fetch";
import { redirect } from "@remix-run/node";


type BlockData = {
  image: string | null;
  image_url: string | null;
  title: string | null;
  created_at: string | null;
};

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const usbId = form.get("usb_id") as string;

  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  // 1. Haal USB op
  const { data: usb } = await supabase
    .from("usbs")
    .select("code")
    .eq("id", usbId)
    .single();

  if (!usb?.code) {
    return data({ error: "USB-code niet gevonden" }, { status: 400 });
  }

  // 2. Verwijder alle bestaande bestanden op de USB
  try {
    await fetch(`https://goalcast.eu.ngrok.io/${usb.code}/clear`, {
      method: "POST",
    });
  } catch (err) {
    console.error("Fout bij wissen van USB-bestanden:", err);
  }

  // 3. Haal gekoppelde folders op
  const { data: links } = await supabase
    .from("folder_usb_links")
    .select("folder_id")
    .eq("usb_id", usbId);

  const folderIds = links?.map((link) => link.folder_id) || [];

  // 4. Haal blokken op uit gekoppelde folders
  const { data: blocks } = await supabase
  .from("blocks")
  .select("blok")
  .in("folder_id", folderIds);
  
  const imageBlocks: BlockData[] = (blocks ?? []).map((block: any) => {
    const blok = block.blok ?? {};
    return {
      image: blok.image ?? null,
      image_url: blok.image_url ?? null,
      title: blok.title ?? null,
      created_at: blok.created_at ?? null,
    };
  });
  

  // 5. Upload elk blok naar GoalCast
  let index = 0;

  for (const block of imageBlocks) {
    const imageUrl = block.image || block.image_url;
    const title = block.title || "";
    const createdAt = block.created_at || "";

    if (!imageUrl) continue;

    try {
      const imgRes = await fetch(imageUrl);
      const buffer = await imgRes.arrayBuffer();

      const formData = new FormData();
      const filename = `goalcast-image-${index}.png`;

      formData.append("file", Buffer.from(buffer), filename);
      formData.append("title", title);
      formData.append("created_at", createdAt);

      await fetch(`https://goalcast.eu.ngrok.io/${usb.code}/upload`, {
        method: "POST",
        body: formData,
      });

      index++;
    } catch (err) {
      console.error(`Fout bij upload van afbeelding ${index}:`, err);
    }
  }

  return redirect("/");
}
