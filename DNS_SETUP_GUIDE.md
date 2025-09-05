# DNS Setup Guide for Subdomain Routing

## Overview
This guide helps you configure DNS records to enable subdomain routing (e.g., json.one-top.com → /code/json).

## Required DNS Records

### Main Records
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 300

Type: A  
Name: www
Value: 76.76.19.61
TTL: 300

Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: 300
```

## DNS Provider Instructions

### Cloudflare
1. Go to Cloudflare dashboard
2. Select your domain
3. Click "DNS" tab
4. Add records:
   - **A Record**: Name `@`, Content `76.76.19.61`
   - **A Record**: Name `www`, Content `76.76.19.61` 
   - **CNAME Record**: Name `*`, Content `cname.vercel-dns.com`
5. Set Proxy status to "DNS only" (gray cloud) for all records

### GoDaddy
1. Sign in to GoDaddy Domain Manager
2. Select your domain
3. Click "DNS" → "Manage Zones"
4. Add records:
   - **A Record**: Host `@`, Points to `76.76.19.61`
   - **A Record**: Host `www`, Points to `76.76.19.61`
   - **CNAME Record**: Host `*`, Points to `cname.vercel-dns.com`

### Namecheap
1. Sign in to Namecheap
2. Go to Domain List → Manage
3. Click "Advanced DNS" tab
4. Add records:
   - **A Record**: Host `@`, Value `76.76.19.61`
   - **A Record**: Host `www`, Value `76.76.19.61`
   - **CNAME Record**: Host `*`, Value `cname.vercel-dns.com`

### Google Domains
1. Sign in to Google Domains
2. Select your domain
3. Click "DNS" in the left menu
4. Scroll to "Custom resource records"
5. Add records:
   - **A**: Name `@`, Data `76.76.19.61`
   - **A**: Name `www`, Data `76.76.19.61`
   - **CNAME**: Name `*`, Data `cname.vercel-dns.com`

### Route 53 (AWS)
1. Go to Route 53 Console
2. Click "Hosted zones"
3. Select your domain
4. Create records:
   - **A Record**: Name blank, Value `76.76.19.61`
   - **A Record**: Name `www`, Value `76.76.19.61`
   - **CNAME Record**: Name `*`, Value `cname.vercel-dns.com`

## Vercel Domain Configuration

### Add Domain to Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Click "Settings" → "Domains"
4. Add these domains:
   - `one-top.com` (main domain)
   - `*.one-top.com` (wildcard)
5. Vercel will verify DNS automatically

### Domain Verification
- Main domain: Usually verifies in 5-10 minutes
- Wildcard domain: May take up to 24 hours

## Testing Your Setup

### 1. Check DNS Propagation
Use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net
- Enter your domain and check A/CNAME records

### 2. Test Subdomains
After DNS propagates (24-48 hours):
- Visit `json.one-top.com` → should redirect to JSON formatter
- Visit `base64.one-top.com` → should redirect to Base64 tool
- Visit `unknown.one-top.com` → should redirect to search

### 3. Verify in Browser DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit a subdomain
4. Check for redirect to main domain + tool path

## SSL Certificate Issues

### Wildcard SSL Not Working

**Symptoms:**
- Subdomains show "Not Secure" in browser
- SSL certificate warnings
- HTTPS connections fail

**Solutions:**

#### 1. Verify Vercel Domain Configuration
```bash
# Check if wildcard domain is added to Vercel
# Go to: Vercel Dashboard > Project > Settings > Domains
# Should show:
# - one-top.com ✅ Valid
# - *.one-top.com ✅ Valid (this is crucial!)
```

#### 2. Force SSL Certificate Regeneration
1. Go to Vercel Dashboard > Project > Settings > Domains
2. Remove `*.one-top.com` domain
3. Wait 5 minutes
4. Re-add `*.one-top.com` domain
5. Wait 30-60 minutes for SSL generation

#### 3. Alternative: Manual SSL Verification
```bash
# Test SSL certificate
echo | openssl s_client -servername json.one-top.com -connect json.one-top.com:443 2>/dev/null | openssl x509 -noout -subject -dates

# Check if wildcard cert is present
echo | openssl s_client -servername json.one-top.com -connect json.one-top.com:443 2>/dev/null | openssl x509 -noout -text | grep -A1 "Subject Alternative Name"
```

#### 4. DNS Provider Specific SSL Issues

**Cloudflare Users:**
- Set SSL/TLS mode to "Full" (not "Full (strict)")
- Disable "Always Use HTTPS" temporarily
- Turn off Cloudflare proxy (gray cloud) for wildcard records

**Other Providers:**
- Ensure CNAME points to `cname.vercel-dns.com` exactly
- No extra spaces or characters
- TTL should be 300 or Auto

## Troubleshooting

### Common Issues

#### DNS Not Propagating
- **Wait**: DNS can take 24-48 hours to propagate globally
- **Clear DNS Cache**: Flush your local DNS cache
- **Use Different DNS**: Try 8.8.8.8 or 1.1.1.1

#### Wildcard Not Working
- **Check Provider Support**: Not all providers support wildcard CNAME
- **Use A Record**: Replace CNAME with A record pointing to `76.76.19.61`
- **Contact Support**: Some providers require manual wildcard setup

#### SSL Certificate Issues
- **Wait for Vercel**: SSL certificates auto-generate but can take time
- **Check Domain Status**: Ensure domain shows "Valid" in Vercel dashboard
- **Force Renewal**: Contact Vercel support if SSL doesn't generate

### Verification Commands

```bash
# Check A record
dig one-top.com A

# Check CNAME record  
dig json.one-top.com CNAME

# Check from specific DNS server
dig @8.8.8.8 one-top.com A

# Check all subdomains
dig *.one-top.com CNAME
```

## DNS Propagation Timeline

| Time | Expected Status |
|------|----------------|
| 5 minutes | Local DNS updated |
| 1 hour | Regional DNS updated |
| 4-6 hours | Major DNS servers updated |
| 24-48 hours | Global propagation complete |

## Alternative Setup (If Wildcard CNAME Fails)

Some DNS providers don't support wildcard CNAME records. In this case:

### Option 1: Wildcard A Record
```
Type: A
Name: *
Value: 76.76.19.61
```

### Option 2: Individual Subdomains
Add specific A records for each tool:
```
Type: A
Name: json
Value: 76.76.19.61

Type: A
Name: base64
Value: 76.76.19.61

Type: A
Name: timestamp
Value: 76.76.19.61
# ... etc for each subdomain
```

## Support Contacts

If you need help with DNS setup:

### DNS Provider Support
- **Cloudflare**: https://support.cloudflare.com
- **GoDaddy**: https://support.godaddy.com
- **Namecheap**: https://support.namecheap.com
- **Google Domains**: https://support.google.com/domains

### Vercel Support
- **Documentation**: https://vercel.com/docs/concepts/projects/domains
- **Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel/discussions

## Security Notes

- **SSL/TLS**: Vercel automatically provisions SSL certificates
- **HSTS**: Consider enabling HTTP Strict Transport Security
- **CAA Records**: Optional but recommended for certificate authority authorization
- **DNSSEC**: Enable if your DNS provider supports it

## Monitoring

### Tools to Monitor DNS Health
- **UptimeRobot**: Monitor subdomain availability
- **Pingdom**: Check response times from multiple locations  
- **StatusCake**: Monitor SSL certificate expiration
- **DNSstuff**: Comprehensive DNS testing tools
