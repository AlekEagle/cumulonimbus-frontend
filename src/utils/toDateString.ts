import { displayPrefStore } from '@/stores/displayPref.js';

export default function toDateString(date: Date): string {
  const displayPref = displayPrefStore();
  return `${date.toLocaleDateString()} ${date.toLocaleString('en-US', {
    timeStyle: 'long',
    hour12: displayPref.hour12,
  })}`;
}
