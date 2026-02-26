import { data, type ActionFunction } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { uploadUsbLogo } from "~/utils/storage";

export const action: ActionFunction = async ({ request }) => {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user)
    return data({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const title = form.get("title") as string;
  const code = form.get("code") as string;
  const file = form.get("logo") as File;

  let logo_url: string = "/default-usb-logo.png";

  if (file && file.size > 0) {
    try {
      const uploadedLogo = await uploadUsbLogo(file, userData.user.id);
      if (uploadedLogo) {
        logo_url = uploadedLogo;
      }
    } catch {
      console.warn("Upload faalde, gebruik default logo.");
    }
  }

  await supabase.from("usbs").insert({
    user_id: userData.user.id,
    title,
    code,
    logo_url,
    is_online: false,
  });

  return data({ success: true });
};
