import { data, type ActionFunction } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const title = form.get("title") as string;
  const usb_id = form.get("usb_id") as string;

  if (!title) {
    return data({ error: "Titel is verplicht" }, { status: 400 });
  }

  await supabase.from("folders").insert({
    title,
    usb_id: usb_id || null,
    user_id: userData.user.id,
  });

  return data({ success: true });
};
