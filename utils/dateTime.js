export function formatDateTime(contents_dateTime) { 
    if (!Array.isArray(contents_dateTime) || contents_dateTime.length < 3) {
        return {
            day: null,
            month: null,
            year: null,
            dayOfTheWeek: null,
            date: null,
            time: null
        };
    }

    const dayStringRaw = contents_dateTime[0];
    const dateRaw = contents_dateTime[1];
    const timeRaw = contents_dateTime[2];
 
    const dayString = typeof dayStringRaw === "string" ? dayStringRaw.replace(',', '') : '';
    const time = typeof timeRaw === "string" ? timeRaw.replace(',', '') : '';
    const date = typeof dateRaw === "string" ? new Date(dateRaw.replace(',', '')) : null;
 
    const isValidDate = date instanceof Date && !isNaN(date);

    const daysInEnglishToTurkish = {
        "Sunday": "Pazar",
        "Monday": "Pazartesi",
        "Tuesday": "Salı",
        "Wednesday": "Çarşamba",
        "Thursday": "Perşembe",
        "Friday": "Cuma",
        "Saturday": "Cumartesi"
    };

    const dayInTurkish = daysInEnglishToTurkish[dayString] || null;
    const dayOfMonth = isValidDate ? date.getDate() : null;
    const month = isValidDate ? date.getMonth() + 1 : null;
    const year = isValidDate ? date.getFullYear() : null;
    const formattedDate = (dayOfMonth && month && year)
        ? `${dayOfMonth.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`
        : null;
    const dayFormatedNumber=formattedDate.split('.')[0]
    return {
        day: dayFormatedNumber,
        month,
        year,
        dayOfTheWeek: dayInTurkish,
        date: formattedDate,
        time: time || null
    };
}
