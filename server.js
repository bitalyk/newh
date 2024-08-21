const express = require('express');
const puppeteer = require('puppeteer');
const app = express(); 
const port = 3000;

app.use(express.static('public'));

app.get('/run-script', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let authToken = null;

    page.on('request', request => {
      const url = request.url();
      if (url === 'https://api.hamsterkombatgame.io/clicker/sync') {
        const headers = request.headers();
        if (headers['authorization']) {
          authToken = headers['authorization'];
        }
      }
    });

    await page.goto('https://hamsterkombatgame.io/clicker/#tgWebAppData=query_id%3DAAGpVLF7AgAAAKlUsXu5baQ_%26user%3D%257B%2522id%2522%253A6370186409%252C%2522first_name%2522%253A%2522%25D0%2591%25D1%2583%25D0%25BB%25D0%25BE%25D1%2587%25D0%25BA%25D0%25B0%2520%25D1%2581%2520%25D0%25B0%25D1%2580%25D0%25B1%25D1%2583%25D0%25B7%25D0%25BE%25D0%25BC%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522bitalya_g%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26auth_date%3D1724084831%26hash%3D85d32bd09d1d32de80ea4d351b5a5b139a0ef5972c19a5beb21408a16873b2bb&tgWebAppVersion=7.6&tgWebAppPlatform=android&tgWebAppThemeParams=%7B"bg_color"%3A"%23ffffff"%2C"text_color"%3A"%23000000"%2C"hint_color"%3A"%23707579"%2C"link_color"%3A"%233390ec"%2C"button_color"%3A"%233390ec"%2C"button_text_color"%3A"%23ffffff"%2C"secondary_bg_color"%3A"%23f4f4f5"%2C"header_bg_color"%3A"%23ffffff"%2C"accent_text_color"%3A"%233390ec"%2C"section_bg_color"%3A"%23ffffff"%2C"section_header_text_color"%3A"%23707579"%2C"subtitle_text_color"%3A"%23707579"%2C"destructive_text_color"%3A"%23e53935"%7D');
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
