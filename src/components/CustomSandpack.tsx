import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
  useActiveCode,
} from '@codesandbox/sandpack-react';
import prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';

// Exported as a type to easily import into your Astro wrapper
export type CustomSandpackProps = {
  files: Record<string, string>;
  template?: 'react-ts' | 'react' | 'vanilla-ts' | 'vanilla' | 'static';
};

const FormatButton: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { code, updateCode } = useActiveCode();
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleFormat = useCallback(async () => {
    try {
      const formatted = await prettier.format(codeRef.current, {
        parser: 'babel',
        plugins: [babelPlugin, estreePlugin],
        singleQuote: true,
        trailingComma: 'es5',
      });
      updateCode(formatted);
    } catch (error) {
      console.error('Formatting error:', error);
    }
  }, [updateCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleFormat();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleFormat]);

  return (
    <button
      onClick={handleFormat}
      style={{
        padding: '6px 14px',
        backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0',
        color: isDark ? '#e3e3e3' : '#333',
        border: `1px solid ${isDark ? '#444' : '#ccc'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
      }}
    >
      Format Code
    </button>
  );
};

const ResetButton: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { sandpack } = useSandpack();
  return (
    <button
      onClick={() => sandpack.resetAllFiles()}
      style={{
        padding: '6px 14px',
        backgroundColor: isDark ? '#4a1919' : '#ffcccc',
        color: isDark ? '#e3e3e3' : '#990000',
        border: `1px solid ${isDark ? '#732626' : '#ff9999'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
      }}
    >
      Reset
    </button>
  );
};

export const CustomSandpack: React.FC<CustomSandpackProps> = ({ files, template = 'react-ts', ...rest }) => {
  const [isDark, setIsDark] = useState(false);

  return (
    <SandpackProvider template={template} files={files} theme={isDark ? 'dark' : 'light'} {...rest}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          background: isDark ? 'linear-gradient(145deg, #1e1e1e, #121212)' : 'linear-gradient(145deg, #f5f5f5, #ffffff)',
          borderRadius: '12px',
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              padding: '6px 14px',
              backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0',
              color: isDark ? '#e3e3e3' : '#333',
              border: `1px solid ${isDark ? '#444' : '#ccc'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <FormatButton isDark={isDark} />
          <ResetButton isDark={isDark} />
        </div>

        <SandpackLayout style={{ borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}` }}>
          <SandpackCodeEditor showLineNumbers showTabs style={{ minHeight: '350px', flex: 1 }} />
          <SandpackPreview
            showOpenInCodeSandbox={false}
            style={{ minHeight: '350px', flex: 1, borderLeft: `1px solid ${isDark ? '#333' : '#ccc'}` }}
          />
        </SandpackLayout>

        <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#333' : '#ccc'}` }}>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: isDark ? '#222' : '#e8e8e8',
              color: isDark ? '#888' : '#555',
              fontSize: '12px',
              borderBottom: `1px solid ${isDark ? '#333' : '#ccc'}`,
            }}
          >
            Console Output
          </div>
          <SandpackConsole standalone style={{ height: '200px' }} />
        </div>
      </div>
    </SandpackProvider>
  );
};