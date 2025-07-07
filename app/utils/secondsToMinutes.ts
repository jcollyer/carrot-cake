export default function secondsToMinutesAndSeconds(totalSeconds:number) {
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return { minutes, remainingSeconds };
}

