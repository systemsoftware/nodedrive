module.exports = cron => {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return "invalid cron expression";

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const isAll  = v => v === "*";
  const isNum  = v => /^\d+$/.test(v);
  const nth    = n => { const s=["th","st","nd","rd"]; const v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); };

  // --- time-of-day phrase ---
  const timePart = () => {
    if (isAll(hour) && isAll(minute))  return "every minute";
    if (isAll(hour) && isNum(minute))  return `every hour at minute ${minute}`;
    if (isNum(hour) && isAll(minute))  return `every minute of hour ${hour}`;
    if (isNum(hour) && isNum(minute)) {
      const h = parseInt(hour), m = parseInt(minute);
      const ampm = h < 12 ? "AM" : "PM";
      const h12  = h % 12 === 0 ? 12 : h % 12;
      const mm   = String(m).padStart(2, "0");
      return `at ${h12}:${mm} ${ampm}`;
    }
    // step expressions like */15
    const stepMatch = v => v.match(/^\*\/(\d+)$/);
    const mStep = stepMatch(minute), hStep = stepMatch(hour);
    if (mStep && isAll(hour)) return `every ${mStep[1]} minutes`;
    if (hStep && isAll(minute)) return `every ${hStep[1]} hours`;
    if (mStep && hStep) return `every ${mStep[1]} minutes, every ${hStep[1]} hours`;
    return `at ${minute} ${hour} (hour minute)`;
  };

  // --- day / date qualifiers ---
  const dayPart = () => {
    const parts = [];
    if (!isAll(dayOfMonth)) {
      if (isNum(dayOfMonth)) parts.push(`on the ${nth(parseInt(dayOfMonth))}`);
      else parts.push(`on day-of-month ${dayOfMonth}`);
    }
    if (!isAll(month)) {
      if (isNum(month)) parts.push(`in ${MONTHS[parseInt(month) - 1]}`);
      else parts.push(`in month ${month}`);
    }
    if (!isAll(dayOfWeek)) {
      if (isNum(dayOfWeek)) parts.push(`on ${DAYS[parseInt(dayOfWeek)]}`);
      else if (dayOfWeek.includes(",")) {
        const names = dayOfWeek.split(",").map(d => DAYS[parseInt(d)]);
        parts.push(`on ${names.join(", ")}`);
      } else parts.push(`on day-of-week ${dayOfWeek}`);
    }
    return parts.join(", ");
  };

  const time = timePart();
  const day  = dayPart();
  return day ? `${time}, ${day}` : time;
}