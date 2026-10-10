import { ToolIntro, ToolFaq, ToolRelated } from './ToolContent';
import { getToolContent } from '@/utils/toolContent';
import { generateFaqJsonLd } from '@/utils/pageGenerator';

// FAQ answers may be one string or several paragraphs; schema.org wants a
// single string.
function answerToText(answer: string | string[]): string {
  return Array.isArray(answer) ? answer.join(' ') : answer;
}

interface ToolPageContentProps {
  path: string;
}

// Renders the explanatory copy, FAQ and related-tool links that sit below a
// tool, plus a FAQPage JSON-LD block for the same questions.
//
// This is a server component: the copy is present in the exported static HTML
// even though the FAQ is collapsed with <details>, and it adds no client JS.
// Pages without an entry in `toolContent` render nothing.
export default function ToolPageContent({ path }: ToolPageContentProps) {
  const content = getToolContent(path);
  if (!content) return null;

  const faqLd = generateFaqJsonLd(
    (content.faq ?? []).map((item) => ({
      question: item.question,
      answer: answerToText(item.answer)
    }))
  );

  const hasAside =
    (content.faq?.length ?? 0) > 0 || (content.related?.length ?? 0) > 0;

  return (
    <div className="tool-page-content">
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <div className={`tool-content-grid${hasAside ? ' tool-content-grid--split' : ''}`}>
        <div className="tool-content-main">
          {content.sections.map((section) => (
            <ToolIntro key={section.title} title={section.title}>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </ToolIntro>
          ))}
        </div>

        {hasAside && (
          <div className="tool-content-aside">
            {content.faq && content.faq.length > 0 && <ToolFaq items={content.faq} />}
            {content.related && content.related.length > 0 && (
              <ToolRelated items={content.related} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
