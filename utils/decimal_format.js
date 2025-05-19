async function selectDecimalOdds(page) {
  try {
    // 1. Dropdown'ı aç
    await page.waitForSelector('div.group', { visible: true });
    const groupElement = await page.$('div.group');
    if (!groupElement) throw new Error("div.group bulunamadı");

    await groupElement.click();
    console.log('✅ Dropdown açıldı.');

    // 2. Dropdown yüklensin
    await page.waitForSelector('.dropdown-content span.text-xs.text-nowrap', { visible: true });
    const spanElements = await page.$$('.dropdown-content span.text-xs.text-nowrap');

    let clicked = false;

    for (const span of spanElements) {
      const text = await page.evaluate(el => el.innerText, span);
      if (text.includes('Decimal Odds')) {
        const box = await span.boundingBox();
        if (box) {
          await span.click();
          console.log('✅ Decimal Odds seçildi.');
          clicked = true;
        } else {
          console.warn('⚠️ Span tıklanabilir değil.');
        }
        break;
      }
    }

    if (!clicked) {
      console.warn('⚠️ Decimal Odds seçeneği bulunamadı.');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

module.exports = {
  selectDecimalOdds
};
