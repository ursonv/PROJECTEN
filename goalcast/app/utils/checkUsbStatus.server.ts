import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUsbStatus() {
  const { data: usbs, error } = await supabase
    .from("usbs")
    .select("id, title, code, user_id, is_online");

  if (error) {
    console.error("Fout bij ophalen USBs:", error.message);
    return;
  }

  const updatedUsbLogs: string[] = [];

  for (const usb of usbs) {
    const url = `https://goalcast.eu.ngrok.io/${usb.code}/status`;

    try {
      const res = await fetch(url, { method: "HEAD" });
      const online = res.ok;

      if (usb.is_online !== online) {
        await supabase
          .from("usbs")
          .update({ is_online: online })
          .eq("id", usb.id);

        await supabase.from("notifications").insert({
          user_id: usb.user_id,
          message: `USB ${usb.title} is nu ${online ? "online" : "offline"}!`,
          type: "usb_status",
          status: online ? "success" : "warning",
        });

        updatedUsbLogs.push(
          `USB "${usb.title}" (${usb.code}) => status aangepast naar: ${
            online ? "online" : "offline"
          }`
        );
      }
    } catch (err) {
      console.error(`Fout bij ophalen status van ${usb.title}:`, err);

      if (usb.is_online !== false) {
        await supabase
          .from("usbs")
          .update({ is_online: false })
          .eq("id", usb.id);

        await supabase.from("notifications").insert({
          user_id: usb.user_id,
          message: `USB  ${usb.title} (${usb.code}) kon niet bereikt worden – automatisch offline gezet.`,
          type: "usb_status",
          status: "error",
        });

        updatedUsbLogs.push(
          `USB "${usb.title}" (${usb.code}) => unreachable, status aangepast naar: offline`
        );
      }
    }
  }

  console.log("USB-statussen geüpdatet:");
  if (updatedUsbLogs.length > 0) {
    updatedUsbLogs.forEach((log) => console.log(" - " + log));
  } else {
    console.log("Geen wijzigingen in USB-statussen.");
  }
}

export { checkUsbStatus };
