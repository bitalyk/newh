const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/run-script', async (req, res) => {
  try {
    const requestUrl = req.query.url;
    if (!requestUrl) {
      return res.status(400).send('URL query parameter is required');
    }

    const pathFragment = new URL(requestUrl).hash.split('/')[1];
    const targetUrl = `https://hamsterkombatgame.io/clicker/${pathFragment}`;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    let authToken = null;

    await page.goto(targetUrl);

    page.on('request', request => {
      const url = request.url();
      if (url === 'https://api.hamsterkombatgame.io/clicker/sync') {
        const headers = request.headers();
        if (headers['authorization']) {
          authToken = headers['authorization'];
        }
      }
    });

    await page.waitForRequest(request => request.url() === 'https://api.hamsterkombatgame.io/clicker/sync');

    await browser.close();

    res.json({ token: authToken || 'No token found' });
  } catch (error) {
    res.status(500).send('Error running Puppeteer script');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
