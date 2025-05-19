const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function scrapeCountry() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--lang=en-US",  
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();
 
  const domain = "......url......";
 

  try {
    await page.goto(`${domain}/football/results/`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
 
    await page.waitForSelector("div.flex.items-center.gap-2.ml-2", {
      timeout: 10000,
    });

    const countries = await page.evaluate(() => {
      const seen = new Set();
      const data = [];

      const items = document.querySelectorAll("div.flex.items-center.gap-2.ml-2");
      for (const item of items) {
        const img = item.querySelector("img");
        const link = item.querySelector("a");
        if (img && link) {
          const name = link.textContent.trim();
          const image = img.src;
          if (!seen.has(name)) {
            seen.add(name);
            data.push({ name, image });
          }
        }
      }

      return data;
    });
 
    const outputDir = path.join(__dirname, "..", "data");
    const filePath = path.join(outputDir, "country_information.json");
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(countries, null, 2));

    console.log(`✅ ${countries.length} ülke bilgisi kaydedildi: ${filePath}`);
  } catch (err) {
    console.error("❌ Hata oluştu:", err.message);
  } finally {
    await browser.close();
  }
}

scrapeCountry();
