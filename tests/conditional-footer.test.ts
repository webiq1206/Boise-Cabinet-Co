import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { ConditionalFooter } from '../components/ConditionalFooter.tsx';
import { Footer } from '../components/Footer.tsx';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function renderFooterAt(pathname: string) {
  return renderToStaticMarkup(
    React.createElement(PathnameContext.Provider, { value: pathname },
      React.createElement(ConditionalFooter, { footer: React.createElement(Footer) }),
    ),
  );
}

test('the kitchen landing page uses the family footer with working contact destinations and legal links', () => {
  const html = renderFooterAt('/kitchen-cabinets');
  assert.match(html, /data-family-footer=""/);
  assert.equal((html.match(/<footer\b/g) ?? []).length, 1);
  assert.match(html, /href="tel:\+12084771169"[^>]*data-testid="link-footer-call"/);
  assert.match(html, /href="sms:\+12084771169"[^>]*data-testid="link-footer-text"/);
  assert.doesNotMatch(html, /data-testid="button-chat-footer"/);
  assert.match(html, /href="\/privacy-policy"/);
  assert.match(html, /href="\/terms-of-service"/);
  assert.match(html, /Serving Boise and the Treasure Valley/);
  assert.match(html, /Idaho Registered Contractor #8381215/);
  assert.doesNotMatch(html, /Public representative|Wapoot|staffed storefront/);
});

test('task and private app routes retain their footer exclusion', () => {
  for (const pathname of ['/estimate', '/estimate/scope', '/estimate/p5-preview', '/admin', '/admin/leads', '/portal/projects', '/design-studio']) {
    assert.equal(renderFooterAt(pathname), '', pathname);
  }
});

test('ordinary public pages retain their single family footer and available chat control', () => {
  for (const pathname of ['/', '/about', '/contact', '/catalog']) {
    const html = renderFooterAt(pathname);
    assert.equal((html.match(/data-family-footer=""/g) ?? []).length, 1, pathname);
    assert.match(html, /data-testid="button-chat-footer"/, pathname);
  }
});
