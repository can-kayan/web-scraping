const fs = require("fs");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/113.0",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1",
];

 

async function createConfiguredPage(browser) {
  const page = await browser.newPage();

  // Rastgele User-Agent
  // const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
  // await page.setUserAgent(randomUA);

  // Viewport
  await page.setViewport({ width: 1000, height: 998 });
  // Bot tespiti azaltma
  // await page.evaluateOnNewDocument(() => {
  //   Object.defineProperty(navigator, "webdriver", { get: () => false });
  //   Object.defineProperty(navigator, "languages", {
  //     get: () => ["en-US", "en"],
  //   });
  //   Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
  //   Object.defineProperty(navigator, "platform", { get: () => "Win32" });
  // });

  // // Gereksiz kaynakları engelle
  // await page.setRequestInterception(true);
  // page.on("request", (req) => {
  //   const type = req.resourceType();
  //   if (["image", "stylesheet", "font"].includes(type)) {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });
 

  return page;
}

module.exports = {
  createConfiguredPage,
};
