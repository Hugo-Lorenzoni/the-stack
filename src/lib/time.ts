export function getNearestMidnight(utcTime: string | Date): Date {
  const date = new Date(utcTime);
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const timeFromStart = date.getTime() - startOfDay.getTime();
  const timeToEnd = endOfDay.getTime() - date.getTime();

  return timeFromStart <= timeToEnd ? startOfDay : endOfDay;
}
