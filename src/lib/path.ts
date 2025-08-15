import mime from "mime";

export function getDirectoryPath(
  type: string,
  date: Date,
  title: string,
): string {
  const dateString = date.toISOString().substring(0, 10);
  const formattedTitle = getFormattedString(title);
  return `/${type}/${dateString}-${formattedTitle}`;
}

export function getFileName(file: File, cover: boolean): string {
  const formattedTitle = getFormattedString(file.name);
  const extension = mime.getExtension(file.type);
  return cover
    ? `cover-${formattedTitle}.${extension}`
    : `${formattedTitle}.${extension}`;
}

export function getFormattedString(str: string): string {
  return str
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-")
    .replace(/[/.]/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
