const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { parsePopup } = require("../utils/parsePopup");
const { createConfiguredPage } = require("../utils/new_page");
const { default: pLimit } = require("p-limit");

puppeteer.use(StealthPlugin());

async function europeanHandicap(browser, url, season) {
  const keywords = [
    "BET365",
    "BETFAIR",
    "PINNACLE",
    "UNIBET",
    "1XBET",
    "WILLIAM",
  ];
  const tabLabels = ["Full Time", "1st Half", "2nd Half"];
  const keys = ["fullTime", "oneHalf", "twoHalf"];
  const urlsss = ["#eh;2;", "#eh;3;", "#eh;4;"];
  const firmMap = {};

  const start = tabLabels.map(async (item, c) => {
    const page = await createConfiguredPage(browser);
    const formattedThresholds = [];
    const key = keys[c];
    const ek = urlsss[c];
    await page.goto(url + ek, { waitUntil: "networkidle2", timeout: 20000 }); 
    try {
      await page.waitForSelector("div.relative.flex.flex-col", {
        visible: true,
        timeout: 4000,
      });
    } catch (err) {
      console.log(`❌ ${tabLabels[c]} sayfa yüklenemedi: ${err.message}`);
      return;
    }

    const divs = await page.$$("div.relative.flex.flex-col");
    console.log(`🔄 European Handicap - ${tabLabels[c]} - Başladı`);

    for (let div of divs) {
      const threshold = await page.evaluate((el) => {
        const p = el.querySelector("div > div > div > p[class*='max-sm']");
        return p ? p.textContent.trim() : null;
      }, div);

      if (threshold) {
        const match = threshold.match(/[-+]\d+(?:\.\d+)?/);
        if (match) {
          const num = parseFloat(match[0]).toFixed(2);
          formattedThresholds.push(`${num};0`);
        }
      }
    }

    console.log(
      `✅ European Handicap - ${tabLabels[c]} toplam indirilecek alan ${formattedThresholds.length}`
    );
    const limit = pLimit(1); 
    await Promise.all(
      formattedThresholds.map((thresholdRaw) =>
        limit(async () => {
          const threshold = thresholdRaw.split(";")[0];
          try {
            await page.goto(url + urlsss[c] + thresholdRaw);
            await page.reload({
              waitUntil: "networkidle2",
              timeout: 20000,
            });
            const arrows = await page.$$("div.invisible.absolute.left-1");
            console.log(
              `🧷 ${thresholdRaw} için ${arrows.length} bağlantı bulundu`
            );

            for (let a = 0; a < arrows.length; a++) {
              const arrow = arrows[a];
              const positionHint =
                a % 3 === 0 ? "one" : a % 3 === 1 ? "x" : "two";

              try {
                await page.evaluate((el) => el.click(), arrow);
                await page.waitForSelector(
                  "div.bg-white-main.text-black-main",
                  {
                    visible: true,
                    timeout: 5000,
                  }
                );

                const popupText = await page.$eval(
                  "div.bg-white-main.text-black-main",
                  (el) => el.textContent
                );

                for (const raw of popupText.split(/TO\s+/).slice(1)) {
                  for (const firm of keywords) {
                    if (raw.toUpperCase().startsWith(firm)) {
                      const parsed = parsePopup(`TO ${raw}`, positionHint);
                      if (!firmMap[parsed.name]) {
                        firmMap[parsed.name] = {
                          url,
                          name: parsed.name,
                          fullTime: {},
                          oneHalf: {},
                          twoHalf: {},
                        };
                      }

                      if (!firmMap[parsed.name][key][threshold]) {
                        firmMap[parsed.name][key][threshold] = {};
                      }

                      firmMap[parsed.name][key][threshold][positionHint] = {
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

            console.log(`✅ ${tabLabels[c]} => ${thresholdRaw} tamamlandı`);
          } catch (err) {
            console.log(`❌ ${thresholdRaw} yüklenemedi: ${err.message}`);
          } finally {
            // await page.close();
          }
        })
      )
    );
    await page.close();
    console.log(`✅ European Handicap - ${tabLabels[c]} - Tamamlandı`);
  });

  await Promise.all(start);
  const result = Object.values(firmMap);
  console.log(JSON.stringify(result, null, 2));
  console.log(`✅ European Handicap Tüm işlemler tamamlandı`);
  return result;
}

module.exports = {
  europeanHandicap,
};
