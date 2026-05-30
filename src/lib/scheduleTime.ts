function timeToMinutes(time: string, options?: { treatMidnightAsEnd?: boolean }) {
  // 終了時刻の 00:00 は当日の始まりではなく、翌日 24:00 として扱う。
  if (time === "00:00" && options?.treatMidnightAsEnd) {
    return 24 * 60;
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isValidScheduleTimeRange(startTime: string, endTime: string) {
  if (startTime === endTime) {
    return false;
  }

  return (
    timeToMinutes(startTime) <
    timeToMinutes(endTime, { treatMidnightAsEnd: true })
  );
}
