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
 * Normalizes any Cloudflare R2 URL to the public serving domain.
 * If the URL uses private S3 endpoint .r2.cloudflarestorage.com, it rewrites to pub-41f23aca788f4f3d8eb5a286adbb6f8d.r2.dev
 */
export const normalizeR2Url = (url) => {
  if (!url || typeof url !== "string") return url;
  if (url.includes(".r2.cloudflarestorage.com/")) {
    const filename = url.split(".r2.cloudflarestorage.com/")[1];
    return `https://pub-41f23aca788f4f3d8eb5a286adbb6f8d.r2.dev/${filename}`;
  }
  return url;
};

/**
 * Uploads a base64 encoded image string directly to Cloudflare R2 bucket.
 * If the string does not represent a base64 encoded URI, it is returned untouched.
 * @param {string} base64Str - The raw base64 data string (e.g. data:image/png;base64,...)
 * @param {string} folder - The destination subdirectory inside the R2 bucket.
 * @returns {Promise<string>} The public access URL of the uploaded image.
 */
export const uploadBase64ToR2 = async (base64Str, folder = "products") => {
  if (!base64Str || !base64Str.startsWith("data:")) {
    // If it's already an HTTP URL or doesn't follow base64 pattern, bypass R2 after normalizing
    return normalizeR2Url(base64Str);
  }

  // If R2 credentials are not set up, skip and return as-is (e.g., fall back to database storage during local testing)
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME) {
    logger.warn("⚠️ Cloudflare R2 credentials not fully configured. Storing base64 raw string in DB.");
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
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

    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      try {
        const command = new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: filename,
          Body: buffer,
          ContentType: mimeType,
        });

        await r2Client.send(command);

        const baseUrl = env.R2_PUBLIC_URL 
          ? env.R2_PUBLIC_URL.replace(/\/$/, "")
          : "https://pub-41f23aca788f4f3d8eb5a286adbb6f8d.r2.dev";
        const publicUrl = `${baseUrl}/${filename}`;

        logger.info(`✅ Image uploaded to Cloudflare R2: ${publicUrl}`);
        return publicUrl;
      } catch (err) {
        logger.error(`⚠️ Cloudflare R2 Upload Attempt ${attempts} Failed:`, err.message || err);
        if (attempts >= 3) {
          logger.error("❌ Cloudflare R2 Upload Failed after 3 attempts, returning base64 as fallback.");
          return base64Str;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    return base64Str;
  } catch (error) {
    logger.error("❌ Cloudflare R2 Upload Processing Error:", error);
    return base64Str;
  }
};
