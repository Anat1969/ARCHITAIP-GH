import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { parseClaudeJson } from '../lib/parseClaudeJson';

function GeneratingOverlay({ name }) {
  return (
    <div className="generating-overlay">
      <div className="generating-overlay__arches">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="generating-overlay__arch" />
        ))}
      </div>
      <div className="generating-overlay__text">
        Claude בונה את {name}<span className="generating-overlay__dots" />
      </div>
    </div>
  );
}

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

function slugify(name) {
  return name.trim().replace(/\s+/g, '_').replace(/[^\w]/g, '').toLowerCase() || 'culture';
}

export default function CultureModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `אתה מומחה ארכיטקטורה תרבותית. צור פרופיל ארכיטקטוני מלא עבור:
שם: ${name}${period ? `\nתקופה: ${period}` : ''}${region ? `\nאזור: ${region}` : ''}${description ? `\nתיאור: ${description}` : ''}

החזר JSON בלבד ללא הסברים:
{
  "archetype": "שם הארכיטייפ בעברית (2-3 מילות מפתח, כמו: שמירה על הסדר, זרימה ואיזון, כיבוש הגבול)",
  "chaos": "מה מייצג הכאוס בתרבות זו (עברית, משפט קצר)",
  "order": "מה מייצג הסדר (עברית)",
  "role": "תפקיד האדריכלות (עברית, מילה אחת)",
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "gradient": "linear-gradient(145deg, #hex 0%, #hex 40%, #hex 70%, #hex 100%)",
  "vectors": {
    "material": "תיאור החומר הדומיננטי",
    "light": "אופי האור",
    "threshold": "תפיסת הסף",
    "proportion": "תפיסת הפרופורציה",
    "narrative": "הנרטיב הארכיטקטוני"
  },
  "insight": "\"ציטוט מרכזי מייצג בעברית\"",
  "paragraph": "תיאור ארוך 3-4 משפטים בעברית",
  "post": "משפט ביטויי קצר בעברית",
  "spaces": [
    {"id":"private","label":"מרחב פרטי","caption":"תיאור","gradient":"linear-gradient(...)"},
    {"id":"threshold","label":"מרחב מעבר","caption":"תיאור","gradient":"linear-gradient(...)"},
    {"id":"communal","label":"מרחב קהילתי","caption":"תיאור","gradient":"linear-gradient(...)"}
  ],
  "prompts": [
    {"label":"חוץ","text":"English AI image prompt for exterior architecture..."},
    {"label":"סף","text":"English AI image prompt for threshold/entrance..."},
    {"label":"פנים","text":"English AI image prompt for interior space..."}
  ]
}`,
        }],
      });

      const text = response.content[0]?.text ?? '';
      const data = parseClaudeJson(text);

      // Ensure required fields have safe defaults
      data.colors = data.colors ?? { primary: '#888888', secondary: '#444444', accent: '#aaaaaa' };
      data.gradient = data.gradient ?? `linear-gradient(145deg, ${data.colors.primary}, ${data.colors.secondary})`;
      data.spaces = (data.spaces ?? []).map((s, i) => ({
        id: s.id ?? ['private', 'threshold', 'communal'][i] ?? `space_${i}`,
        label: s.label ?? '',
        caption: s.caption ?? '',
        gradient: s.gradient ?? '',
      }));
      if (data.spaces.length === 0) {
        data.spaces = [
          { id: 'private',   label: 'מרחב פרטי',   caption: '', gradient: '' },
          { id: 'threshold', label: 'מרחב מעבר',   caption: '', gradient: '' },
          { id: 'communal',  label: 'מרחב קהילתי', caption: '', gradient: '' },
        ];
      }
      data.prompts = data.prompts ?? [];
      data.vectors = data.vectors ?? {};

      const id = slugify(name) + '_' + Date.now().toString(36);

      const newCulture = {
        id,
        name: name.trim(),
        archetype: data.archetype,
        chaos: data.chaos,
        order: data.order,
        role: data.role,
        colors: data.colors,
        gradient: data.gradient,
        vectors: data.vectors,
        insight: data.insight,
        paragraph: data.paragraph,
        post: data.post,
        spaces: data.spaces,
        prompts: data.prompts,
        isCustom: true,
      };

      onCreate(newCulture);
    } catch (err) {
      setError('שגיאה ביצירת התרבות: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fusion-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fusion-modal__box" dir="rtl">
        {generating && <GeneratingOverlay name={name} />}
        <button className="fusion-modal__close" onClick={onClose}>✕</button>
        <h2 className="fusion-modal__title">הוסף תרבות חדשה</h2>
        <p className="fusion-modal__sub">קלוד יצור פרופיל ארכיטקטוני מלא</p>

        <input
          className="fusion-modal__name-input"
          placeholder="שם התרבות *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          dir="rtl"
        />
        <input
          className="fusion-modal__name-input"
          placeholder="תקופה (לדוגמה: 3000–500 לפנה״ס)"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          dir="rtl"
        />
        <input
          className="fusion-modal__name-input"
          placeholder="אזור גיאוגרפי"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          dir="rtl"
        />
        <textarea
          className="fusion-modal__name-input"
          placeholder="תיאור קצר (אופציונלי)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          dir="rtl"
          rows={3}
          style={{ resize: 'vertical' }}
        />

        {error && <div className="fusion-modal__error">{error}</div>}

        <button
          className="fusion-modal__create-btn"
          onClick={handleCreate}
          disabled={!name.trim() || generating}
        >
          {generating ? '✨ קלוד יוצר תרבות...' : 'צור תרבות'}
        </button>
      </div>
    </div>
  );
}
