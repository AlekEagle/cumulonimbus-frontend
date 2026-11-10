// In-House Modules
// No In-House Modules to import here.

// Store Modules
import { displayPrefStore } from '$/displayPref.js';

// External Modules
// No External Modules to import here.

export default function toDateString(date: Date): string {
  const displayPref = displayPrefStore();
  return `${date.toLocaleDateString()} ${date.toLocaleString('en-US', {
    timeStyle: 'long',
    hour12: displayPref.hour12,
  })}`;
}
