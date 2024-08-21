import puppeteer from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';
import express from 'express\lib\express.js';

const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/run-script', async (req, res) => {
  try {
    // Extract fragment from the request URL
    const requestUrl = req.query.url; // Get the URL from query parameters
    if (!requestUrl) {
      return res.status(400).send('URL query parameter is required');
    }

    const pathFragment = new URL(requestUrl).hash.split('/')[1]; // Extract the part after the '#'
    const targetUrl = `https://hamsterkombatgame.io/clicker/${pathFragment}`;

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let authToken = null;

    // Navigate to the target URL
    await page.goto(targetUrl);

    // Intercept network requests
    page.on('request', request => {
      const url = request.url();
      if (url === 'https://api.hamsterkombatgame.io/clicker/sync') {
        const headers = request.headers();
        if (headers['authorization']) {
          authToken = headers['authorization'];
        }
      }
    });

    // Wait for the specific request
    await page.waitForRequest(request => request.url() === 'https://api.hamsterkombatgame.io/clicker/sync');

    // Close the browser
    await browser.close();

    // Respond with the extracted token
    res.json({ token: authToken || 'No token found' });
  } catch (error) {
    res.status(500).send('Error running Puppeteer script');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
