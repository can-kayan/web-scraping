function parsePopup(popupHtml, positionHint = null) {
  let open = "";
  let close = "";
  let name = "";
  let openDate = "";
  let closeDate = "";

  const nameMatch = popupHtml.match(/TO\s+(.*?)!/);
  if (nameMatch) name = nameMatch[1].trim();

  const openMatch = popupHtml.match(/Opening odds:([^\n]+)/);
  if (openMatch) {
    const section = openMatch[1];
    openDate = section.match(/\d{2} \w{3}, \d{2}:\d{2}/)?.[0] || "";
    const oddsOnlyMatch = section
      .replace(openDate, "")
      .match(/(\d+\/\d+|[-+]?\d+(\.\d+)?)/);
    if (oddsOnlyMatch) open = oddsOnlyMatch[1];
  }
 
  const movementMatch = popupHtml.match(/Odds movement:([\s\S]*?)Opening odds:/i);
  if (movementMatch) {
    const movementText = movementMatch[1];
 
    const dateRegex = /\d{2} \w{3}, \d{2}:\d{2}/g;
    const dates = [...movementText.matchAll(dateRegex)];

    if (dates.length > 0) { 
      const lastDateMatch = dates[dates.length - 1];
      const afterDates = movementText.slice(lastDateMatch.index + lastDateMatch[0].length);
 
      const closeMatch = afterDates.match(/(\d+\/\d+|[-+]?\d+(\.\d+)?)/);
      if (closeMatch) close = closeMatch[1];
 
      const firstDate = dates[0];
      closeDate = firstDate[0];
    }
  }
  console.log(popupHtml);
  console.log('open ',open);
  console.log('close ', formatOdds(close));
   

  return {
    name,
    open: open,
    close: formatOdds(close) || open,
    openDate: openDate || null,
    closeDate: closeDate || null,
    positionHint,
  };
}
function formatOdds(odds) {
  const num = parseFloat(odds);
  return isNaN(num) ? odds : num.toFixed(2);
}
module.exports = {
  parsePopup,
};
