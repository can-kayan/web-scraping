const path = require("path");
const readline = require("readline");
const fs = require("fs");
const page_scrap = require("../middleware/page_scrap.js");
const { exportXlsx } = require("../middleware/excel.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function input(soru) {
  return new Promise((resolve) => rl.question(soru, resolve));
}

const seasonInfoPath = path.join(
  __dirname,
  "..",
  "data",
  "season_information.json"
);

async function main() {
  const seasonData = JSON.parse(fs.readFileSync(seasonInfoPath, "utf8"));
 
  const countries = [...new Set(seasonData.map((item) => item.name))];
  console.log("Ülkeler:");
  countries.forEach((c, i) => console.log(`${i + 1} - ${c}`)); 

  const countryIndex = parseInt(
    await input("Ülke numarası hepsi içinn 0'a basın: ")
  );
  let filteredByCountry;
  if (countryIndex === 0) {
    filteredByCountry = seasonData;
  } else if (countryIndex > 0 && countryIndex <= countries.length) {
    filteredByCountry = seasonData.filter(
      (item) => item.name === countries[countryIndex - 1]
    );
  } else {
    console.log("❌ Geçersiz ülke numarası.");
    rl.close();
    return;
  }
 
  const leagues = [...new Set(filteredByCountry.map((item) => item.lig))];
  console.log("Ligler:");
  leagues.forEach((l, i) => console.log(`${i + 1} - ${l}`)); 

  const leagueIndex = parseInt(
    await input("Lig numarası hepsi içinn 0'a basın: ")
  );
  let filteredByLeague;
  if (leagueIndex === 0) {
    filteredByLeague = filteredByCountry;
  } else if (leagueIndex > 0 && leagueIndex <= leagues.length) {
    filteredByLeague = filteredByCountry.filter(
      (item) => item.lig === leagues[leagueIndex - 1]
    );
  } else {
    console.log("❌ Geçersiz lig numarası.");
    rl.close();
    return;
  }
 
  const seasons = filteredByLeague.flatMap((item) =>
    item.season.map((s) => s.name)
  );
  const uniqueSeasons = [...new Set(seasons)];
  console.log("Sezonlar:");
  uniqueSeasons.forEach((s, i) => console.log(`${i + 1} - ${s}`)); 

  const seasonIndex = parseInt(
    await input("Sezon numarası hepsi içinn 0'a basın: ")
  );
  let selected;

  if (seasonIndex === 0) {
    selected = filteredByLeague.flatMap((item) =>
      item.season.map((s) => ({
        label: `${item.name}-${item.lig}-${s.name}`,
        href: s.href,
      }))
    );
  } else if (seasonIndex > 0 && seasonIndex <= uniqueSeasons.length) {
    const chosenSeason = uniqueSeasons[seasonIndex - 1];
    selected = filteredByLeague.flatMap((item) =>
      item.season
        .filter((s) => s.name === chosenSeason)
        .map((s) => ({
          label: `${item.name}-${item.lig}-${s.name}`,
          href: s.href,
        }))
    );
  } else {
    console.log("❌ Geçersiz sezon numarası.");
    rl.close();
    return;
  }

  if (selected.length === 0) {
    console.log("❌ Seçilen kriterlere göre sezon bulunamadı.");
    rl.close();
    return;
  }

  for (const job of selected) {
    console.log(`🔍 İşlem başlatılıyor: ${job.label}`);
    try {
      await page_scrap.main(
        job.href,
        job.label.split("-")[0],
        job.label.split("-")[1],
        job.label.split("-")[2]
      );
      console.log(`✅ İşlem tamamlandı: ${job.label}`);

      exportXlsx(job.label);
    } catch (err) {
      console.error(`❌ Hata (${job.label}): ${err.message}`);
    }
  }

  rl.close();
}

main();
