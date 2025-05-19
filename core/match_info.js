const { formatDateTime } = require("../utils/dateTime");
const { match_result } = require("../features/match_result_info");

async function match_info(browser, url, season) {
  const [country, league] = season.split("-");
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });
     await new Promise((r) => setTimeout(r, 500));
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0"
    );
    await page.setViewport({ width: 750, height: 998 });
    await page.waitForSelector("p.text-\\[22px\\].self-center.truncate", {
      timeout: 10000,
    });

    const data = await page.evaluate(() => {
      const keywords = ["bet365", "betfair", "pinnacle", "unibet", "1xbet"];
      const divs = document.querySelectorAll(
        "div.min-ms\\:\\!justify-start.flex.w-full.items-center.justify-center.max-sm\\:flex-wrap.max-sm\\:gap-1.border-\\[\\#E0E0E0\\]"
      );
      let shouldProceed = false;
      divs.forEach((div) => {
        const a = div.querySelector("a");
        if (a && a.href) {
          if (keywords.some((word) => a.href.includes(word))) {
            shouldProceed = true;
          }
        }
      });

      if (shouldProceed) {
        const teams = Array.from(
          document.querySelectorAll("p.text-\\[22px\\].self-center.truncate")
        );
        const team1 = teams[0]?.textContent.trim() || null;
        const team2 = teams[1]?.textContent.trim() || null;

        const dateElements = document.querySelectorAll(
          "div.text-gray-dark.font-main.item-center.flex.gap-1.text-xs.font-normal p"
        );
        const dates = Array.from(dateElements).map((p) => p.textContent.trim());

        const resultDiv = document.querySelector(
          "div.flex.max-sm\\:gap-2 div.flex.flex-wrap"
        );
        const ms =
          resultDiv?.querySelector("strong")?.textContent?.trim() || null;
        const matchText = resultDiv?.textContent || "";
        const parts =
          matchText.match(
            /\((\d+:\d+)(?:,\s*(\d+:\d+))?(?:,\s*(\d+:\d+))?\)/
          ) || [];

        return {
          team1,
          team2,
          dates,
          ms,
          oneHalf: parts[1] || null,
          twoHalf: parts[2] || "Bulunamadı",
          thirdHalf: parts[3] || "Bulunamadı",
        };
      } else {
        console.log("⚠️ Aranan bahis firmaları maçta bulunamadı");
        return null;
      }
    });
    if (!data || !data.team1 || !data.team2 || !data.ms || !data.oneHalf) {
      console.warn(`⚠️ Eksik veri: ${url}`);
      return null;
    }

    const match_results_info = match_result(data.ms, data.oneHalf);

    await page.close();

    const dateTime = formatDateTime(data.dates || []);
    const ide = url.split("/").filter(Boolean).pop().split("-").pop();

    console.log(
      `✅ ${season} - ${country} - ${league} - ${ide} - ${data.team1} vs ${data.team2}`
    );
    console.log(`✅ Maç sonucu çekildi - ${data.team1} vs ${data.team2}`);
    return {
      url,
      matchResult: match_results_info,
      teamInfo: {
        day:dateTime.day,
        month:dateTime.month,
        year:dateTime.year,
        dayOfTheWeek:dateTime.dayOfTheWeek,
        ide, 
        date:dateTime.date,
        time:dateTime.time,
        country,
        league,
        homeowner: data.team1,
        away: data.team2,
        ms: data.ms,
        oneHalf: data.oneHalf,
        twoHalf: data.twoHalf

      },
    };
  } catch (e) {
    console.error(` ${url.split('/')[6]} - maç bilgisi alınamadı 3 saniye sonra tekrar denenecek`);
    await new Promise((r) => setTimeout(r, 500));
    await match_info(browser, url,season)
  }
}

module.exports = {
  match_info,
};
