'use client';

import React from 'react';
import AceEditor from 'react-ace';
import { useTheme } from '../../contexts/ThemeContext';

// Import Ace Editor modes (languages) - Common and well-supported modes only
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/mode-sh';

// Import Ace Editor themes
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-eclipse';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/theme-chrome';

// Import Ace Editor extensions
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';

// Configure Ace Editor to disable web workers (fixes worker loading issues in React)
import ace from 'ace-builds/src-noconflict/ace';
ace.config.set('useWorker', false);

/**
 * Get the consistent professional theme
 * Same beautiful appearance for all languages, but syntax highlighting will be language-specific
 */
const getTheme = (isDarkTheme) => {
  return isDarkTheme ? 'tomorrow_night' : 'chrome';
};

/**
 * Professional Code Editor Component using Ace Editor
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Editor content
 * @param {function} props.onChange - Change handler
 * @param {string} props.language - Programming language mode (json, xml, html, text)
 * @param {boolean} props.readOnly - Whether editor is read-only

 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.name - Editor name/id
 * @param {number} props.fontSize - Font size (default: 14)
 * @param {boolean} props.showLineNumbers - Show line numbers (default: true)
 * @param {boolean} props.showGutter - Show gutter area (default: true)
 * @param {boolean} props.highlightActiveLine - Highlight active line (default: true)
 * @param {number} props.tabSize - Tab size (default: 2)
 */
const CodeEditor = ({
  value = '',
  onChange = () => {},
  language = 'text',
  readOnly = false,
  placeholder = '',
  name = 'code-editor',
  fontSize = 14,
  showLineNumbers = true,
  showGutter = true,
  highlightActiveLine = true,
  tabSize = 2,
  width = '100%',
  height = 'calc(100vh - 16rem)',
  ...props
}) => {
  // Get theme from global context
  const { isDarkTheme } = useTheme();
  // Map language names to Ace Editor modes - only supported modes
  const languageMap = {
    'text': 'text',
    'plain': 'text',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'javascript': 'javascript',
    'js': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'python': 'python',
    'py': 'python',
    'java': 'java',
    'c': 'c_cpp',
    'cpp': 'c_cpp',
    'c++': 'c_cpp',
    'php': 'php',
    'sql': 'sql',
    'yaml': 'yaml',
    'yml': 'yaml',
    'markdown': 'markdown',
    'md': 'markdown',
    'ruby': 'ruby',
    'rb': 'ruby',
    'shell': 'sh',
    'bash': 'sh',
    'sh': 'sh'
  };

  // Get the appropriate mode
  const mode = languageMap[language.toLowerCase()] || 'text';

  // Theme selection - consistent theme for all languages
  const theme = getTheme(isDarkTheme);

  // Editor options for professional IDE-like experience
  const editorOptions = {
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: false,
    showLineNumbers: showLineNumbers,
    showGutter: showGutter,
    highlightActiveLine: highlightActiveLine,
    tabSize: tabSize,
    useSoftTabs: true,
    wrap: true,
    fontSize: fontSize,
    fontFamily: "'Source Code Pro', 'Monaco', 'Menlo', 'Courier New', monospace",
    cursorStyle: 'ace',
    mergeUndoDeltas: true,
    behavioursEnabled: true,
    wrapBehavioursEnabled: true,
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: false,
    scrollPastEnd: 0.1,
    fadeFoldWidgets: false,
    showInvisibles: false,
    displayIndentGuides: true,
    animatedScroll: true,
    scrollSpeed: 2,
    dragDelay: 0,
    dragEnabled: true,
    focusTimeout: 0,
    tooltipFollowsMouse: false,
    firstLineNumber: 1,
    overwrite: false,
    newLineMode: 'auto',
    useWorker: false,
    showFoldWidgets: true,
    foldStyle: 'markbegin',
    showPrintMargin: false,
    printMarginColumn: 80,
    highlightSelectedWord: true,
    fixedWidthGutter: false,
    theme: `ace/theme/${theme}`,
    mode: `ace/mode/${mode}`,
  };

  // Handle editor change
  const handleChange = (newValue, event) => {
    onChange(newValue);
  };

  // Handle editor load
  const handleEditorLoad = (editor) => {
    // Configure editor for better UX
    editor.setOptions(editorOptions);
    
    // Enable advanced features
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setTabSize(tabSize);
    editor.getSession().setUseSoftTabs(true);
    
    // Placeholder is handled by AceEditor's native placeholder prop
    
    // Focus handling
    if (!readOnly) {
      setTimeout(() => {
        editor.focus();
      }, 100);
    }
  };

  return (
    <div className={`code-editor-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} style={{ width, height }}>
      <AceEditor
        mode={mode}
        theme={theme}
        name={name}
        value={value}
        onChange={handleChange}
        onLoad={handleEditorLoad}
        width={width}
        height={height}
        readOnly={readOnly}
        placeholder={placeholder}
        fontSize={fontSize}
        showPrintMargin={false}
        showGutter={showGutter}
        highlightActiveLine={highlightActiveLine}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: false, // Disabled to prevent interference
          enableSnippets: false,
          showLineNumbers: showLineNumbers,
          tabSize: tabSize,
          wrap: true,
          fontFamily: "'Source Code Pro', 'Monaco', 'Menlo', 'Courier New', monospace",
          useWorker: false // Disabled to prevent worker loading errors in React
        }}
        editorProps={{
          $blockScrolling: Infinity
        }}
        commands={[
          {
            name: 'save',
            bindKey: { win: 'Ctrl-S', mac: 'Cmd-S' },
            exec: () => {
              // Prevent default save behavior
              return false;
            }
          }
        ]}
        {...props}
      />
    </div>
  );
};

export default CodeEditor;
