import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import CronParser from '@/components/tools/datetime/CronParser';
import { generateToolMetadata, generateToolJsonLd, generateFaqJsonLd } from '@/utils/pageGenerator';
import {
  ToolFaq,
  ToolPrivacyNotice,
  ToolRelated
} from '@/components/shared/ToolContent';

export const metadata: Metadata = generateToolMetadata('/datetime/cron-parser');

const faqItems = [
  {
    question: 'How do I read a cron expression?',
    answer:
      'Read the five fields from left to right: minute, hour, day of month, month, day of week. 0 9 * * 1-5 is therefore "09:00 on weekdays". An asterisk means any value, a comma lists values, a hyphen defines a range and a slash defines a step, so */15 in the minute field means every fifteen minutes.'
  },
  {
    question: 'Why does my job run at the wrong hour after a daylight-saving change?',
    answer:
      'Cron describes wall-clock time, so the UTC instant of a 09:00 job shifts when the clocks change. On a spring-forward day a job inside the skipped hour (such as 02:30) never runs, and on a fall-back day one inside the repeated hour runs twice. Both cases are visible in the next-runs table above.'
  },
  {
    question: 'What is the difference between five-field and six-field cron?',
    answer:
      'A standard crontab entry has five fields and no seconds, so the smallest interval is one minute. Systems such as AWS EventBridge Scheduler and Quartz put seconds first in a six-field layout, which allows */30 * * * * *. This parser detects six fields automatically and says so.'
  },
  {
    question: 'How are day-of-month and day-of-week combined?',
    answer:
      'When both fields are restricted, the entry matches if either one matches — a logical OR. So 0 0 13 * 5 runs at midnight on the 13th of the month and also on every Friday.'
  },
  {
    question: 'Which cron syntaxes are not supported?',
    answer:
      'The Quartz extensions L (last day), W (nearest weekday) and # (nth weekday) are not evaluated, and a trailing year field is rejected. The parser names the unsupported token and explains it on the expression itself instead of approximating the schedule.'
  },
  {
    question: 'Does the time zone selector change the schedule itself?',
    answer:
      'No. The expression always stays a wall-clock schedule; the time zone only decides which clock it is read against, which is what shifts the next-runs list and the UTC column.'
  },
  {
    question: 'Can I turn a sentence into a cron expression?',
    answer:
      'Yes, for a limited set of phrasings such as "every 15 minutes", "weekdays at 9am" or "on the 1st of month at 0:00". The matching is deterministic, so it either returns a correct expression or says it did not understand — it never invents a plausible-looking schedule.'
  }
];

const relatedTools = [
  {
    path: '/datetime/timestamp',
    title: 'Timestamp Converter',
    description: 'Convert run times to Unix timestamps'
  },
  {
    path: '/datetime/timezone',
    title: 'Timezone Converter',
    description: 'Compare a scheduled time across zones'
  },
  {
    path: '/code/jwt-decoder',
    title: 'JWT Decoder',
    description: 'Decode the tokens a scheduled job receives'
  },
  {
    path: '/code/json',
    title: 'JSON Formatter',
    description: 'Inspect the payloads your job produces'
  }
];

export default function CronParserPage() {
  const jsonLd = generateToolJsonLd('/datetime/cron-parser');
  const faqJsonLd = generateFaqJsonLd(faqItems);

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <CronParser />

      <div className="tool-page-content">
        <ToolPrivacyNotice>
          <p>
            Expressions, time zone and calculated run times are processed locally in this browser tab.
            Nothing is uploaded and no API is called, so internal job names and maintenance windows stay
            private.
          </p>
        </ToolPrivacyNotice>

        <ToolFaq items={faqItems} />

        <ToolRelated items={relatedTools} />
      </div>
    </AppLayout>
  );
}
