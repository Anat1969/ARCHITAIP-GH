import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../store/auth';

/**
 * Text that the editor can rewrite where it stands. Readers see plain text;
 * in edit mode the same block becomes a field that saves when it loses focus,
 * so there is no separate form to keep in sync with the page.
 */
export default function Editable({ as: Tag = 'div', value, onSave, multiline = false, className = '', placeholder = '' }) {
  const { editing } = useAuth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const ref = useRef(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    ref.current.focus();
    if (multiline) fit(ref.current);
  }, [open, multiline]);

  if (!editing) {
    if (!value) return null;
    return <Tag className={className}>{value}</Tag>;
  }

  const start = () => { setDraft(value ?? ''); setOpen(true); };

  const commit = () => {
    setOpen(false);
    const next = draft.trim();
    if (next !== (value ?? '').trim()) onSave?.(next);
  };

  if (open) {
    const props = {
      ref,
      className: `${className} editable editable--open`,
      value: draft,
      dir: 'rtl',
      onChange: (e) => { setDraft(e.target.value); if (multiline) fit(e.target); },
      onBlur: commit,
      onKeyDown: (e) => {
        if (e.key === 'Escape') { setDraft(value ?? ''); setOpen(false); }
        if (!multiline && e.key === 'Enter') { e.preventDefault(); commit(); }
      },
    };
    return multiline ? <textarea {...props} rows={3} /> : <input {...props} />;
  }

  return (
    <Tag
      className={`${className} editable`}
      role="button"
      tabIndex={0}
      onClick={start}
      onKeyDown={(e) => { if (e.key === 'Enter') start(); }}
      title="לחיצה לעריכה"
    >
      {value || <span className="editable__placeholder">{placeholder}</span>}
    </Tag>
  );
}

function fit(el) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}
