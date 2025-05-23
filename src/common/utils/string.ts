
export const genCode = (length = 6): string => {
  const baseString = '9'.repeat(length);
  const parsedInt = parseInt(baseString, 10); // Convert to integer
  const randomValue = Math.floor(Math.random() * parsedInt); // Get random value
  // Convert back to string and pad
  return randomValue.toString(10).padStart(length, '0');
};
