export default function downloadBlob(
  data: BlobPart | BlobPart[],
  filename: string,
  type: string = 'text/plain',
) {
  const parts = Array.isArray(data) ? data : [data];
  const blob = new Blob(parts, { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
