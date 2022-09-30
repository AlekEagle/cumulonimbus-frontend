export default function toDateString(date: Date): string {
  const hours12 = date.getHours() % 12;
  const paddedHours = hours12.toString().padStart(2, '0');
  const paddedMinutes = date.getMinutes().toString().padStart(2, '0');
  const paddedSeconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = date.getHours() < 12 ? 'AM' : 'PM';
  const timeOffset = new Date().getTimezoneOffset();
  return `${date.toLocaleDateString()} ${paddedHours}:${paddedMinutes}:${paddedSeconds} ${ampm} UTC${
    timeOffset < 0 ? '+' : '-'
  }${Math.abs(Math.floor(timeOffset / 60))}:${Math.abs(timeOffset % 60)
    .toString()
    .padStart(2, '0')}`;
}
