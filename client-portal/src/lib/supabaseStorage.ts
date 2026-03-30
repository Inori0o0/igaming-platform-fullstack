export function publicObjectUrl(bucket: string, objectPath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return "/products/vacant_tee.png";

  const safePath = objectPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");

  return `${base}/storage/v1/object/public/${encodeURIComponent(
    bucket,
  )}/${safePath}`;
}

