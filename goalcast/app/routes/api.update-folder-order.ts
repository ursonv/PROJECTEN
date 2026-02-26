import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    usb_id,
    order,
  }: { usb_id: string; order: Array<{ folder_id: string; order_index: number }> } = body || {};

  if (!usb_id || !Array.isArray(order)) {
    return json({ error: "Bad request" }, { status: 400 });
  }

  for (const { folder_id, order_index } of order) {
    await supabase
      .from("folder_usb_links")
      .update({ order_index })
      .eq("usb_id", usb_id)
      .eq("folder_id", folder_id);
  }

  return json({ ok: true }, { headers: response.headers });
}

export const loader = () => new Response("Not Found", { status: 404 });
