const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { parsePopup } = require("../utils/parsePopup");
const { createConfiguredPage } = require("../utils/new_page");
const { selectDecimalOdds } = require("../utils/decimal_format");

puppeteer.use(StealthPlugin());

async function oneXtwo(browser, url, season) {
  const keywords = ["BET365", "BETFAIR", "PINNACLE", "UNIBET", "1XBET"];
  const triggerSelector = "div.flex-center.flex-col.font-bold";
  const popupSelector = "div.bg-white-main.text-black-main";

  const matchedPopups = [];
  const tabLabels = ["Full Time", "1st Half", "2nd Half"];
  const keys = ["fullTime", "oneHalf", "twoHalf"];
  const urlss = ["#1X2;2", "#1X2;3", "#1X2;4"];

  for (let i = 0; i < tabLabels.length; i++) {
    const label = tabLabels[i];
    const key = keys[i];

    const page = await createConfiguredPage(browser);
    try {
      await page.goto(url + urlss[i]);

      console.log(`🔄 1x2 - ${label} başladı`);

      await page.waitForSelector(triggerSelector, {
        visible: true,
        timeout: 5000,
      });
      // await selectDecimalOdds(page);
      const triggerDivs = await page.$$(triggerSelector);
      const positionHints = ["one", "x", "two"];

      for (let j = 0; j < triggerDivs.length; j++) {
        const div = triggerDivs[j];
        const positionHint = positionHints[j % 3];

        try {
          await div.click();
          await page.waitForSelector(popupSelector, {
            visible: true,
            timeout: 5000,
          });

          const popupText = await page.$eval(
            popupSelector,
            (el) => el.textContent
          );
          for (const rawBlock of popupText.split(/TO\s+/).slice(1)) {
            for (const firm of keywords) {
              if (rawBlock.toUpperCase().startsWith(firm)) {
                const fullBlock = `TO ${rawBlock}`;
                const parsed = parsePopup(fullBlock, positionHint);

                matchedPopups.push({
                  url,
                  name: firm,
                  tabKey: key,
                  positionHint,
                  entry: parsed,
                });
              }
            }
          }

          await page.keyboard.press("Escape");  
          //  await new Promise((r) => setTimeout(r, 500));
        } catch (err) {
          console.warn(`${label} - popup alınamadı (${j}): ${err.message}`);
          
        }
      }
      
      await page.close();
    } catch (err) {
      console.warn(`${label} - genel hata: ${err.message}`);
      continue
    } finally {
      console.log(`✅ 1x2 - ${label} tamamlandı`);
    }
  }
  console.log(transformOddsData(matchedPopups));

  console.log(`✅ 1x2 tüm veriler alındı - ${season}`);
  return transformOddsData(matchedPopups);
}

function transformOddsData(data) {
  const grouped = {};

  for (const item of data) {
    const { name, tabKey, positionHint, entry, url } = item;

    const key = `${url}__${name}`; // her maç+firma için eşsiz anahtar

    if (!grouped[key]) {
      grouped[key] = {
        url,
        name,
        fullTime: { one: null, x: null, two: null },
        oneHalf: { one: null, x: null, two: null },
        twoHalf: { one: null, x: null, two: null },
      };
    }

    if (["one", "x", "two"].includes(positionHint) && grouped[key][tabKey]) {
      grouped[key][tabKey][positionHint] = entry;
    }
  }

  return Object.values(grouped);
}

module.exports = {
  oneXtwo,
};
