const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DOC = path.join(__dirname, 'pt cheat sheet doc');

async function toPdf(htmlFile, pdfFile) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.goto(`file://${path.join(DOC, htmlFile)}`, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(DOC, pdfFile),
    displayHeaderFooter: false,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await browser.close();
  console.log('✓', pdfFile);
}

(async () => {
  await toPdf('mobile-pt-survival-guide-GUMROAD.html', 'mobile-pt-survival-guide.pdf');
  await toPdf('mobile-pt-manifesto-KINDLE.html',       'mobile-pt-manifesto.pdf');
})().catch(e => { console.error(e); process.exit(1); });
