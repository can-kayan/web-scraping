const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const dataPath = path.join(__dirname, "..", "data", "country_information.json");

if (!fs.existsSync(dataPath)) {
  console.error("HATA: 'country_information.json' dosyası bulunamadı.");
  process.exit(1);
}
const scrapedData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

async function scrapeLig() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--lang=en-US",  
    ],
  });
  const page = await browser.newPage();

  await page.goto("....url..../football/results/", {
    waitUntil: "domcontentloaded",
  });

  const ligData = await page.evaluate(() => {
    const ulElements = document.querySelectorAll(
      "ul.flex.content-start.w-full.text-xs.border-l.max-sm\\:flex-col.min-sm\\:flex-wrap.border-black-borders"
    );
    const ligLinks = [];

    ulElements.forEach((ul) => {
      const links = ul.querySelectorAll("a");
      links.forEach((link) => {
        const href = link.href;
        const text = link.textContent.trim();
        ligLinks.push({ name: text, href });
      });
    });

    return ligLinks;
  });

  const newData = scrapedData
    .map((country) => {
      const ligDetails = ligData
        .map((lig) => {
          const parts = lig.href.split("/");
          if (parts[4] === country.name.toLowerCase()) {
            return {
              name: country.name,
              image: country.image,
              href: lig.href,
              lig: lig.name,
            };
          }
          return null;
        })
        .filter(Boolean);

      return ligDetails;
    })
    .flat();
  const outputDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  fs.writeFileSync(
    path.join(outputDir, "league_information.json"),
    JSON.stringify(newData, null, 2)
  );

  console.log("Data scraped and saved to league_information.json");

  await browser.close();
}

scrapeLig();
