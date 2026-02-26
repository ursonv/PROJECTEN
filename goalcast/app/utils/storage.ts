import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadFile(
  bucket: string,
  file: File,
  userId: string,
  folder?: string
): Promise<string | null> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const sanitizedFilename = `${Date.now()}-${file.name}`.replace(/\s+/g, "-");
  const path = `${folder ? folder + "/" : ""}${userId}/${sanitizedFilename}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    console.error(`Upload fout in ${bucket}:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return publicUrlData?.publicUrl || null;
}

export async function uploadUsbLogo(file: File, userId: string) {
  return uploadFile("usb-logos", file, userId);
}

export async function uploadAvatar(file: File, userId: string) {
  return uploadFile("avatars", file, userId, "avatars");
}

export async function uploadLogo(file: File, userId: string) {
  return uploadFile("logos", file, userId, "logos");
}
