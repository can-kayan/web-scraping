const puppeteer = require("puppeteer");
const { default: pLimit } = require("p-limit");

const LINK_SELECTOR =
  "a.next-m\\:flex.next-m\\:\\!mt-0.ml-2.mt-2.min-h-\\[32px\\].w-full.hover\\:cursor-pointer";

async function getMatchLinksFromPage(page, url) {
  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 11000,
    });

    let matchLinks = [];
    let previousHeight = 0;
    let newHeight = 0;
    let retries = 0;

    while (true) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }); 
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let currentLinks = await page.$$eval(LINK_SELECTOR, (elements) =>
        elements.map((el) => el.href)
      );

      matchLinks = [...new Set([...matchLinks, ...currentLinks])];

      newHeight = await page.evaluate(() => document.body.scrollHeight);

      if (newHeight === previousHeight) {
        retries++;
        if (retries >= 4) break;
      } else {
        retries = 0;
      }

      previousHeight = newHeight;
    }

    console.log(`✅ Sayfada bulunan ${matchLinks.length} maç linki.`);
    return matchLinks;
  } catch (error) {
    console.error("❌ Sayfa hatası: ", error.message);
    return [];
  }
}

async function processPages(urls) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const limit = pLimit(1);
  const allMatchLinks = [];
  const EXPECTED_MATCH_COUNT = 50;
  const MAX_RETRIES = 4;

  async function processSinglePage(url, attempt = 1) {
    const page = await browser.newPage();
    try {
      console.log(`📄 Sayfa işleniyor (deneme ${attempt}): ${url}`);
      const links = await getMatchLinksFromPage(page, url);

      if (links.length < EXPECTED_MATCH_COUNT && attempt < MAX_RETRIES) {
        console.warn(
          `⚠️ Beklenen maç sayısı ${EXPECTED_MATCH_COUNT}, ama sadece ${links.length} bulundu. Yeniden denenecek...`
        );
        await page.close();
        return await processSinglePage(url, attempt + 1);
      }

      await page.close();
      return links;
    } catch (err) {
      console.error(`❌ Hata oluştu: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`🔁 Yeniden deneniyor (${attempt + 1})...`);
        // await page.close();
        return await processSinglePage(url, attempt + 1);
      }
      console.error(`🚫 Sayfa atlandı: ${url}`);
      return [];
    } finally {
    }
  }

  const promises = urls.map((url) =>
    limit(async () => {
      const links = await processSinglePage(url);
      allMatchLinks.push(...links);
    })
  );

  await Promise.all(promises);
  await browser.close();

  console.log(`🎯 Toplam bulunan maç linki: ${allMatchLinks.length}`);
  return allMatchLinks;
}

module.exports = {
  processPages,
};
