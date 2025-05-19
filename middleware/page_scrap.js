const { default: puppeteer } = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { page_count } = require("../utils/page_count");
const { processPages } = require("../utils/match_links_from_page");
const { match_info } = require("../core/match_info");
const { oneXtwo } = require("../features/oneXtwo_info");
const { asianHandicap } = require("../features/asianHandicap_info");
const { overUnder } = require("../features/overUnder_info");
const { bothTeamsToScore } = require("../features/bothTeamsToScores_info");
const { doubleChange } = require("../features/doubleChange_info");
const { europeanHandicap } = require("../features/europeanHandicap_info");
const { default: pLimit } = require("p-limit");
const { drawNoBet } = require("../features/drawNoBet_info");
const { correctScore } = require("../features/correctScore_info");
const { oddOrEven } = require("../features/oddOrEven_info");
const { halfFulltime } = require("../features/halfFullTime_info");
const { createConfiguredPage } = require("../utils/new_page");
const { selectDecimalOdds } = require("../utils/decimal_format");

function getFilteredUrls(incomingUrls, country, league, season) {
  const outputDir = getOutputDirPath(country, league, season);
  const matchInfoPath = path.join(outputDir, "match_info.json");

  let existingUrls = [];

  if (fs.existsSync(matchInfoPath)) {
    try {
      const content = fs.readFileSync(matchInfoPath, "utf-8");
      const parsed = JSON.parse(content);
      existingUrls = parsed.map((match) => match.url?.trim()).filter(Boolean);
    } catch (err) {
      console.warn("⚠️ match_info.json okunamadı veya bozuk:", err.message);
    }
  }

  const cleanedIncoming = [...new Set(incomingUrls.map((url) => url.trim()))];

  if (existingUrls.length > 0) {
    return cleanedIncoming.filter((url) => !existingUrls.includes(url));
  }

  return cleanedIncoming;
}

function getOutputDirPath(country, league, season) {
  const safeName = `${country}-${league}-${season}`.replace(
    /[\/\\:*?"<>|]/g,
    "-"
  );
  return path.join(__dirname, "..", "data", safeName);
}

function saveJSON(outputDir, name, newData) {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${name}.json`);
  if (!Array.isArray(newData)) {
    newData = [newData];
  }
  let existingData = [];

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      existingData = JSON.parse(raw);
    } catch (err) {
      console.warn(`⚠️ Var olan dosya okunamadı (${filePath}):`, err.message);
    }
  }

  const combinedData = [...existingData, ...newData];

  fs.writeFileSync(
    filePath,
    JSON.stringify(Object.values(combinedData), null, 2)
  );
  console.log(`✅ Kaydedildi: ${filePath}`);
}

async function runFeature(
  featureFn,
  browser,
  urls,
  season,
  featureName,
  concurrency = 5
) {
  const limit = pLimit(concurrency);
  const result = [];
  await Promise.all(
    urls.map((url) =>
      limit(async () => {
        try {
          const featureData = await featureFn(browser, url, season);
          result.push(featureData);
        } catch (e) {
          console.warn(`⚠️ ${featureName} hatası [${url}]:`, e.message);
          return null;
        }
      })
    )
  );

  return result.filter((item) => item !== null);
}
async function runMatchInfo(browser, urls, season, concurrency = 5) {
  const limit = pLimit(concurrency);
  const result = [];

  await Promise.all(
    urls.map((url) =>
      limit(async () => {
        try {
          const match = await match_info(browser, url, season);
          if (
            match?.teamInfo?.ms?.includes(":") &&
            match?.teamInfo?.oneHalf?.includes(":")
          ) {
            result.push({
              url,
              teamInfo: match.teamInfo,
              matchResult: match.matchResult,
            });
          }
        } catch (e) {
          console.warn(`⚠️ match_info hatası [${url}]:`, e.message);
        }
      })
    )
  );

  return result.filter((item) => item !== null);
}

function saveJSONs(outputDir, name, newData) {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${name}.json`);

  let existingData = [];

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      existingData = JSON.parse(raw);
    } catch (err) {
      console.warn(`⚠️ Var olan dosya okunamadı (${filePath}): ${err.message}`);
    }
  }
  if (!Array.isArray(newData)) {
    newData = [newData];
  }

  const flatNewData = newData.flat();

  const map = new Map();

  for (const item of [...existingData, ...flatNewData]) {
    const key = `${item.url}-${item.name}`;
    const existing = map.get(key);

    if (
      !existing ||
      JSON.stringify(item).length > JSON.stringify(existing).length
    ) {
      map.set(key, item);
    }
  }

  const finalData = Array.from(map.values());

  try {
    fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2));
    console.log(`💾 ${finalData.length} veri kaydedildi: ${filePath}`);
  } catch (err) {
    console.error(`❌ Dosya yazılamadı (${filePath}): ${err.message}`);
  }
}

async function main(href, country, league, season) {
  const outputDir = getOutputDirPath(country, league, season);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    protocolTimeout: 60000,
  });

  try {
    const page = await browser.newPage();
    const pages = await page_count(page, href, season);
    await page.close();

    console.log(`🔄 Toplam sayfa: ${pages.length}`);
    const allMatchPages = await processPages(pages);
    console.log(`✅ Bulunan Maç linki sayısı: ${allMatchPages.length}`);
    const urls = getFilteredUrls(allMatchPages.flat(), country, league, season);
    console.log(`✅ Filrelenen Maç linki sayısı: ${urls.length}`);

    const matchInfos = await runMatchInfo(browser, urls, season, 5);
    if (matchInfos.length === 0) {
      console.log(
        "⚠️ Hiçbir geçerli maç verisi bulunamadı, işlem durduruluyor."
      );
      return;
    }

    saveJSON(outputDir, "match_info", matchInfos);

    const validUrls = matchInfos.map((item) => item.url);

    // Step 2: oneXtwo
    const oneXtwoData = await runFeature(
      oneXtwo,
      browser,
      validUrls,
      season,
      "oneXTwo",
      2
    );
    saveJSONs(outputDir, "oneXTwo", oneXtwoData);

    // // Step 3: bothTeamsToScore
    const bttsData = await runFeature(
      bothTeamsToScore,
      browser,
      validUrls,
      season,
      "bothTeamsToScore",
      2
    );
    saveJSONs(outputDir, "bothTeamsToScore", bttsData);

    // // Step 4: doubleChange
    const doubleChangeData = await runFeature(
      doubleChange,
      browser,
      validUrls,
      season,
      "doubleChange",
      2
    );
    saveJSONs(outputDir, "doubleChange", doubleChangeData);

    // // Step 5: drawNoBet
    const drawNoBetData = await runFeature(
      drawNoBet,
      browser,
      validUrls,
      season,
      "drawNoBet",
      2
    );
    saveJSONs(outputDir, "drawNoBet", drawNoBetData);

    // // Step 6: oddOrEven
    const oddOrEvenData = await runFeature(
      oddOrEven,
      browser,
      validUrls,
      season,
      "oddOrEven",
      2
    );
    saveJSONs(outputDir, "oddOrEven", oddOrEvenData);

    // // Step 7: overUnder
    const overUnderData = await runFeature(
      overUnder,
      browser,
      validUrls,
      season,
      "overUnder",
      2
    );
    saveJSONs(outputDir, "overUnder", overUnderData);

    // // Step 8: asianHandikap
    const asianHandikapData = await runFeature(
      asianHandicap,
      browser,
      validUrls,
      season,
      "asianHandicap",
      2
    );
    saveJSONs(outputDir, "asianHandicap", asianHandikapData);

    // Step 9: europeanHandicap
    const euroHandicapData = await runFeature(
      europeanHandicap,
      browser,
      validUrls,
      season,
      "europeanHandicap",
      2
    );
    saveJSONs(outputDir, "europeanHandicap", euroHandicapData);

    // Step 10: correctScore
    const correctScoreData = await runFeature(
      correctScore,
      browser,
      validUrls,
      season,
      "correctScore",
      2
    );
    saveJSONs(outputDir, "correctScore", correctScoreData);

    // Step 11: correctScore
    const halfFulltimeData = await runFeature(
      halfFulltime,
      browser,
      validUrls,
      season,
      "halfFulltime",
      2
    );
    saveJSONs(outputDir, "halfFulltime", halfFulltimeData);
  } catch (err) {
    console.error("❌ Genel Hata:", err.message);
  } finally {
    await browser.close();
  }
}

module.exports = {
  main,
};
