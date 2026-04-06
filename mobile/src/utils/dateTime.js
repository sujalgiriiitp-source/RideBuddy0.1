export const MIN_RIDE_YEAR = 2024;

export const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const getRideDateValidationError = (value) => {
  const parsedDate = parseDateValue(value);

  if (!parsedDate) {
    return 'Please select a valid date & time';
  }

  if (parsedDate.getFullYear() < MIN_RIDE_YEAR) {
    return `Year must be ${MIN_RIDE_YEAR} or later`;
  }

  if (parsedDate.getTime() < Date.now()) {
    return 'Date & time cannot be in the past';
  }

  return '';
};

export const formatReadableDateTime = (value) => {
  const parsedDate = parseDateValue(value);
  if (!parsedDate) {
    return 'Date not available';
  }

  const datePart = parsedDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const timePart = parsedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${datePart}, ${timePart}`;
};

export const getMinimumRideDate = () => {
  const minimumYearDate = new Date(MIN_RIDE_YEAR, 0, 1, 0, 0, 0, 0);
  const now = new Date();
  return minimumYearDate > now ? minimumYearDate : now;
};
