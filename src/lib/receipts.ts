import { supabase } from "@/integrations/supabase/client";

export const RECEIPT_BUCKET = "receipts";

const MAX_BYTES = 10 * 1024 * 1024;

export async function uploadReceipt(file: File, entryId: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image (photo) of the receipt.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("That photo is larger than 10MB — please try a smaller one.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Please sign in again to upload a receipt.");

  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().slice(0, 5);
  const path = `${userData.user.id}/${entryId}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  return path;
}

export async function getReceiptUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error || !data) throw new Error(error?.message ?? "Could not open that receipt.");
  return data.signedUrl;
}

export async function deleteReceipt(path: string): Promise<void> {
  await supabase.storage.from(RECEIPT_BUCKET).remove([path]);
}
