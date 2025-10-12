export function toEmbedUrl(raw: string): string {
  const url = raw.trim();

  const driveFile = url.match(/https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveFile) {
    const id = driveFile[1];
    return `https://drive.google.com/file/d/${id}/preview`;
  }

  const slides = url.match(/https?:\/\/docs\.google\.com\/presentation\/d\/([^/]+)/i);
  if (slides) {
    const id = slides[1];
    return `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`;
  }

  const yt1 = url.match(/https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)/i);
  if (yt1) {
    return `https://www.youtube.com/embed/${yt1[1]}`;
  }
  const yt2 = url.match(/https?:\/\/youtu\.be\/([^?]+)/i);
  if (yt2) {
    return `https://www.youtube.com/embed/${yt2[1]}`;
  }

  return url;
}
