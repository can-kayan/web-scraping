function match_result(ms, firstHalf) {
    const [homeMS, awayMS] = ms.split(":").map(Number);
    const [home1H, away1H] = firstHalf.split(":").map(Number);
  
    const totalMS = homeMS + awayMS;
    const total1H = home1H + away1H;
  
    const winner1H = home1H > away1H ? "1" : home1H < away1H ? "2" : "X";
    const winnerMS = homeMS > awayMS ? "1" : homeMS < awayMS ? "2" : "X";
    const kgVar = homeMS > 0 && awayMS > 0;
  
    let totalGolEtiketi = "";
    if (totalMS === 0) totalGolEtiketi = "0";
    else if (totalMS === 1) totalGolEtiketi = "1";
    else if (totalMS <= 3) totalGolEtiketi = "2–3";
    else if (totalMS <= 5) totalGolEtiketi = "4–5";
    else totalGolEtiketi = "6+";
  
    return {
      "1.Y 0.5 A/Ü":
        total1H >= 1
          ? `İY 0,5 ÜST`
          : `İY 0,5 ALT`,
      "1.Y 1.5 A/Ü":
        total1H >= 2 ? `İY 1,5 ÜST` : `İY 1,5 ALT`,
      "1.Y 2.5 A/Ü":
        total1H >= 3
          ? `İY 2,5 ÜST`
          : `İY 2,5 ALT`,
      "MS 1.5 A/Ü":
        totalMS >= 2 ? `1,5 ÜST` : `1,5 ALT`,
      "MS 2.5 A/Ü": totalMS >= 3 ? `2,5 ÜST` : `2,5 ALT`,
      "MS 3.5 A/Ü": totalMS >= 4 ? `3,5 ÜST` : `2,5 ALT`,
      "MS 4.5 A/Ü": totalMS >= 5 ? `4,5 ÜST` : `2,5 ALT`,
      "KG VAR/YOK": kgVar
        ? `VAR`
        : `YOK`,
      "TOPLAM GOL": `${totalGolEtiketi}`,
      "İY (İlk Yarı)": `İY${winner1H}`,
      "MS (Maç Sonu)": `MS  ${winnerMS}`,
      "HT/FT (İY/MS)": `İY ${winner1H}/ MS${winnerMS}`,
    };
  }

  module.exports={
    match_result
  }