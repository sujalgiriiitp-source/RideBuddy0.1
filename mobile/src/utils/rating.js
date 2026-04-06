export const getRatingBadge = (averageRating, totalReviews) => {
  const normalizedAverage = Number(averageRating || 0);
  const normalizedReviews = Number(totalReviews || 0);

  if (normalizedReviews <= 0) {
    return { label: 'New', tone: 'neutral' };
  }

  if (normalizedAverage >= 4.5) {
    return { label: 'Top Rated', tone: 'success' };
  }

  if (normalizedAverage < 3.0) {
    return { label: 'New Driver', tone: 'warning' };
  }

  return { label: 'Rated', tone: 'primary' };
};

export const formatRatingLabel = (averageRating, totalRideCount) => {
  const normalizedAverage = Number(averageRating || 0);
  const normalizedRideCount = Number(totalRideCount || 0);

  if (!normalizedRideCount) {
    return '⭐ New';
  }

  return `⭐ ${normalizedAverage.toFixed(1)} (${normalizedRideCount} rides)`;
};
