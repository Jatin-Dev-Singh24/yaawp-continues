// Server-side media endpoints for YAAWP.
// Images -> ImageKit, videos -> Gumlet. Private keys are read only inside
// handlers and never sent to the browser. Every call verifies the caller's
// session against YAAWP's own Supabase project.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`media_not_configured:${name}`);
  return v;
}

/** Verifies a YAAWP Supabase access token and returns the user id. */
async function requireUser(accessToken: string): Promise<string> {
  const url = env("YAAWP_SUPABASE_URL");
  const anon = env("YAAWP_SUPABASE_ANON_KEY");
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("unauthorized");
  const user = (await res.json()) as { id?: string };
  if (!user.id) throw new Error("unauthorized");
  return user.id;
}

/** Confirms the caller owns a media asset (RLS on media_assets enforces own-rows). */
async function requireOwnership(accessToken: string, provider: string, assetId: string) {
  const url = env("YAAWP_SUPABASE_URL");
  const anon = env("YAAWP_SUPABASE_ANON_KEY");
  const q = `${url}/rest/v1/media_assets?select=id&provider=eq.${encodeURIComponent(provider)}&provider_asset_id=eq.${encodeURIComponent(assetId)}&limit=1`;
  const res = await fetch(q, { headers: { apikey: anon, Authorization: `Bearer ${accessToken}` } });
  const rows = res.ok ? ((await res.json()) as unknown[]) : [];
  if (!rows.length) throw new Error("forbidden");
}

const folderSchema = z.enum(["posts", "stories", "avatars", "messages", "communities"]);

export const getImageKitUploadAuth = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        accessToken: z.string().min(10),
        folder: folderSchema,
        mimeType: z.string(),
        size: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const userId = await requireUser(data.accessToken);
    if (!IMAGE_TYPES.includes(data.mimeType)) throw new Error("unsupported_image_type");
    if (data.size > MAX_IMAGE_BYTES) throw new Error("image_too_large");
    const privateKey = env("IMAGEKIT_PRIVATE_KEY");
    const { createHmac, randomUUID } = await import("crypto");
    const token = randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 10 * 60;
    const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
    return { token, expire, signature, folder: `/yaawp/${userId}/${data.folder}` };
  });

export const createGumletUpload = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        accessToken: z.string().min(10),
        mimeType: z.string(),
        size: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const userId = await requireUser(data.accessToken);
    if (!VIDEO_TYPES.includes(data.mimeType)) throw new Error("unsupported_video_type");
    if (data.size > MAX_VIDEO_BYTES) throw new Error("video_too_large");
    const res = await fetch("https://api.gumlet.com/v1/video/assets/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env("GUMLET_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source_id: env("GUMLET_SOURCE_ID"), format: "ABR", tag: [`user:${userId}`] }),
    });
    if (!res.ok) throw new Error(`gumlet_error_${res.status}`);
    const j = (await res.json()) as {
      asset_id: string;
      upload_url: string;
      output?: { playback_url?: string; thumbnail_url?: string[] };
    };
    return {
      assetId: j.asset_id,
      uploadUrl: j.upload_url,
      playbackUrl: j.output?.playback_url ?? null,
      thumbnailUrl: j.output?.thumbnail_url?.[0] ?? null,
    };
  });

export const deleteMediaAsset = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        accessToken: z.string().min(10),
        provider: z.enum(["imagekit", "gumlet"]),
        assetId: z.string().min(1).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireUser(data.accessToken);
    await requireOwnership(data.accessToken, data.provider, data.assetId);
    if (data.provider === "imagekit") {
      const auth = btoa(`${env("IMAGEKIT_PRIVATE_KEY")}:`);
      const res = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(data.assetId)}`, {
        method: "DELETE",
        headers: { Authorization: `Basic ${auth}` },
      });
      return { ok: res.ok || res.status === 404 };
    }
    const res = await fetch(`https://api.gumlet.com/v1/video/assets/${encodeURIComponent(data.assetId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${env("GUMLET_API_KEY")}` },
    });
    return { ok: res.ok || res.status === 404 };
  });
