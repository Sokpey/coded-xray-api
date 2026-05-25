const express   = require('express');
const cors      = require('cors');
const puppeteer = require('puppeteer');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS — only allow your domain and Netlify ──
app.use(cors({
  origin: [
    'https://coded-xray.tech',
    'https://www.coded-xray.tech',
    /\.netlify\.app$/,
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ]
}));

app.use(express.json());

// ── SECRET KEY MIDDLEWARE ──
function requireKey(req, res, next) {
  const secret = process.env.API_SECRET;
  if (!secret) {
    // No secret set in environment — block all requests
    return res.status(500).json({ error: 'API_SECRET not configured on server' });
  }
  const provided = req.headers['x-api-key'];
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: 'Unauthorised' });
  }
  next();
}

// ── Health check (public — no key needed) ──
app.get('/', function(req, res) {
  res.json({ status: 'ok', service: 'Coded X-Ray API', version: '1.0.0' });
});

// ── Fetch endpoint (protected) ──
app.post('/fetch', requireKey, async function(req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  let targetUrl = url;
  if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    // Wait for JS to run
    await new Promise(function(r) { setTimeout(r, 1500); });

    const html = await page.content();

    if (!html || html.trim().length < 50) {
      return res.status(422).json({ error: 'Page returned empty content' });
    }

    res.json({ html: html, url: targetUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, function() {
  console.log('Coded X-Ray API running on port ' + PORT);
});
