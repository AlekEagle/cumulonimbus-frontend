export default function toDateString(date: Date): string {
  const hour = date.getHours() % 12;
  const ampm = date.getHours() < 12 ? 'AM' : 'PM';
  const tzName = new Date()
    .toLocaleTimeString(undefined, { timeZoneName: 'short' })
    .split(' ')[2];
  return `${date.toLocaleDateString()} ${hour}:${date.getMinutes()}:${date.getSeconds()} ${ampm} ${tzName}`;
}
