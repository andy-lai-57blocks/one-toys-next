# Subdomain Routing for Static Export

## Overview
This implementation provides subdomain routing for the static-exported Next.js application. Since middleware doesn't work with `output: 'export'`, we use a client-side approach.

## How It Works

### Client-Side Subdomain Detection
- `src/hooks/useSubdomainRedirect.js` - Detects subdomain and redirects on client
- `src/components/shared/SubdomainWrapper.js` - Wrapper component for easy integration
- `src/utils/toolsData.js` - Contains subdomain-to-route mappings

### Flow
1. User visits `json.one-toys.com`
2. Client-side hook detects `json` subdomain
3. Hook redirects to `/code/json` route
4. User sees JSON formatter tool

## Supported Subdomains

### Code Tools
- `json.one-toys.com` → `/code/json`
- `xml.one-toys.com` → `/code/xml`
- `base64.one-toys.com` → `/code/base64`
- `url.one-toys.com` → `/code/url`
- `html.one-toys.com` → `/code/html`
- `gzip.one-toys.com` → `/code/gzip`
- `password.one-toys.com` → `/code/password`
- `uuid.one-toys.com` → `/code/uuid`
- `hls.one-toys.com` → `/code/hls`
- `vast.one-toys.com` → `/code/vast`

### DateTime Tools
- `timestamp.one-toys.com` → `/datetime/timestamp`
- `timezone.one-toys.com` → `/datetime/timezone`
- `countdown.one-toys.com` → `/datetime/countdown`
- `calculator.one-toys.com` → `/datetime/calculator`
- `format.one-toys.com` → `/datetime/format`
- `date.one-toys.com` → `/datetime/format` (alias)
- `time.one-toys.com` → `/datetime/timestamp` (alias)

### Text Tools
- `case.one-toys.com` → `/text/case-converter`
- `converter.one-toys.com` → `/text/case-converter`
- `count.one-toys.com` → `/text/character-count`
- `counter.one-toys.com` → `/text/character-count`
- `lorem.one-toys.com` → `/text/lorem`
- `space.one-toys.com` → `/text/space-remover`
- `text.one-toys.com` → `/text/case-converter` (alias)

### Info Tools
- `browser.one-toys.com` → `/info/browser`
- `system.one-toys.com` → `/info/system`
- `network.one-toys.com` → `/info/network`
- `codes.one-toys.com` → `/info/calling-codes`
- `calling.one-toys.com` → `/info/calling-codes`
- `services.one-toys.com` → `/info/public-services`
- `postcodes.one-toys.com` → `/info/postcodes`
- `zip.one-toys.com` → `/info/postcodes`
- `info.one-toys.com` → `/info/browser` (alias)

### Popular Aliases
- `encode.one-toys.com` → `/code/base64`
- `decode.one-toys.com` → `/code/base64`
- `compress.one-toys.com` → `/code/gzip`
- `decompress.one-toys.com` → `/code/gzip`

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
1. `one-toys.com` (main domain)
2. `*.one-toys.com` (wildcard for subdomains)

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
