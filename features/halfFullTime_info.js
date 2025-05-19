const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { parsePopup } = require("../utils/parsePopup");
const { createConfiguredPage } = require("../utils/new_page");
const { default: pLimit } = require("p-limit");

puppeteer.use(StealthPlugin());
const formatData = ["27", "30", "33", "28", "31", "34", "29", "32", "35"];
const keyData = ["1-1", "1-x", "1-2", "x-1", "x-x", "x-2", "2-1", "2-x", "2-2"];

async function halfFulltime(browser, url, season) {
  const keywords = [
    "BET365",
    "BETFAIR",
    "PINNACLE",
    "UNIBET",
    "1XBET",
    "WILLIAM",
  ];
  const tabLabels = "Full Time";
  const firmMap = {};

  const limit = pLimit(1);
  const tasks = formatData.map((thresholdRaw, index) =>
    limit(async () => {
      try {
        const page = await createConfiguredPage(browser);
        await page.goto(url + "#ht-ft;2;" + thresholdRaw, {
          waitUntil: "networkidle2",
          timeout: 20000,
        });
        await new Promise((r) => setTimeout(r, 500));  
        const arrows = await page.$$("div.invisible.absolute.left-1");
        console.log(
          `🧷 ${thresholdRaw} için ${arrows.length} bağlantı bulundu`
        );

        for (let a = 0; a < arrows.length; a++) {
          const arrow = arrows[a];
          const positionHint = "odds";

          try {
            await page.evaluate((el) => el.click(), arrow);
            await page.waitForSelector("div.bg-white-main.text-black-main", {
              visible: true,
              timeout: 5000,
            });

            const popupText = await page.$eval(
              "div.bg-white-main.text-black-main",
              (el) => el.textContent
            );

            for (const raw of popupText.split(/TO\s+/).slice(1)) {
              for (const firm of keywords) {
                if (raw.toUpperCase().startsWith(firm)) {
                  const parsed = parsePopup(`TO ${raw}`, positionHint);

                  // firmMap içinde 'parsed.name' varsa oluşturulmamışsa oluşturulacak
                  if (!firmMap[parsed.name]) {
                    firmMap[parsed.name] = {
                      url,
                      name: parsed.name,
                    };
                  }

                  // firmMap[parsed.name][tabLabels] kısmını kontrol et
                  if (!firmMap[parsed.name][tabLabels]) {
                    firmMap[parsed.name][tabLabels] = {};
                  }

                  // keyData[index] kısmını kontrol et
                  if (!firmMap[parsed.name][tabLabels][keyData[index]]) {
                    firmMap[parsed.name][tabLabels][keyData[index]] = {};
                  }

                  // Son olarak veriyi ekleyin
                  firmMap[parsed.name][tabLabels][keyData[index]][
                    positionHint
                  ] = {
                    open: parsed.open,
                    close: parsed.close,
                  };
                }
              }
            }

            await page.mouse.click(10, 10);
            await new Promise((r) => setTimeout(r, 500));
          } catch (err) {
            console.log("⚠️ Popup açılmadı veya geç geldi:", err.message);
          }
        }

        await page.close();
        console.log(`✅ ${thresholdRaw} tamamlandı`);
      } catch (err) {
        console.log(`❌ ${thresholdRaw} yüklenemedi: ${err.message}`);
      }
    })
  );
 
  await Promise.all(tasks);
  console.log(`✅ Half/Full Time Tamamlandı`);
 
  const result = Object.values(firmMap);
  if (result.length === 0) {
    console.log("⚠️ Hiç veri bulunamadı.");
    return [];  
  }

  console.log(`✅ Sonuçlar hazır`);
  return result;
}

module.exports = {
  halfFulltime,
};
