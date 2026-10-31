import { Metadata } from 'next';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { generateToolMetadata } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/contact');

export default function ContactPage() {
  return (
    <AppLayout>
      <article className="static-page">
        <div className="static-page-inner">
          <h1>Contact</h1>
          <p className="static-page-lead">
            One address for everything:{' '}
            <a href="mailto:andy@57blocks.com">andy@57blocks.com</a>
          </p>

          <h2>Reporting a bug</h2>
          <p>Include these, and the report is usually enough to reproduce it:</p>
          <ul>
            <li>
              The URL of the tool, for example{' '}
              <Link href="/code/json-fixer">/code/json-fixer</Link>.
            </li>
            <li>What you did, what you expected, and what happened instead.</li>
            <li>Your browser and version, and whether another browser behaves differently.</li>
            <li>
              A small input that reproduces the problem — small enough to read, and
              never production data. One Toys never receives it, but the person reading
              your email will.
            </li>
          </ul>

          <h2>Security issues</h2>
          <p>
            Please report these by email before describing them publicly, so a fix can
            ship first. Name the tool and the steps to reproduce; do not include live
            credentials or real tokens.
          </p>

          <h2>Corrections and removal requests</h2>
          <p>
            If a page explains something incorrectly, or something should not be
            online, send the URL and the reason and it will be dealt with directly.
          </p>

          <h2>Response time</h2>
          <p>
            This is a small project with no support desk. Messages are read and answered
            as soon as possible, but no response time is guaranteed.
          </p>
        </div>
      </article>
    </AppLayout>
  );
}
