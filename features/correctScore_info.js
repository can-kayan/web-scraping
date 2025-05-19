const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { parsePopup } = require("../utils/parsePopup");
const { createConfiguredPage } = require("../utils/new_page");
const { default: pLimit } = require("p-limit");

puppeteer.use(StealthPlugin());

const formatData = {
  "1:0": "2",
  "2:0": "5",
  "2:1": "6",
  "3:0": "10",
  "3:1": "11",
  "3:2": "12",
  "4:0": "18",
  "4:1": "19",
  "4:2": "20",
  "4:3": "21",
  "5:0": "36",
  "5:1": "37",
  "5:2": "44",
  "5:3": "45",
  "5:4": "46",
  "6:0": "38",
  "6:1": "39",
  "6:2": "47",
  "6:3": "48",
  "6:4": "49",
  "6:5": "63",
  "7:0": "50",
  "7:1": "51",
  "7:2": "52",
  "7:3": "84",
  "7:4": "85",
  "8:0": "66",
  "8:1": "67",
  "8:2": "73",
  "8:3": "74",
  "8:4": "75",
  "9:0": "68",
  "9:1": "95",
  "9:2": "96",
  "9:3": "97",
  "10:0": "69",
  "10:1": "106",
  "10:2": "107",
  "10:3": "111",
  "0:0": "1",
  "1:1": "3",
  "2:2": "7",
  "3:3": "13",
  "4:4": "17",
  "5:5": "53",
  "0:1": "4",
  "0:2": "9",
  "1:2": "8",
  "0:3": "16",
  "1:3": "15",
  "2:3": "14",
  "0:4": "25",
  "1:4": "24",
  "2:4": "23",
  "3:4": "22",
  "0:5": "40",
  "1:5": "41",
  "2:5": "54",
  "3:5": "55",
  "4:5": "56",
  "0:6": "42",
  "1:6": "43",
  "2:6": "57",
  "3:6": "58",
  "4:6": "59",
  "5:6": "64",
  "0:7": "60",
  "1:7": "61",
  "2:7": "62",
  "3:7": "88",
  "4:7": "89",
  "0:8": "65",
  "1:8": "70",
  "2:8": "78",
  "3:8": "79",
  "0:9": "71",
  "1:9": "100",
  "2:9": "101",
  "0:10": "72",
};

const reverseFormatData = Object.fromEntries(
  Object.entries(formatData).map(([score, code]) => [
    code.replace(";", ""),
    score,
  ])
);

async function correctScore(browser, url, season) {
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
  const urlsss = ["#cs;2", "#cs;3", "#cs;4"];
  const firmMap = {};

  const start = tabLabels.map(async (item, c) => {
    const page = await createConfiguredPage(browser);
    const formattedThresholds = [];
    const key = keys[c];
    const ek = urlsss[c];
    await page.goto(url + ek, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });
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
    console.log(`🔄 Correct Score - ${tabLabels[c]} - Başladı`);

    for (let div of divs) {
      const threshold = await page.evaluate((el) => {
        const p = el.querySelector("div > div > div > p");
        return p ? p.textContent.trim() : null;
      }, div);

      if (threshold && formatData[threshold]) {
        formattedThresholds.push(formatData[threshold]);
      }
    }

    console.log(
      `✅ Correct Score - ${tabLabels[c]} toplam indirilecek alan ${formattedThresholds.length}`
    );
    const limit = pLimit(1); 
    await Promise.all(
      formattedThresholds.map((thresholdRaw) =>
        limit(async () => {
          const threshold = reverseFormatData[thresholdRaw];
          try {
            await page.goto(url + urlsss[c] + ";" + thresholdRaw);
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
              const positionHint = 'odds';

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
    console.log(`✅ Correct Score - ${tabLabels[c]} - Tamamlandı`);
  });

  await Promise.all(start);
  const result = Object.values(firmMap);
  console.log(JSON.stringify(result, null, 2));
  console.log(`✅ Correct Score Tüm işlemler tamamlandı`);
  return result;
}

module.exports = {
  correctScore,
};
