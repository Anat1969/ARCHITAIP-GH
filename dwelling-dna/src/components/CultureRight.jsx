import { forwardRef, useState, useRef, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import PromptButton from './PromptButton';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

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
    <div
      className={`${className} editable-field`}
      onClick={start}
      title="לחץ לעריכה"
    >
      {value || <span className="editable-field__placeholder">{placeholder}</span>}
      <span className="editable-field__icon">✏</span>
    </div>
  );
}

const CultureRight = forwardRef(function CultureRight({ culture, content, onContentChange, pageNum }, ref) {
  const { id, index, name, archetype, chaos, order, role, colors, gradient, insight, prompts } = culture;
  const [generatedPrompts, setGeneratedPrompts] = useState(null);
  const [generating, setGenerating] = useState(false);
  const hasClaudeKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

  const handleChange = useCallback((field) => (val) => {
    onContentChange?.({ [field]: val });
  }, [onContentChange]);

  const handleGeneratePrompts = async () => {
    setGenerating(true);
    try {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `צור 3 פרומפטים באנגלית ליצירת תמונות AI עבור התרבות הארכיטקטונית: ${name}.
הארכיטייפ: ${archetype}.
כל פרומפט צריך לתאר מרחב ארכיטקטוני ספציפי (פרטי, מעבר, ציבורי) בסגנון התרבות.
החזר JSON בלבד: [{"label":"מרחב פרטי","text":"..."},{"label":"מרחב מעבר","text":"..."},{"label":"מרחב ציבורי","text":"..."}]`,
        }],
      });
      const text = response.content[0]?.text ?? '';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        setGeneratedPrompts(JSON.parse(match[0]));
      }
    } catch (err) {
      console.error('Claude error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const activePrompts = generatedPrompts || prompts;

  return (
    <div
      className="page culture-right"
      data-culture={id}
      ref={ref}
      dir="rtl"
      style={{
        '--c-primary': colors.primary,
        '--c-secondary': colors.secondary,
        '--c-accent': colors.accent,
        '--c-gradient': gradient,
        backgroundImage: `linear-gradient(to left, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0.35) 100%), ${gradient}`,
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 50%',
      }}
    >
      {pageNum != null && <span className="page-num page-num--right">{pageNum}</span>}
      <div className="culture-right__inner">
        <div className="culture-right__meta">
          <span className="culture-right__num">
            {String(index).padStart(2, '0')}
          </span>
          <span className="culture-right__archetype">{archetype}</span>
        </div>

        <h2 className="culture-right__name">{name}</h2>

        <blockquote className="culture-right__insight">{insight}</blockquote>

        <div className="culture-right__triad">
          <div className="culture-right__triad-item">
            <span className="culture-right__triad-label">כאוס</span>
            <span className="culture-right__triad-val">{chaos}</span>
          </div>
          <span className="culture-right__triad-arrow">→</span>
          <div className="culture-right__triad-item">
            <span className="culture-right__triad-label">סדר</span>
            <span className="culture-right__triad-val">{order}</span>
          </div>
          <span className="culture-right__triad-arrow">→</span>
          <div className="culture-right__triad-item">
            <span className="culture-right__triad-label">תפקיד</span>
            <span className="culture-right__triad-val">{role}</span>
          </div>
        </div>

        <div className="culture-right__fields">
          <EditableField
            className="culture-right__paragraph"
            value={content?.paragraph ?? culture.paragraph}
            onChange={handleChange('paragraph')}
            multiline
            placeholder="הוסף תיאור תרבותי..."
          />
          <EditableField
            className="culture-right__post"
            value={content?.post ?? culture.post}
            onChange={handleChange('post')}
            placeholder="הוסף פוסט קצר..."
          />
        </div>

      </div>
    </div>
  );
});

export default CultureRight;
