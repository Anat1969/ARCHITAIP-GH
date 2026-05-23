import { useState, useCallback } from 'react';

export default function PromptButton({ label, text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      className={`prompt-btn ${copied ? 'prompt-btn--copied' : ''}`}
      onClick={handleCopy}
      title={text}
    >
      <span className="prompt-btn__label">{label}</span>
      <span className="prompt-btn__status">
        {copied ? 'הועתק ✓' : 'העתק פרומפט'}
      </span>
    </button>
  );
}
