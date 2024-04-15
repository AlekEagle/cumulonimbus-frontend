import { ref, onUnmounted, Ref, unref, watch } from 'vue';

// Take milliseconds and return how many hours, minutes and seconds it is
export function toTimeString(ms: number): string {
  // We don't care about sign, just magnitude
  ms = Math.abs(ms);
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
  return str.length > 0 ? str : 'Now';
}

// Take milliseconds and return a fuzzy time string (e.g. "less than a minute ago", "about 2 hours ago", "about 3 days ago", etc.)
export function toFuzzyTimeString(ms: number): string {
  // negative indicates in the past
  const inPast = ms < 0;
  // Now that we know the sign, we just need the magnitude
  ms = Math.abs(ms);
  // The number of hours
  const hours = Math.floor(ms / 3600000);
  // The number of minutes
  const minutes = Math.floor((ms % 3600000) / 60000);
  // The number of seconds
  const seconds = Math.floor(((ms % 360000) % 60000) / 1000);

  // Check if there are hours
  if (hours) {
    // If there are, return "about x hours ago" for negative numbers and "about x hours from now" for positive numbers
    return `about ${hours} hour${hours === 1 ? '' : 's'} ${
      inPast ? 'ago' : 'from now'
    }`;
  } else {
    // If there are not, check if there are minutes
    if (minutes) {
      // If there are, return "about x minutes ago" for negative numbers and "about x minutes from now" for positive numbers
      return `about ${minutes} minute${minutes === 1 ? '' : 's'} ${
        inPast ? 'ago' : 'from now'
      }`;
    } else {
      // If there are not, check if there are seconds
      if (seconds) {
        // If there are, return "about x seconds ago" for negative numbers and "about x seconds from now" for positive numbers
        return `about ${seconds} second${seconds === 1 ? '' : 's'} ${
          inPast ? 'ago' : 'from now'
        }`;
      } else {
        // If there are not, return "Now"
        return 'Now';
      }
    }
  }
}

// Reactive fuzzy time passed since a date
export function useTimeString(
  date: Ref<Date | null | undefined>,
  updateInterval = 1000,
) {
  let unrefDate = unref(date);
  // The time passed since the date
  const time = ref(
    unrefDate
      ? toTimeString(Date.now() - unrefDate.getTime())
      : 'Time travel detected!',
  );
  // The interval to update the time
  let interval: number | null = null;

  // The function to update the time
  const update = () => {
    time.value = unrefDate
      ? toTimeString(Date.now() - unrefDate.getTime())
      : 'Time travel detected!';
  };

  // Call update for the first time
  update();

  // Start the interval
  // @ts-expect-error Blame @types/qrcode for this error
  interval = setInterval(update, updateInterval);

  // Stop the interval when the component unmounts
  onUnmounted(() => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  });

  // Watch for changes to the date
  watch(
    date,
    (newDate) => {
      unrefDate = newDate;
      // when the date changes, stop the interval, update the time, and start the interval again
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      update();
      // @ts-expect-error Blame @types/qrcode for this error
      interval = setInterval(update, updateInterval);
    },
    { immediate: true },
  );

  // Return the time
  return time;
}

// Reactive fuzzy time passed since a date (e.g. "less than a minute ago", "about 2 hours ago", "about 3 days ago", etc.)
export function useFuzzyTimeString(
  date: Ref<Date | null | undefined>,
  updateInterval = 1000,
) {
  let unrefDate = unref(date);
  // The time passed since the date
  const time = ref(
    unrefDate
      ? toFuzzyTimeString(unrefDate.getTime() - Date.now())
      : 'Time travel detected!',
  );
  // The interval to update the time
  let interval: number | null = null;

  // The function to update the time
  const update = () => {
    time.value = unrefDate
      ? toFuzzyTimeString(unrefDate.getTime() - Date.now())
      : 'Time travel detected!';
  };

  // Call update for the first time
  update();

  // Start the interval
  // @ts-expect-error Blame @types/qrcode for this error
  interval = setInterval(update, updateInterval);

  // Stop the interval when the component unmounts
  onUnmounted(() => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  });

  // Watch for changes to the date
  watch(
    date,
    (newDate) => {
      unrefDate = newDate;
      // when the date changes, stop the interval, update the time, and start the interval again
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      update();
      // @ts-expect-error Blame @types/qrcode for this error
      interval = setInterval(update, updateInterval);
    },
    { immediate: true },
  );

  // Return the time
  return time;
}

// Add seconds to a date
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}
