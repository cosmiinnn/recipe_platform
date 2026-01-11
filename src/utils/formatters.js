// time formatting
export const formatTime = (minutes) => {
  if (!minutes) return '0 mins';
  if (minutes < 60) return `${minutes} mins`;

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
};

// password test
export const isStrongPassword = (password) => {
  return password.length >= 6;
};