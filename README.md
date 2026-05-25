# Coded X-Ray API

Backend for The Coded X-Ray — uses Puppeteer (headless Chrome) to fetch any website's source code, bypassing CORS and bot protection that blocks public proxies.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Health check |
| POST | /fetch | Fetch a URL's HTML source |

### POST /fetch

**Request body:**
```json
{ "url": "https://example.com" }
```

**Response:**
```json
{
  "html": "<!DOCTYPE html>...",
  "url": "https://example.com"
}
```

## Deploy to Render

1. Push this repo to GitHub
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Click Deploy
6. Your API will be live at `https://coded-xray-api.onrender.com`

## Connect to your domain

In Render dashboard → Settings → Custom Domain → add `api.coded-xray.tech`

Then in Cloudflare/your DNS:
```
Type:  CNAME
Name:  api
Value: coded-xray-api.onrender.com
```
