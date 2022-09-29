// Take milliseconds and return how many hours, minutes and seconds it is
export default function toTimeString(ms: number): string {
  // The number of hours
  const hours = Math.floor(ms / 3600000);
  // The number of minutes
  const minutes = Math.floor((ms % 3600000) / 60000);
  // The number of seconds
  const seconds = Math.floor(((ms % 360000) % 60000) / 1000);
  // The string to return
  let str = '';
  // Check if there are hours
  if (hours) {
    // If there are, add them to the string
    // If seconds is present and minutes is not or vice versa, separate them with " and "
    // If seconds and minutes are both present, separate them with ", "
    str += `${hours} hour${hours === 1 ? '' : 's'}${
      (seconds && !minutes) || (!seconds && minutes)
        ? ' and '
        : seconds && minutes
        ? ', '
        : ''
    }`;
  }
  // Check if there are minutes
  if (minutes) {
    // If there are, add them to the string
    // If seconds is present, separate them with " and "
    // If hours is also present, put a comma before the " and " for proper grammar
    str += `${minutes} minute${minutes === 1 ? '' : 's'}${
      seconds ? (hours ? ', and ' : ' and ') : ''
    }`;
  }
  // Check if there are seconds
  if (seconds) {
    // If there are, add them to the string
    str += `${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  // Return the string
  return str;
}
