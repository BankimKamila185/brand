import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env";
import { logger } from "../utils/logger";
import crypto from "crypto";

// Initialize S3 Client configured for Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: env.R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Uploads a base64 encoded image string directly to Cloudflare R2 bucket.
 * If the string does not represent a base64 encoded URI, it is returned untouched.
 * @param {string} base64Str - The raw base64 data string (e.g. data:image/png;base64,...)
 * @param {string} folder - The destination subdirectory inside the R2 bucket.
 * @returns {Promise<string>} The public access URL of the uploaded image.
 */
export const uploadBase64ToR2 = async (base64Str, folder = "products") => {
  if (!base64Str || !base64Str.startsWith("data:")) {
    // If it's already an HTTP URL or doesn't follow base64 pattern, bypass R2
    return base64Str;
  }

  // If R2 credentials are not set up, skip and return as-is (e.g., fall back to database storage during local testing)
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME) {
    logger.warn("⚠️ Cloudflare R2 credentials not fully configured. Storing base64 raw string in DB.");
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 string format");
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    
    // Extract file extension from MIME type
    let extension = "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      extension = "jpg";
    } else if (mimeType.includes("webp")) {
      extension = "webp";
    } else if (mimeType.includes("avif")) {
      extension = "avif";
    } else if (mimeType.includes("gif")) {
      extension = "gif";
    }

    const filename = `${folder}/${crypto.randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: mimeType,
    });

    await r2Client.send(command);

    // Build public serving URL
    const publicUrl = env.R2_PUBLIC_URL 
      ? `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${filename}`
      : `https://${env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${filename}`;

    logger.info(`✅ Image uploaded to Cloudflare R2: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    logger.error("❌ Cloudflare R2 Upload Failed:", error);
    throw error;
  }
};
