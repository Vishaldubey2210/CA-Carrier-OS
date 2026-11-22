import { URL } from 'node:url';

/**
 * Validates that an outbound scraping URL is safe and does not target internal or private networks (SSRF defense).
 */
export function validateOutboundUrl(urlStr: string): { valid: boolean; reason?: string } {
  if (!urlStr || typeof urlStr !== 'string') {
    return { valid: false, reason: 'URL string is empty or invalid' };
  }

  try {
    const parsed = new URL(urlStr);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: `Unsupported protocol: ${parsed.protocol}` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and loopback
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost')
    ) {
      return { valid: false, reason: 'Localhost and loopback origins are blocked' };
    }

    // Block AWS/GCP/Azure link-local metadata endpoints
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { valid: false, reason: 'Cloud instance metadata service is blocked' };
    }

    // Block private RFC 1918 IPv4 ranges
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const b1 = parseInt(ipv4Match[1], 10);
      const b2 = parseInt(ipv4Match[2], 10);

      // 10.0.0.0/8
      if (b1 === 10) return { valid: false, reason: 'Private network 10.0.0.0/8 is blocked' };
      // 172.16.0.0/12
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return { valid: false, reason: 'Private network 172.16.0.0/12 is blocked' };
      // 192.168.0.0/16
      if (b1 === 192 && b2 === 168) return { valid: false, reason: 'Private network 192.168.0.0/16 is blocked' };
      // 0.0.0.0
      if (b1 === 0) return { valid: false, reason: '0.0.0.0 address is blocked' };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, reason: `Malformed URL: ${err.message}` };
  }
}

/**
 * Strict XSS and HTML sanitization for scraped jobs data.
 * Strips script tags, iframes, event handlers, and data/javascript URIs.
 */
export function sanitizeScrapedContent(content: string): string {
  if (!content) return '';
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:[^"'\s]*/gi, '')
    .replace(/data:text\/html[^"'\s]*/gi, '')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\bon\w+\s*=\s*[^"'\s>]+/gi, '')
    .replace(/(?:ignore\s+all\s+previous\s+instructions|system\s+prompt\s+override|<\|im_start\|>|<\|endoftext\|>)/gi, '[REDACTED_SECURITY_TOKEN]')
    .trim();
}

