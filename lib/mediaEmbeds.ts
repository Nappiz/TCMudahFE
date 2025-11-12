export function extractDriveId(url: string): string | null {
  const m = url.match(/\/file\/d\/([^/]+)\//);
  if (m?.[1]) return m[1];
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2?.[1]) return m2[1];
  return null;
}

export function toDrivePreview(url: string): string | null {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

export function toDriveDownload(url: string): string | null {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : null;
}

export function extractYouTubeId(url: string): string | null {
  let m = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (m?.[1]) return m[1];
  m = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (m?.[1]) return m[1];
  m = url.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  if (m?.[1]) return m[1];
  return null;
}

export function toYouTubeEmbed(url: string): string | null {
  const id = extractYouTubeId(url);
  return id
    ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1&fs=1`
    : null;
}

export function toDocsViewer(url: string): string {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
    url
  )}`;
}
