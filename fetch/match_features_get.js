const { default: puppeteer } = require("puppeteer");
const fs = require("fs");
const { default: pLimit } = require("p-limit");
const path = require("path");
const readline = require("readline");
 
const { overUnder } = require("../features/overUnder_info");
const { drawNoBet } = require("../features/drawNoBet_info");
const { bothTeamsToScore } = require("../features/bothTeamsToScores_info");
const { correctScore } = require("../features/correctScore_info");
const { doubleChange } = require("../features/doubleChange_info");
const { europeanHandicap } = require("../features/europeanHandicap_info");
const { halfFulltime } = require("../features/halfFullTime_info");
const { oddOrEven } = require("../features/oddOrEven_info");
const { oneXtwo } = require("../features/oneXtwo_info");
const { match_info } = require("../core/match_info");
const { asianHandicap } = require("../features/asianHandicap_info");
const { selectDecimalOdds } = require("../utils/decimal_format");
const { createConfiguredPage } = require("../utils/new_page");
const {  exportXlsx } = require("../middleware/excel");
 
const FEATURE_FUNCTIONS = {
  overUnder,
  drawNoBet,
  bothTeamsToScore,
  correctScore,
  doubleChange,
  europeanHandicap,
  halfFulltime,
  oddOrEven,
  oneXtwo,
  match_info,
  asianHandicap, 
};

const DATA_DIR = path.join(__dirname, "..", "data");
const REQUIRED_FILES = ["match_info.json"];
 
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function input(soru) {
  return new Promise((resolve) => rl.question(soru, resolve));
}
 
function getValidDatasetFolders() {
  const allFolders = fs.readdirSync(DATA_DIR);
  return allFolders.filter((folderName) => {
    const folderPath = path.join(DATA_DIR, folderName);
    if (!fs.lstatSync(folderPath).isDirectory()) return false;
    const files = fs.readdirSync(folderPath);
    return REQUIRED_FILES.every((file) => files.includes(file));
  });
}
 
function getUrlsFromMatchInfo(folderName) {
  const filePath = path.join(DATA_DIR, folderName, "match_info.json");

  if (!fs.existsSync(filePath)) {
    console.warn(`❌ match_info.json bulunamadı: ${filePath}`);
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    return parsed.map((match) => match.url?.trim()).filter(Boolean);
  } catch (err) {
    console.error(`❌ match_info.json okunamadı veya geçersiz: ${err.message}`);
    return [];
  }
}
 
async function runFeature(
  featureFn,
  browser,
  urls,
  season,
  featureName,
  concurrency = 2
) {
  const limit = pLimit(concurrency);
  const outputDir = getOutputDirPath(season);
  const tasks = urls.map((url) =>
    limit(async () => {
      try {
        
        const featureData = await featureFn(browser,url,season);  
        console.log(`✅ İşlendi (${featureName}): ${url}`);
        console.log(featureData);
        
        saveJSON(outputDir, featureName, featureData);
        return { url, [featureName]: featureData };
      } catch (e) {
        console.warn(`⚠️ Hata (${featureName}) [${url}]: ${e.message}`);
        return null;
      }
    })
  );

  const results = await Promise.all(tasks);
  return results.filter(Boolean);
}

 
function saveJSON(outputDir, name, newData) {
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
 
    if (!existing || JSON.stringify(item).length > JSON.stringify(existing).length) {
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
 
function getObjectValueCount(obj) {
  if (!obj || typeof obj !== "object") return 0;
 
  return Object.values(obj)
    .map((v) => (typeof v === "object" ? getObjectValueCount(v) : v))
    .filter((v) => v !== null && v !== undefined && v !== "").length;
}
 
function getOutputDirPath(season) {
  const safeName = `${season}`.replace(/[\/\\:*?"<>|]/g, "-");
  return path.join(__dirname, "..", "data", safeName);
}
 
async function askUserToSelectFolder(folders) {
  console.log("\n📁 Mevcut veri klasörleri:\n");
  folders.forEach((name, idx) => {
    console.log(`${idx + 1}- ${name}`);
  });

  const answer = await input("\nLütfen bir klasör seçin (numara): ");
  const index = parseInt(answer.trim(), 10) - 1;

  if (isNaN(index) || index < 0 || index >= folders.length) {
    console.warn("❌ Geçersiz seçim.");
    return null;
  }

  return folders[index];
}
 
async function askFeatureSelection() {
  const available = Object.keys(FEATURE_FUNCTIONS);
  console.log("\n⚙️ Mevcut özellikler:\n");
  available.forEach((name, idx) => {
    console.log(`${idx + 1}- ${name}`);
  });

  const selection = await input(
    "\nLütfen bir özellik seçin (ad veya numara): "
  );
  const index = parseInt(selection.trim(), 10);

  if (!isNaN(index) && index >= 1 && index <= available.length) {
    return available[index - 1];
  } else if (available.includes(selection.trim())) {
    return selection.trim();
  } else {
    console.warn("❌ Geçersiz özellik seçimi.");
    return null;
  }
}

function getFilteredUrls(incomingUrls, selectedFeature, season) {
  const outputDir = getOutputDirPath(season);
  const selectedFeaturePath = path.join(outputDir, `${selectedFeature}.json`);

  let existingUrls = [];

  if (fs.existsSync(selectedFeaturePath)) {
    try {
      const content = fs.readFileSync(selectedFeaturePath, "utf-8");
      const parsed = JSON.parse(content);
      existingUrls = parsed.map((match) => match.url?.trim()).filter(Boolean);
    } catch (err) {
      console.warn(
        `⚠️ ${selectedFeature}.json okunamadı veya bozuk:`,
        err.message
      );
    }
  }

  const cleanedIncoming = [...new Set(incomingUrls.map((url) => url.trim()))];

  if (existingUrls.length > 0) {
    return cleanedIncoming.filter((url) => !existingUrls.includes(url));
  }

  return cleanedIncoming;
}
async function main() {
  const validFolders = getValidDatasetFolders();
  if (validFolders.length === 0) {
    console.log("⚠️ Uygun veri klasörü bulunamadı.");
    rl.close();
    return;
  }

  const folder = await askUserToSelectFolder(validFolders);
  if (!folder) {
    rl.close();
    return;
  }

  const selectedFeature = await askFeatureSelection();
  if (!selectedFeature) {
    rl.close();
    return;
  }

  const featureFn = FEATURE_FUNCTIONS[selectedFeature];

  const urls = getUrlsFromMatchInfo(folder); 
  if (urls.length === 0) {
    console.log("⚠️ İndirilecek URL bulunamadı.");
    rl.close();
    return;
  }

  console.log(
    `\n🔎 ${urls.length} maç için "${selectedFeature}" verisi indiriliyor...\n`
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    protocolTimeout: 60000,
  }); 
  
  await runFeature(featureFn, browser, urls, folder, selectedFeature, 1);

  await browser.close();
  rl.close();
  exportXlsx(folder)
  console.log("✅ İşlem başarıyla tamamlandı.");
}

main();
