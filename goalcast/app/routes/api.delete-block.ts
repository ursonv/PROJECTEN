import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const blockId = form.get("blockId");

  const supabase = getSupabaseServerClient({ request, response: new Response() });

  if (typeof blockId === "string") {
    await supabase.from("blocks").delete().eq("id", blockId);
  }

  return redirect(request.headers.get("Referer") || "/projecten");
}
