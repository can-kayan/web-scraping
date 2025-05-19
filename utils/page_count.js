async function page_count(page, url, season) {
  console.log(`⏳ ${season} için sayfa sayısı alınıyor...`);

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const maxPageNumber = await page.$$eval("a[data-number]", (links) => {
      if (!links || links.length === 0) return 1;

      const numbers = links
        .map((link) => parseInt(link.textContent.trim()))
        .filter((n) => !isNaN(n));
      return numbers.length > 0 ? Math.max(...numbers) : 1;
    });

    const totalPages = Math.max(1, maxPageNumber);

    const result = [];
    for (let i = 1; i <= totalPages; i++) {
      result.push(`${url}#/page/${i}/`);
    }

    console.log(`✅ ${season} için sayfa sayısı: ${result.length}`);
    return result;
  } catch (error) {
    console.error(`❌ Sayfa sayısı alınamadı: ${error.message}`);
    return [`${url}#/page/1/`];
  }
}

module.exports = {
  page_count,
};
