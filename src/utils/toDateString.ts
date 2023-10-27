export default function toDateString(date: Date): string {
  return `${date.toLocaleDateString()} ${date.toLocaleString('en-US', {
    timeStyle: 'long',
  })}`;
}
