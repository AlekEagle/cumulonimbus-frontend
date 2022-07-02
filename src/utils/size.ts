export default function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round((bytes / 1024) * 10) / 10} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
  return `${Math.round((bytes / 1024 / 1024 / 1024) * 10) / 10} GB`;
}
