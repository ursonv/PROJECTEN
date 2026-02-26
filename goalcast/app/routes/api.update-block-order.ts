import { data } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const action = async ({ request }: { request: Request }) => {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  const updates = await request.json(); 

  const updatesWithErrors = [];

  for (const { id, order_index } of updates) {
    const { error } = await supabase
      .from("blocks")
      .update({ order_index })
      .eq("id", id);

    if (error) {
      updatesWithErrors.push({ id, error: error.message });
    }
  }

  if (updatesWithErrors.length > 0) {
    return data({ success: false, errors: updatesWithErrors }, { status: 500 });
  }

  return data({ success: true }, { headers: response.headers });
};
