# CDN Setup Guide for Petflix

## Overview
This guide explains how to set up a Content Delivery Network (CDN) for Petflix to improve performance globally.

## Why Use a CDN?

**Benefits:**
- ⚡ Faster asset delivery (images, JS, CSS)
- 🌍 Global distribution
- 📉 Reduced server load
- 💰 Lower bandwidth costs
- 🛡️ DDoS protection
- 📱 Better mobile performance

## Option 1: Cloudflare (Recommended - Free Tier Available)

### Setup Steps

1. **Sign up for Cloudflare**
   - Go to https://cloudflare.com
   - Create account
   - Add your domain

2. **Update DNS Records**
   ```
   Type: A
   Name: @
   Content: Your-Server-IP
   Proxy: Enabled (Orange Cloud)
   
   Type: CNAME
   Name: www
   Content: your-domain.com
   Proxy: Enabled (Orange Cloud)
   ```

3. **Configure Caching Rules**
   - Go to Caching → Configuration
   - Set caching level: "Standard"
   - Browser Cache TTL: "Respect Existing Headers"

4. **Create Page Rules**
   ```
   URL: *petflix.com/assets/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 month
   
   URL: *petflix.com/api/*
   Settings:
   - Cache Level: Bypass
   ```

5. **Enable Auto Minify**
   - Go to Speed → Optimization
   - Enable: JavaScript, CSS, HTML

6. **Enable Brotli Compression**
   - Go to Speed → Optimization
   - Enable: Brotli

7. **Configure SSL/TLS**
   - Go to SSL/TLS
   - Select: "Full (strict)"

### Cloudflare Workers (Advanced)

For dynamic content caching:

```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Cache API responses for 5 minutes
  if (url.pathname.startsWith('/api/videos')) {
    const cache = caches.default
    let response = await cache.match(request)
    
    if (!response) {
      response = await fetch(request)
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'max-age=300')
      
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })
      
      event.waitUntil(cache.put(request, response.clone()))
    }
    
    return response
  }
  
  return fetch(request)
}
```

## Option 2: AWS CloudFront

### Setup Steps

1. **Create CloudFront Distribution**
   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name your-domain.com \
     --default-root-object index.html
   ```

2. **Configure Origins**
   - **Frontend Origin:**
     - Origin Domain: S3 bucket or your server
     - Origin Path: /
     - Origin Protocol: HTTPS only
   
   - **Backend API Origin:**
     - Origin Domain: api.your-domain.com
     - Origin Path: /api
     - Origin Protocol: HTTPS only

3. **Set Cache Behaviors**
   ```json
   {
     "PathPattern": "/assets/*",
     "TargetOriginId": "frontend-origin",
     "ViewerProtocolPolicy": "redirect-to-https",
     "AllowedMethods": ["GET", "HEAD"],
     "CachedMethods": ["GET", "HEAD"],
     "Compress": true,
     "DefaultTTL": 2592000,
     "MaxTTL": 31536000,
     "MinTTL": 0
   }
   ```

4. **Configure SSL Certificate**
   - Request certificate in ACM (us-east-1)
   - Validate via DNS
   - Attach to CloudFront distribution

5. **Update DNS**
   ```
   Type: CNAME
   Name: www
   Value: d123456789.cloudfront.net
   ```

## Option 3: Google Cloud CDN

### Setup Steps

1. **Create Load Balancer**
   ```bash
   gcloud compute backend-buckets create petflix-frontend \
     --gcs-bucket-name=petflix-frontend-bucket \
     --enable-cdn
   ```

2. **Configure Cloud CDN**
   ```bash
   gcloud compute backend-services update petflix-backend \
     --enable-cdn \
     --cache-mode=CACHE_ALL_STATIC \
     --default-ttl=3600 \
     --max-ttl=86400
   ```

3. **Set Up URL Maps**
   ```bash
   gcloud compute url-maps create petflix-url-map \
     --default-service=petflix-backend
   ```

## Option 4: Vercel Edge Network (Automatic)

If deploying frontend to Vercel, CDN is automatic:

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Caching Strategy by Content Type

### Static Assets (Long Cache)
```
Cache-Control: public, max-age=31536000, immutable
```
- JavaScript bundles
- CSS files
- Images (except user uploads)
- Fonts
- Icons

### Dynamic Content (Short Cache)
```
Cache-Control: public, max-age=300, s-maxage=600
```
- Video thumbnails
- User avatars
- Feed data

### No Cache
```
Cache-Control: no-store, no-cache, must-revalidate
```
- API authentication
- User-specific data
- Real-time notifications

### Service Worker (No Cache)
```
Cache-Control: no-cache
```
- service-worker.js
- manifest.json

## Performance Testing

### Test CDN is Working

```bash
# Check response headers
curl -I https://your-domain.com/assets/logo.png

# Look for:
# - X-Cache: HIT (Cloudflare)
# - X-Cache: Hit from cloudfront (AWS)
# - Age: > 0 (indicates cached)
```

### Measure Performance Improvement

**Before CDN:**
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com
```

**After CDN:**
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com
```

Expected improvements:
- 50-70% faster TTFB (Time To First Byte)
- 40-60% faster total load time
- 30-50% bandwidth reduction

## Monitoring

### Cloudflare Analytics
- Dashboard → Analytics
- Check: Bandwidth, Requests, Cache ratio

### AWS CloudFront
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=YOUR_DIST_ID
```

### Google Cloud CDN
```bash
gcloud monitoring dashboards describe cdn-dashboard
```

## Troubleshooting

### Cache Not Working

**Check 1: Headers**
```bash
curl -I https://your-domain.com/asset.js | grep -i cache
```

**Check 2: Query Strings**
- Remove query strings or configure them properly
- Use cache keys wisely

**Check 3: Cookies**
- CDN may not cache if cookies are present
- Configure cookie forwarding rules

### Stale Content

**Purge Cache:**

**Cloudflare:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

**AWS CloudFront:**
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

## Cost Optimization

### Tips to Reduce CDN Costs

1. **Optimize Images**
   - Use WebP format
   - Compress before upload
   - Use appropriate sizes

2. **Set Appropriate Cache Durations**
   - Static assets: 1 year
   - Dynamic content: 5-60 minutes
   - User-specific: No cache

3. **Use Cache Purging Wisely**
   - Avoid purging everything
   - Use targeted invalidations

4. **Compress Responses**
   - Enable gzip/brotli
   - Reduce payload sizes

## Security with CDN

1. **Enable HTTPS Only**
2. **Configure Web Application Firewall (WAF)**
3. **Set Up Rate Limiting**
4. **Enable DDoS Protection**
5. **Use Signed URLs for Private Content**

## Recommended Configuration

For Petflix, we recommend:

**CDN Provider:** Cloudflare (Free tier sufficient)
**Caching:**
- Static assets: 1 year
- API responses: 5 minutes
- Service worker: No cache

**Features to Enable:**
- Auto minification
- Brotli compression
- Image optimization
- Mobile optimization
- HTTP/2 and HTTP/3

---

**Result:** 50-70% faster load times globally! 🚀

