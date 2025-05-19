const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { default: pLimit } = require("p-limit");

const ligInfoPath = path.join(
  __dirname,
  "..",
  "data",
  "league_information.json"
);
const seasonInfoPath = path.join(
  __dirname,
  "..",
  "data",
  "season_information.json"
);

const ligData = JSON.parse(fs.readFileSync(ligInfoPath, "utf8"));

async function scrapeSeason() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=en-US"],
  });
 
  const scrapePage = async (lig) => {
    const page = await browser.newPage();

    try {
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const blocked = ["image", "stylesheet", "font", "media"];
        if (blocked.includes(req.resourceType())) req.abort();
        else req.continue();
      });

      await page.goto(lig.href, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      const ligLinks = await page.evaluate(() => {
        const container = document.querySelector(
          "div.flex.flex-wrap.gap-2.py-3.text-xs.max-mm\\:flex-nowrap.max-mm\\:overflow-x-auto.max-mm\\:overflow-hidden.max-md\\:mx-3.max-sm\\:\\!hidden.no-scrollbar"
        );
        if (!container) return [];

        return Array.from(container.querySelectorAll("a"))
          .map((link) => ({
            name: link.textContent.trim(),
            href: link.href,
          }))
          .filter((item) => item.name && item.href);
      });

      if (ligLinks.length === 0) {
        console.warn(`⚠️  ${lig.name} - ${lig.lig} sezon bilgisi bulunamadı.`);
        return null;
      }

      console.log(
        `✅ ${lig.name} - ${lig.lig} (${ligLinks.length} sezon) alındı.`
      );
      return {
        name: lig.name,
        lig: lig.lig,
        image: lig.image,
        href: lig.href,
        season: ligLinks,
      };
    } catch (err) {
      console.error(`❌ Hata (${lig.name} - ${lig.lig}): ${err.message}`);
      return null;
    } finally {
      await page.close();
    }
  };
 
  const limit = pLimit(5);
  const tasks = ligData.map((lig) => limit(() => scrapePage(lig)));

  const results = (await Promise.all(tasks)).filter(Boolean);

  await browser.close();

  fs.writeFileSync(seasonInfoPath, JSON.stringify(results, null, 2), "utf8");
  console.log(
    `📁 ${results.length} lig sezon bilgisi kaydedildi: season_information.json`
  );
}

scrapeSeason();
