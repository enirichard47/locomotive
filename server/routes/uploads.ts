import type { RequestHandler } from "express";
import multer from "multer";
import { supabaseServer } from "../supabase";
import { v4 as uuidv4 } from "uuid";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// POST /api/admin/uploads - multipart form with `file` field
export const handleAdminFileUpload: RequestHandler = (req, res, next) => {
  // use multer to parse the multipart body
  const single = upload.single("file");
  single(req as any, res as any, async (err: any) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "Uploaded file is too large (max 10MB)." });
      }
      return res.status(400).json({ error: err.message || "Failed to parse uploaded file." });
    }

    const file = (req as any).file as { buffer: Buffer; originalname: string; mimetype: string } | undefined;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: "Missing file upload in 'file' field." });
    }

    // choose bucket name - ensure this bucket exists in your Supabase storage
    const bucket = process.env.SUPABASE_UPLOADS_BUCKET || "uploads";
    const extension = (file.originalname || "").split(".").pop() || "bin";
    const filename = `${uuidv4()}.${extension}`;
    const path = `public/${filename}`;

    try {
      const { error: uploadError } = await supabaseServer.storage
        .from(bucket)
        .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

      if (uploadError) {
        return res.status(500).json({ error: `Failed to store file in Supabase: ${uploadError.message}` });
      }

      const { data } = supabaseServer.storage.from(bucket).getPublicUrl(path);
      const publicUrl = data?.publicUrl || "";

      return res.status(201).json({ url: publicUrl });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
};

export default handleAdminFileUpload;
