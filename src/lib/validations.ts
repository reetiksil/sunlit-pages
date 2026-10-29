import { z } from "zod";
import { siteConfig } from "@/config/site";

export const uploadFileSchema = z.object({
  name: z
    .string()
    .refine(
      (name) =>
        name.toLowerCase().endsWith(".epub") || name.toLowerCase().endsWith(".pdf"),
      "Please select an .epub or .pdf book file."
    ),
  size: z
    .number()
    .positive("The selected file appears to be empty.")
    .max(
      siteConfig.maxUploadSizeBytes,
      `File exceeds the ${siteConfig.maxUploadSizeMB} MB browser storage limit.`
    ),
});

export function validateBookFile(file: { name: string; size: number }) {
  return uploadFileSchema.safeParse(file);
}