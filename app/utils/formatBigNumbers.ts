function formatBigNumber(number:number):string {
  if (typeof number !== 'number') {
    return number; // Return as-is if not a number
  }

  if(Math.abs(number) >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'GB';
  } else if (Math.abs(number) >= 1000000) {
    return (number / 1000000).toFixed(1) + 'MB';
  } else if (Math.abs(number) >= 1000) {
    return (number / 1000).toFixed(1) + 'KB';
  } else {
    return number.toString();
  }
}

export default formatBigNumber;