const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { parsePopup } = require("../utils/parsePopup");
const { createConfiguredPage } = require("../utils/new_page");

puppeteer.use(StealthPlugin());

async function oddOrEven(browser, url, season) {
  const keywords = ["BET365", "BETFAIR", "PINNACLE", "UNIBET", "1XBET"];
  const triggerSelector = "div.flex-center.flex-col.font-bold ";
  const popupSelector = "div.bg-white-main.text-black-main";

  const matchedPopups = [];
  const tabLabels = ["Full Time", "1st Half", "2nd Half"];
  const keys = ["fullTime", "oneHalf", "twoHalf"];
  const urlss = ["#odd-even;2", "#odd-even;3", "#odd-even;4"];
  await Promise.all(
    tabLabels.map(async (label, i) => {
      const key = keys[i];
      const page = await createConfiguredPage(browser);
      
      try {
        await page.goto(url + urlss[i],{
        waitUntil: "networkidle2",
        timeout: 20000,
      }); 
        console.log(`🔄 odd-even - $${label} başladı`);

        await page.waitForSelector(triggerSelector, {
          visible: true,
          timeout: 5000,
        });
        const triggerDivs = await page.$$(triggerSelector);
        const positionHints = ["odd", "even"];

        for (let j = 0; j < triggerDivs.length; j++) {
          const div = triggerDivs[j];
          const positionHint = positionHints[j % 2];

          try {
            await page.evaluate((el) => el.click(), div);
            await new Promise((r) => setTimeout(r, 500));
            await page.waitForSelector(popupSelector, {
              visible: true,
              timeout: 5000,
            });

            const popupHtmlFull = await page.$eval(
              popupSelector,
              (el) => el.textContent
            );

            for (const rawBlock of popupHtmlFull.split(/TO\s+/).slice(1)) {
              for (const firm of keywords) {
                if (rawBlock.toUpperCase().startsWith(firm)) {
                  const fullBlock = `TO ${rawBlock}`;
                  const parsed = parsePopup(fullBlock, positionHint);
                  parsed.name = firm;
                  parsed.positionHint = positionHint;

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

            await page.mouse.click(10, 10);  
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (err) {
            console.warn(`${label} - popup alınamadı (${j}):`, err.message);
          }
        }
      } catch (err) {
        console.warn(`${label} - genel hata:`, err.message);
      } finally {
        console.log(`✅ odd-even - $${label} Tamamlandı`);
        await page.close();
      }
    })
  );

  console.log(`✅ odd-even çekildi - ${season}`);
  
  console.log(JSON.stringify(matchedPopups));
  return transformOddsData(matchedPopups);
}

function transformOddsData(data) {
  const grouped = {};

  for (const item of data) {
    const { name, tabKey, positionHint, entry,url } = item;

    if (!grouped[name]) {
      grouped[name] = {
        url,
        name,
        fullTime: { odd: null, even: null },
        oneHalf: { odd: null, even: null },
        twoHalf: { odd: null, even: null },
      };
    }

    if (
      positionHint &&
      ["odd", "even"].includes(positionHint) &&
      grouped[name][tabKey]
    ) {
      grouped[name][tabKey][positionHint] = entry;
    }
  }
  return Object.values(grouped);
}

module.exports = {
  oddOrEven,
};
