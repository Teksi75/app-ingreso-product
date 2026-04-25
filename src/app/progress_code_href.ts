export function withProgressCode(href: string, progressCode?: string | null): string {
  if (!progressCode || !href.startsWith("/")) {
    return href;
  }

  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);

  if (!params.has("code") && !params.has("student")) {
    params.set("code", progressCode);
  }

  const serialized = params.toString();
  return serialized ? `${path}?${serialized}` : path;
}
