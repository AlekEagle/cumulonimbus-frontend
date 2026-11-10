// In-House Modules
// No In-House Modules to import here.

// Store Modules
// No Store Modules to import here.

// External Modules
// No External Modules to import here.

export default function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round((bytes / 1024) * 10) / 10} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
  return `${Math.round((bytes / 1024 / 1024 / 1024) * 10) / 10} GB`;
}
