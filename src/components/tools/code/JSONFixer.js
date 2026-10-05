'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import CodeEditor from '../../common/CodeEditor';
import { fixJson } from '../../../utils/jsonFixer';
import { downloadAsFile } from '../../../utils/downloadUtils';
import SimpleAd from '../../ads/SimpleAdSSG';

// Broken on purpose: it exercises R-1 (fence), R-2 (prose around it), R-3
// (trailing comma), R-4 (single quotes), R-5 (bare key), R-6 (comment) and
// R-7 (Python literals).
const SAMPLE_BROKEN = [
  'Sure! Here is the worker config you asked for:',
  '',
  '```json',
  '{',
  '  // retry policy',
  "  name: 'ingest-worker',",
  "  'maxRetries': 5,",
  '  enabled: True,',
  '  fallback: None,',
  '  tags: ["live", "eu-west",],',
  '}',
  '```',
  '',
  'Let me know if you want this as YAML instead.',
].join('\n');

const JSONFixer = () => {
  const { isDarkTheme } = useTheme();
  const [input, setInput] = useState('');
  const [pretty, setPretty] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

  const result = useMemo(() => fixJson(input, { pretty }), [input, pretty]);
  const hasInput = input.trim().length > 0;
  const canUseResult = result.status === 'fixed' || result.status === 'valid';

  const status = useMemo(() => {
    if (!hasInput) return null;
    if (result.status === 'failed') return { kind: 'invalid', label: '❌ Could not repair' };
    if (result.status === 'valid') return { kind: 'valid', label: '✅ Already valid JSON' };

    // R-18 is the only speculative rule: completing a cut-off tail invents an
    // ending, so it is called out instead of being folded into the repair count.
    // Everything else is a deterministic rewrite of something that is present.
    const cutOff = result.rules.some((rule) => rule.id === 'R-18');
    if (cutOff) {
      return {
        kind: 'warn',
        label: '⚠️ Repaired — input was cut off',
        title:
          'The pasted text ended mid-structure. The closing brackets and the unfinished ' +
          'last value were completed by guessing, so check the end of the result.',
      };
    }
    return { kind: 'valid', label: `✅ Repaired (${result.stats.repairs})` };
  }, [hasInput, result]);

  const loadSample = () => {
    setInput(SAMPLE_BROKEN);
    setCopied(false);
  };

  const clearAll = () => {
    setInput('');
    setCopied(false);
  };

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInput(typeof reader.result === 'string' ? reader.result : '');
      setCopied(false);
    };
    reader.readAsText(file);
  };

  const copyResult = async () => {
    if (!canUseResult || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const downloadResult = () => {
    if (!canUseResult || !result.output) return;
    downloadAsFile(result.output, 'fixed.json', 'application/json');
  };

  return (
    <div className={`tool-container ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div
            className={`input-group json-fixer-drop ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              readFile(event.dataTransfer.files?.[0]);
            }}
          >
            <label className="input-label">
              JSON Input
            </label>
            <CodeEditor
              value={input}
              onChange={(value) => {
                setInput(value);
                setCopied(false);
              }}
              language="json"
              placeholder="Paste your JSON here (code fences, comments, trailing commas and prose around it are all fine)..."
              name="json-fixer-input-editor"
              height="calc(100vh - 16rem)"
              isDarkTheme={false}
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="primary-actions">
            <button className="btn btn-primary" onClick={copyResult} disabled={!canUseResult}>
              {copied ? '✅ Copied' : '📋 Copy result'}
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSample}>
              📄 Sample
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setPretty(!pretty)}
              title={pretty ? 'Output the repaired JSON on one line' : 'Indent the repaired JSON'}
            >
              {pretty ? '🗜️ Minify' : '✨ Format'}
            </button>
            <button className="btn btn-outline" onClick={clearAll}>
              🗑️ Clear
            </button>
            {canUseResult && (
              <button className="btn btn-outline" onClick={downloadResult}>
                💾 Download
              </button>
            )}
          </div>

          <SimpleAd />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="input-group">
            <label className="input-label">
              Result
              {status && (
                <span className={`status-indicator ${status.kind}`} title={status.title}>
                  {status.label}
                </span>
              )}
            </label>
            <CodeEditor
              value={result.output}
              onChange={() => {}} // Read-only
              language="json"
              readOnly={false}
              name="json-fixer-output-editor"
              height="calc(100vh - 16rem)"
              showLineNumbers={true}
              placeholder="The repaired JSON will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONFixer;
