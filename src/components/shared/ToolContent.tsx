import React, { type ReactNode } from 'react';
import Link from 'next/link';

// Content building blocks shared by all tool pages, implementing the content
// template from the PRD (section 5.1): explanation, examples, FAQ, privacy
// notice, limits and internal links to related tools.
//
// These render on the server so the copy is present in the static HTML.

export interface ToolExample {
  title: string;
  description?: string;
  input?: string;
  output?: string;
  note?: string;
}

export interface FaqItem {
  question: string;
  answer: string | string[];
}

export interface RelatedItem {
  path: string;
  title: string;
  description?: string;
}

interface ToolIntroProps {
  title: string;
  children: ReactNode;
}

export const ToolIntro = ({ title, children }: ToolIntroProps) => (
  <section className="tool-content-section" aria-label={title}>
    <h2 className="tool-content-title">{title}</h2>
    <div className="tool-content-body">{children}</div>
  </section>
);

interface ToolExamplesProps {
  title?: string;
  items: ToolExample[];
}

export const ToolExamples = ({ title = 'Worked examples', items }: ToolExamplesProps) => (
  <section className="tool-content-section" aria-label={title}>
    <h2 className="tool-content-title">{title}</h2>
    <div className="tool-examples">
      {items.map((item) => (
        <article key={item.title} className="tool-example">
          <h3 className="tool-example-title">{item.title}</h3>
          {item.description && <p className="tool-example-desc">{item.description}</p>}
          {item.input && (
            <div className="tool-example-block">
              <span className="tool-example-label">Input</span>
              <pre className="tool-example-code">{item.input}</pre>
            </div>
          )}
          {item.output && (
            <div className="tool-example-block">
              <span className="tool-example-label">Result</span>
              <pre className="tool-example-code">{item.output}</pre>
            </div>
          )}
          {item.note && <p className="tool-example-note">{item.note}</p>}
        </article>
      ))}
    </div>
  </section>
);

interface ToolFaqProps {
  title?: string;
  items: FaqItem[];
}

export const ToolFaq = ({ title = 'Frequently asked questions', items }: ToolFaqProps) => (
  <section className="tool-content-section" aria-label={title}>
    <h2 className="tool-content-title">{title}</h2>
    <div className="tool-faq">
      {items.map((item) => (
        <details key={item.question} className="tool-faq-item">
          <summary className="tool-faq-question">{item.question}</summary>
          <div className="tool-faq-answer">
            {(Array.isArray(item.answer) ? item.answer : [item.answer]).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  </section>
);

interface ToolPrivacyNoticeProps {
  title?: string;
  children: ReactNode;
}

export const ToolPrivacyNotice = ({
  title = 'Your data stays in your browser',
  children
}: ToolPrivacyNoticeProps) => (
  <aside className="tool-privacy">
    <span className="tool-privacy-icon" aria-hidden="true">
      🔒
    </span>
    <div>
      <h2 className="tool-privacy-title">{title}</h2>
      <div className="tool-privacy-body">{children}</div>
    </div>
  </aside>
);

interface ToolLimitsProps {
  title?: string;
  items: string[];
}

export const ToolLimits = ({ title = 'What this tool does not do', items }: ToolLimitsProps) => (
  <section className="tool-content-section" aria-label={title}>
    <h2 className="tool-content-title">{title}</h2>
    <ul className="tool-limits-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </section>
);

interface ToolRelatedProps {
  title?: string;
  items: RelatedItem[];
}

export const ToolRelated = ({ title = 'Related tools', items }: ToolRelatedProps) => (
  <section className="tool-content-section" aria-label={title}>
    <h2 className="tool-content-title">{title}</h2>
    <ul className="tool-related-list">
      {items.map((item) => (
        <li key={item.path} className="tool-related-item">
          <Link href={item.path} className="tool-related-link">
            {item.title}
          </Link>
          {item.description && <span className="tool-related-desc"> — {item.description}</span>}
        </li>
      ))}
    </ul>
  </section>
);
