function formatBigNumber(number:number):string {
  if (typeof number !== 'number') {
    return number; // Return as-is if not a number
  }

  if (Math.abs(number) >= 1000000) {
    return (number / 1000000).toFixed(1) + 'm';
  } else if (Math.abs(number) >= 1000) {
    return (number / 1000).toFixed(1) + 'k';
  } else {
    return number.toString();
  }
}

export default formatBigNumber;