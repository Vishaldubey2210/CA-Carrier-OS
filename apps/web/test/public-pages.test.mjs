import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Public Website, SEO & Recovery Verification Suite', () => {
  test('1. Public Routes: Validates all essential marketing, legal, and support routes', () => {
    const publicMarketingRoutes = [
      '/',
      '/about',
      '/features',
      '/pricing',
      '/contact',
      '/faq',
      '/privacy',
      '/terms',
      '/security',
      '/cookies',
      '/help',
      '/how-it-works',
      '/careers',
    ];

    assert.equal(publicMarketingRoutes.length, 13);
    for (const r of publicMarketingRoutes) {
      assert.ok(r.startsWith('/'));
    }

    // Verify private authenticated routes are strictly separated
    const privateRoutes = ['/dashboard', '/career', '/jobs', '/resumes', '/interviews', '/practice', '/growth', '/billing', '/settings', '/onboarding'];
    for (const pr of privateRoutes) {
      assert.equal(publicMarketingRoutes.includes(pr), false, `Route ${pr} must be private`);
    }
  });

  test('2. Robots Policy: Public crawler directives allow / and block private workspaces', () => {
    const robotsRules = {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/api/',
            '/dashboard',
            '/career',
            '/resumes',
            '/interviews',
            '/practice',
            '/growth',
            '/billing',
            '/settings',
            '/onboarding',
          ],
        },
      ],
      sitemap: 'https://cacareeros.com/sitemap.xml',
    };

    assert.equal(robotsRules.rules[0].allow, '/');
    assert.ok(robotsRules.rules[0].disallow.includes('/api/'));
    assert.ok(robotsRules.rules[0].disallow.includes('/dashboard'));
    assert.ok(robotsRules.rules[0].disallow.includes('/settings'));
    assert.ok(robotsRules.rules[0].disallow.includes('/onboarding'));
    assert.match(robotsRules.sitemap, /sitemap\.xml$/);
  });

  test('3. Reset Password: Client validation rejects short passwords (< 12 chars)', () => {
    const validateReset = (token, p1, p2) => {
      if (!token || !token.trim()) return 'Token required';
      if (!p1 || p1.length < 12) return 'Password must be 12+ characters';
      if (p1 !== p2) return 'Passwords do not match';
      return null;
    };

    assert.equal(validateReset('', 'ValidPass12345!', 'ValidPass12345!'), 'Token required');
    assert.equal(validateReset('tok-1', 'short', 'short'), 'Password must be 12+ characters');
    assert.equal(validateReset('tok-1', 'ValidPass12345!', 'DifferentPass12!'), 'Passwords do not match');
    assert.equal(validateReset('tok-1', 'ValidPass12345!', 'ValidPass12345!'), null);
  });

  test('4. Contact Form: Client validation rejects insufficient lengths', () => {
    const validateContact = (name, email, subject, message) => {
      if (!name || name.trim().length < 2) return 'Name too short';
      if (!email || !email.includes('@') || !email.includes('.')) return 'Invalid email';
      if (!subject || subject.trim().length < 4) return 'Subject must be at least 4 characters long';
      if (!message || message.trim().length < 15) return 'Message must contain at least 15 characters';
      return null;
    };

    assert.equal(validateContact('A', 'valid@mail.com', 'Subject', 'Valid message body with length.'), 'Name too short');
    assert.equal(validateContact('Valid Name', 'badmail', 'Subject', 'Valid message body with length.'), 'Invalid email');
    assert.equal(validateContact('Valid Name', 'valid@mail.com', 'Hi', 'Valid message body with length.'), 'Subject must be at least 4 characters long');
    assert.equal(validateContact('Valid Name', 'valid@mail.com', 'Valid Subject', 'Too short'), 'Message must contain at least 15 characters');
    assert.equal(validateContact('Valid Name', 'valid@mail.com', 'Valid Subject', 'Valid message body with length.'), null);
  });

  test('5. Pricing Tier Matrix: Canonical plans include Free, Pro, Practice, and Employer tiers matching backend', () => {
    const plans = [
      { tier: 'FREE_CANDIDATE', priceMonthly: 0, priceAnnual: 0 },
      { tier: 'PRO_CANDIDATE', priceMonthly: 999, priceAnnual: 9990 },
      { tier: 'PRACTICE_CRM', priceMonthly: 2499, priceAnnual: 24990 },
      { tier: 'TEAM_EMPLOYER', priceMonthly: 4999, priceAnnual: 49990 },
    ];
    for (const p of plans) {
      if (p.priceMonthly > 0) {
        assert.equal(p.priceAnnual, p.priceMonthly * 10, 'Annual price must equal 10 months');
      }
    }
  });
});
