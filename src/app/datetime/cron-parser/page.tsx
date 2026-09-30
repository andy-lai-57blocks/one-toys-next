import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import CronParser from '@/components/tools/datetime/CronParser';
import { generateToolMetadata, generateToolJsonLd, generateFaqJsonLd } from '@/utils/pageGenerator';
import {
  ToolIntro,
  ToolExamples,
  ToolFaq,
  ToolPrivacyNotice,
  ToolLimits,
  ToolRelated
} from '@/components/shared/ToolContent';

export const metadata: Metadata = generateToolMetadata('/datetime/cron-parser');

const faqItems = [
  {
    question: 'How do I read a cron expression?',
    answer:
      'Read the five fields from left to right: minute (0-59), hour (0-23), day of month (1-31), month (1-12) and day of week (0-6, where 0 is Sunday). The expression 0 9 * * 1-5 therefore means "at minute 0 of hour 9, on any day of the month, in any month, when the weekday is Monday to Friday" — that is, 09:00 on weekdays. An asterisk means "every possible value", a comma lists values, a hyphen defines a range and a slash defines a step, so */15 in the minute field means every fifteen minutes.'
  },
  {
    question: 'Why does my job run at the wrong hour after a daylight-saving change?',
    answer:
      'Most cron daemons schedule on wall-clock time in the server time zone, so the UTC instant of a 09:00 job shifts by an hour when the clocks change. If your job must run at a fixed UTC instant, schedule it in UTC and convert your intent once. Two details cause most confusion: on a spring-forward day a job scheduled inside the skipped hour (for example 02:30) never runs, and on a fall-back day a job scheduled inside the repeated hour runs twice. This tool shows both cases explicitly so you can plan around them.'
  },
  {
    question: 'What is the difference between five-field and six-field cron?',
    answer:
      'A standard crontab entry has five fields and no seconds, so the smallest interval is one minute. Systems such as AWS EventBridge Scheduler and Quartz use a six-field layout where the first field is seconds, which allows intervals like */30 * * * * * (every thirty seconds). Some tools also accept a seventh year field. This parser detects six fields automatically and says so, because silently treating a seconds field as minutes is a very common source of double or missing runs.'
  },
  {
    question: 'How are day-of-month and day-of-week combined?',
    answer:
      'This is the rule that surprises people most. When both the day-of-month and day-of-week fields are restricted to specific values, the entry matches when either one matches — a logical OR. So 0 0 13 * 5 runs at midnight on the 13th of the month and also on every Friday. When only one of the two is restricted, only that field has to match. Modern systems add their own extensions, but the OR behaviour comes from the original Vixie cron and is what most crontab implementations still do.'
  },
  {
    question: 'Which cron syntaxes are not supported here?',
    answer:
      'Quartz-specific extensions are deliberately not evaluated: L for the last day of the month, W for the nearest weekday and # for the nth weekday. Rather than guessing at them, this tool reports the unsupported token and points you to the alternatives shown in the supported-syntax table. Expressions with a trailing year field are also rejected, because Quartz adds that field in a position that would otherwise be read as part of the day-of-week field.'
  },
  {
    question: 'Does the time zone selector change the schedule itself?',
    answer:
      'No — the expression stays exactly as you wrote it and is always interpreted as a wall-clock schedule. Changing the time zone changes the reference clock used to turn that schedule into concrete instants, which is what makes the "next runs" list and the UTC column shift. This matters for servers in one region and users in another: a job defined as 09:00 Asia/Tokyo fires at a completely different moment than 09:00 Europe/London.'
  },
  {
    question: 'Can I turn a sentence into a cron expression?',
    answer:
      'Yes, for a small and deliberately limited set of phrasings such as "every 15 minutes", "weekdays at 9am", "every monday at 9 am" and "on the 1st of month at 0:00". The converter uses deterministic pattern matching rather than a language model, so it either produces a correct expression or tells you it did not recognise the sentence — it never invents a plausible-looking schedule that quietly means something else. If your sentence is not matched, write the expression directly and use the description to confirm it.'
  },
  {
    question: 'Is the cron calculator safe to use with production schedules?',
    answer:
      'Everything runs locally in your browser: the expression, the selected time zone and the calculated run times never leave your machine, and the tool makes no network requests at all. That matters when a schedule reveals the existence of internal jobs or maintenance windows. You can confirm it in your browser DevTools by opening the Network tab and typing an expression — no request is made.'
  }
];

const relatedTools = [
  {
    path: '/datetime/timestamp',
    title: 'Timestamp Converter',
    description: 'Convert the Unix timestamps of the run times you just calculated'
  },
  {
    path: '/datetime/timezone',
    title: 'Timezone Converter',
    description: 'Compare the same scheduled time across several time zones at once'
  },
  {
    path: '/datetime/format',
    title: 'Date Formatter',
    description: 'Format the resulting dates for logs, APIs or display'
  },
  {
    path: '/datetime/calculator',
    title: 'Date Calculator',
    description: 'Work out intervals and durations between runs'
  },
  {
    path: '/code/jwt-decoder',
    title: 'JWT Decoder',
    description: 'Decode the tokens a scheduled job receives when it calls an authenticated API'
  },
  {
    path: '/code/json',
    title: 'JSON Formatter',
    description: 'Inspect the JSON payloads your scheduled job produces'
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

      <ToolPrivacyNotice>
        <p>
          Your expressions, time zone and calculated schedules are processed locally in this browser tab.
          Nothing is uploaded and no API is called — you can verify that in DevTools by watching the
          Network tab while typing an expression.
        </p>
        <p>
          All date arithmetic uses the browser&apos;s own time zone database through the{' '}
          <code>Intl</code> API, so daylight-saving transitions are handled with the same data your
          operating system uses.
        </p>
      </ToolPrivacyNotice>

      <ToolIntro title="What a cron expression actually says">
        <p>
          A cron expression is a compact description of a repeating schedule. The classic crontab form
          has five fields separated by spaces, and they always appear in the same order: minute, hour,
          day of month, month and day of week. Each field accepts a value, a list, a range or a step, and
          an asterisk for &ldquo;no restriction here&rdquo;. Reading a schedule is mostly a matter of translating
          those five positions into a sentence, which is exactly what the parser above does.
        </p>
        <p>
          The compactness is what makes cron useful and also what makes it error-prone. <code>0 0 1 * *</code>{' '}
          and <code>0 0 * * 1</code> differ by a single character and mean completely different things —
          the first runs monthly, the second runs weekly. A misread schedule typically shows up as a job
          that quietly never runs, or one that runs far more often than anyone intended, and both are
          expensive to notice after the fact.
        </p>
        <p>
          The field ranges are worth memorising because they explain most validation errors: minutes and
          hours start at zero, but days of the month and months start at one, while days of the week
          start at zero for Sunday. This tool refuses out-of-range values and names the field that is
          wrong, instead of silently accepting an expression that no scheduler would run.
        </p>
      </ToolIntro>

      <ToolIntro title="Daylight saving is where schedules break">
        <p>
          Almost every scheduling bug that survives a code review is a time zone bug. Cron expressions
          describe wall-clock time, not fixed instants, so <code>0 9 * * *</code> means &ldquo;nine in the
          morning as the local clock reads it&rdquo; — and the UTC instant behind that reading moves by an
          hour twice a year in most of Europe and North America.
        </p>
        <p>
          The two transitions behave in opposite ways and both are easy to miss. On a spring-forward day
          the clock jumps from 02:00 to 03:00, so any job scheduled inside that missing hour — say{' '}
          <code>30 2 * * *</code> — simply does not run that day. On a fall-back day the clock repeats an
          hour, so a job scheduled inside it runs twice, which means duplicated invoices, duplicated
          emails and duplicated database writes if the job is not idempotent.
        </p>
        <p>
          This parser calculates the next runs from the browser&apos;s own time zone database and shows
          the local time, the UTC instant and the active UTC offset side by side. That makes the
          transition visible: the same 09:00 job appears as 13:00 UTC during daylight saving and 14:00
          UTC outside it. If you need a job to run at a fixed instant regardless of the season, schedule
          it in UTC explicitly.
        </p>
      </ToolIntro>

      <ToolIntro title="Supported syntax, and what is deliberately left out">
        <p>
          Cron has no single specification. The original Vixie cron defined the five-field layout that
          Unix-like systems still use, and other platforms extended it in incompatible ways. Rather than
          pretending that every dialect is supported, here is the exact boundary of this tool.
        </p>
      </ToolIntro>

      <section className="tool-content-section" aria-label="Supported syntax">
        <h2 className="tool-content-title">Supported syntax</h2>
        <div className="cron-tool">
          <div className="cron-table-wrap">
            <table className="cron-table">
            <thead>
              <tr>
                <th>Syntax</th>
                <th>Example</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>*</code> <code>,</code> <code>-</code> <code>/</code>
                </td>
                <td>
                  <code>0 */6 * * 1-5</code>
                </td>
                <td>Fully supported</td>
              </tr>
              <tr>
                <td>
                  <code>?</code>
                </td>
                <td>
                  <code>0 12 ? * MON</code>
                </td>
                <td>Supported (treated as <code>*</code>)</td>
              </tr>
              <tr>
                <td>Names for months and weekdays</td>
                <td>
                  <code>0 0 1 JAN *</code>
                </td>
                <td>Supported</td>
              </tr>
              <tr>
                <td>Wrapping ranges</td>
                <td>
                  <code>0 22-2 * * *</code>
                </td>
                <td>Supported (runs 22:00 to 02:00)</td>
              </tr>
              <tr>
                <td>Seconds field (6 fields)</td>
                <td>
                  <code>*/30 * * * * *</code>
                </td>
                <td>Supported and detected automatically</td>
              </tr>
              <tr>
                <td>
                  <code>L</code> (last day)
                </td>
                <td>
                  <code>0 0 L * *</code>
                </td>
                <td>Not evaluated — reported explicitly</td>
              </tr>
              <tr>
                <td>
                  <code>W</code> (nearest weekday)
                </td>
                <td>
                  <code>0 0 15W * *</code>
                </td>
                <td>Not evaluated — reported explicitly</td>
              </tr>
              <tr>
                <td>
                  <code>#</code> (nth weekday)
                </td>
                <td>
                  <code>0 0 * * 1#2</code>
                </td>
                <td>Not evaluated — reported explicitly</td>
              </tr>
              <tr>
                <td>Year field (7 fields, Quartz)</td>
                <td>
                  <code>0 0 0 1 1 * 2027</code>
                </td>
                <td>Rejected with an explanation</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </section>

      <ToolIntro title="Platform differences worth knowing">
        <p>
          If an expression works in one system and not another, the layout is usually the reason.
          Standard crontab entries have five fields and require a script path after them. AWS EventBridge
          Scheduler and Quartz use six fields with seconds first, and Quartz additionally supports the
          <code>L</code>, <code>W</code> and <code>#</code> extensions plus a year field. Systemd does
          not use cron syntax at all: its <code>OnCalendar</code> format is different in every position,
          so translating between the two requires care rather than a find-and-replace.
        </p>
        <p>
          The practical advice is to decide which scheduler owns the job and then keep the expression in
          that dialect. Copying a six-field AWS schedule into a five-field crontab shifts every field by
          one position, which turns &ldquo;every day at midnight&rdquo; into &ldquo;every minute during the midnight
          hour&rdquo; — a mistake that is invisible until it floods your logs.
        </p>
      </ToolIntro>

      <ToolExamples
        title="Common schedules explained"
        items={[
          {
            title: 'Every fifteen minutes',
            input: '*/15 * * * *',
            output: 'Every 15 minutes every day',
            note: 'Runs at :00, :15, :30 and :45 of every hour. Replace 15 with 5 for a five-minute interval.'
          },
          {
            title: 'Weekdays at 09:00',
            input: '0 9 * * 1-5',
            output: 'At 09:00 on weekdays',
            note: 'Skips Saturday and Sunday. Beware public holidays: cron has no concept of them.'
          },
          {
            title: 'Every six hours',
            input: '0 */6 * * *',
            output: 'At 00:00, 06:00, 12:00 and 18:00 every day',
            note: 'The step applies within the field, so the run times stay aligned to midnight.'
          },
          {
            title: 'Midnight on the 1st of each month',
            input: '0 0 1 * *',
            output: 'At 00:00 on day 1 of the month',
            note: 'Runs once a month. On a fall-back day, double-check any job scheduled inside the repeated hour.'
          },
          {
            title: 'Every thirty seconds (six fields)',
            input: '*/30 * * * * *',
            output: 'Every 30 seconds',
            note: 'Six-field layout with seconds first. Standard crontab would read this as a five-field expression and misbehave.'
          }
        ]}
      />

      <ToolFaq items={faqItems} />

      <ToolLimits
        items={[
          'It does not run jobs. It only explains expressions and previews when they would fire.',
          'It does not evaluate Quartz-only syntax (L, W, #) or expressions with a trailing year field. Unsupported input is reported instead of approximated.',
          'It does not know about your scheduler’s catch-up behaviour after downtime, jitter, or overlap protection — those are runtime policies, not part of the expression.',
          'It does not fetch the server’s time zone. Select the time zone the scheduler actually runs in, otherwise the previewed runs will be offset.',
          'It does not keep a history of the expressions you type.'
        ]}
      />

      <ToolRelated items={relatedTools} />
    </AppLayout>
  );
}
