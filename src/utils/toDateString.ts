export default function toDateString(date: Date): string {
  return `${date.toLocaleDateString()} ${toLocaleString("en-US", {
    timeStyle: "long",
  })}`;
}
