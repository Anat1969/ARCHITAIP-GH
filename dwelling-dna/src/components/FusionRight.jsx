import { forwardRef, useState, useRef, useCallback } from 'react';

function EditableField({ value, onChange, multiline, className, placeholder }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  const start = () => {
    setEditing(true);
    setTimeout(() => ref.current?.focus(), 30);
  };

  const stop = () => {
    setEditing(false);
    onChange(ref.current?.value ?? ref.current?.innerText ?? value);
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') { e.preventDefault(); stop(); }
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={ref}
          className={`${className} editable-field--active`}
          defaultValue={value}
          onBlur={stop}
          onKeyDown={handleKeyDown}
          dir="rtl"
          rows={4}
        />
      );
    }
    return (
      <input
        ref={ref}
        className={`${className} editable-field--active`}
        defaultValue={value}
        onBlur={stop}
        onKeyDown={handleKeyDown}
        dir="rtl"
      />
    );
  }

  return (
    <div className={`${className} editable-field`} onClick={start} title="לחץ לעריכה">
      {value || <span className="editable-field__placeholder">{placeholder}</span>}
      <span className="editable-field__icon">✏</span>
    </div>
  );
}

const FusionRight = forwardRef(function FusionRight({ fusion, content, onContentChange, onDelete, pageNum }, ref) {
  const { id, name, lineage, colors, gradient, insight } = fusion;
  const parentNames = lineage.parent_names;
  const modeLabel = { equal: 'שווה', weighted: 'משוקלל', dominant: 'דומיננטי' }[lineage.fusion_logic] || lineage.fusion_logic;

  const handleChange = useCallback((field) => (val) => {
    onContentChange?.({ [field]: val });
  }, [onContentChange]);

  return (
    <div
      className="page culture-right fusion-right"
      data-culture={id}
      ref={ref}
      dir="rtl"
      style={{
        '--c-primary': colors.primary,
        '--c-secondary': colors.secondary,
        '--c-accent': colors.accent,
        backgroundImage: `linear-gradient(to left, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0.35) 100%), ${gradient}`,
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 50%',
      }}
    >
      {pageNum != null && <span className="page-num page-num--right">{pageNum}</span>}
      <button
        className="fusion-delete-btn"
        onClick={() => onDelete?.(id)}
        title="מחק מיזוג"
      >
        ×
      </button>

      <div className="culture-right__inner">
        <div className="culture-right__meta">
          <span className="fusion-badge">FUSION</span>
          <span className="culture-right__archetype">{modeLabel} blend</span>
        </div>

        <h2 className="culture-right__name fusion-title">
          {parentNames.map((n, i) => (
            <span key={i}>
              {i > 0 && <span className="fusion-title__x"> × </span>}
              <span className="fusion-title__part" style={{ color: colors.accent }}>{n}</span>
            </span>
          ))}
        </h2>

        <blockquote className="culture-right__insight">{content?.insight ?? insight}</blockquote>

        <div className="culture-right__fields">
          <EditableField
            className="culture-right__paragraph"
            value={content?.paragraph ?? fusion.paragraph}
            onChange={handleChange('paragraph')}
            multiline
            placeholder="הוסף תיאור מיזוג..."
          />
          <EditableField
            className="culture-right__post"
            value={content?.post ?? fusion.post}
            onChange={handleChange('post')}
            placeholder="הוסף פוסט קצר..."
          />
        </div>

        <div className="fusion-lineage">
          DNA: {modeLabel} blend —{' '}
          {parentNames.map((n, i) => (
            <span key={i}>{i > 0 && ' + '}{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default FusionRight;
