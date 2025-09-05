# Subdomain Routing for Static Export

## Overview
This implementation provides subdomain routing for the static-exported Next.js application. Since middleware doesn't work with `output: 'export'`, we use a client-side approach.

## How It Works

### Client-Side Subdomain Detection
- `src/hooks/useSubdomainRedirect.js` - Detects subdomain and redirects on client
- `src/components/shared/SubdomainWrapper.js` - Wrapper component for easy integration
- `src/utils/toolsData.js` - Contains subdomain-to-route mappings

### Flow
1. User visits `json.one-top.com`
2. Client-side hook detects `json` subdomain
3. Hook redirects to `/code/json` route
4. User sees JSON formatter tool

## Supported Subdomains

### Code Tools
- `json.one-top.com` → `/code/json`
- `xml.one-top.com` → `/code/xml`
- `base64.one-top.com` → `/code/base64`
- `url.one-top.com` → `/code/url`
- `html.one-top.com` → `/code/html`
- `gzip.one-top.com` → `/code/gzip`
- `password.one-top.com` → `/code/password`
- `uuid.one-top.com` → `/code/uuid`
- `hls.one-top.com` → `/code/hls`
- `vast.one-top.com` → `/code/vast`

### DateTime Tools
- `timestamp.one-top.com` → `/datetime/timestamp`
- `timezone.one-top.com` → `/datetime/timezone`
- `countdown.one-top.com` → `/datetime/countdown`
- `calculator.one-top.com` → `/datetime/calculator`
- `format.one-top.com` → `/datetime/format`
- `date.one-top.com` → `/datetime/format` (alias)
- `time.one-top.com` → `/datetime/timestamp` (alias)

### Text Tools
- `case.one-top.com` → `/text/case-converter`
- `converter.one-top.com` → `/text/case-converter`
- `count.one-top.com` → `/text/character-count`
- `counter.one-top.com` → `/text/character-count`
- `lorem.one-top.com` → `/text/lorem`
- `space.one-top.com` → `/text/space-remover`
- `text.one-top.com` → `/text/case-converter` (alias)

### Info Tools
- `browser.one-top.com` → `/info/browser`
- `system.one-top.com` → `/info/system`
- `network.one-top.com` → `/info/network`
- `codes.one-top.com` → `/info/calling-codes`
- `calling.one-top.com` → `/info/calling-codes`
- `services.one-top.com` → `/info/public-services`
- `postcodes.one-top.com` → `/info/postcodes`
- `zip.one-top.com` → `/info/postcodes`
- `info.one-top.com` → `/info/browser` (alias)

### Popular Aliases
- `encode.one-top.com` → `/code/base64`
- `decode.one-top.com` → `/code/base64`
- `compress.one-top.com` → `/code/gzip`
- `decompress.one-top.com` → `/code/gzip`

## DNS Configuration Required

To enable subdomain routing, configure these DNS records:

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com

Type: A  
Name: @
Value: 76.76.19.61

Type: A
Name: www  
Value: 76.76.19.61
```

## Vercel Configuration

Add these domains in your Vercel project:
1. `one-top.com` (main domain)
2. `*.one-top.com` (wildcard for subdomains)

## Limitations

Since this is a client-side solution:
- There's a brief moment where the main site loads before redirect
- SEO crawlers might not follow the client-side redirects
- Users with JavaScript disabled won't get redirected

## Future Enhancements

For better SEO and instant redirects, consider:
1. Moving to a server-side deployment (remove `output: 'export'`)
2. Using Vercel's Edge Functions
3. Implementing server-side redirects

## Adding New Subdomains

To add a new subdomain mapping:

1. Update `subdomainRoutes` in `src/utils/toolsData.js`
2. Add the mapping in format: `'subdomain': '/route/path'`
3. Test locally and deploy

Example:
```javascript
// Add this to subdomainRoutes object
'newtool': '/category/newtool'
```
