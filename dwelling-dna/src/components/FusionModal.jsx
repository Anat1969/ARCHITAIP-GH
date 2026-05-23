import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { parseClaudeJson } from '../lib/parseClaudeJson';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

function blendHex(a, b, t = 0.5) {
  const parse = (h) => {
    const n = parseInt(h.replace('#', ''), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

function buildFusionId(parents) {
  return parents.map(p => p.id).join('_') + '_' + Date.now().toString(36);
}

function GeneratingOverlay({ names }) {
  return (
    <div className="generating-overlay">
      <div className="generating-overlay__arches">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="generating-overlay__arch" />
        ))}
      </div>
      <div className="generating-overlay__text">
        Claude ממזג את {names}<span className="generating-overlay__dots" />
      </div>
    </div>
  );
}

export default function FusionModal({ cultures, fusions, onClose, onCreate }) {
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState('equal');
  const [weights, setWeights] = useState({});
  const [customName, setCustomName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const allParents = [
    ...cultures.map(c => ({ ...c, _type: 'culture' })),
    ...fusions.map(f => ({ id: f.id, name: f.name, colors: f.colors, _type: 'fusion' })),
  ];

  const toggleSelect = (item) => {
    setSelected(prev => {
      if (prev.find(p => p.id === item.id)) return prev.filter(p => p.id !== item.id);
      if (prev.length >= 4) return prev;
      return [...prev, item];
    });
  };

  const getWeight = (id) => {
    if (mode !== 'weighted') return 1 / selected.length;
    return weights[id] ?? (1 / selected.length);
  };

  const setWeight = (id, val) => {
    setWeights(prev => ({ ...prev, [id]: parseFloat(val) / 100 }));
  };

  const buildParentData = (parent) => {
    if (parent._type === 'fusion') {
      const f = fusions.find(f => f.id === parent.id);
      return f ? { chaos: f.chaos, order: f.order, role: f.role, vectors: f.vectors } : {};
    }
    const c = cultures.find(c => c.id === parent.id);
    return c ? { chaos: c.chaos, order: c.order, role: c.role, vectors: c.vectors } : {};
  };

  const handleCreate = async () => {
    if (selected.length < 2) return;
    setGenerating(true);
    setError(null);

    try {
      const parentDetails = selected.map(p => ({ name: p.name, ...buildParentData(p) }));
      const modeLabel = { equal: 'שווה', weighted: 'משוקלל', dominant: 'דומיננטי' }[mode];
      const weightsStr = selected.map(p => `${p.name}: ${Math.round(getWeight(p.id) * 100)}%`).join(', ');
      const parentsPrompt = parentDetails.map((p, i) =>
        `תרבות ${i+1} (${p.name}): chaos="${p.chaos}", order="${p.order}", role="${p.role}", vectors=${JSON.stringify(p.vectors)}`
      ).join('\n');

      const response = await anthropic.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `אתה מומחה ארכיטקטורה תרבותית. צור מיזוג ${modeLabel} בין: ${selected.map(p=>p.name).join(' + ')}.
משקלים: ${weightsStr}.

${parentsPrompt}

החזר JSON בלבד ללא הסבר. כל הטקסט בעברית חייב להיות על שורה אחת ללא שבירות שורה בתוך ערכי המחרוזות:
{
  "chaos":"...",
  "order":"...",
  "role":"...",
  "insight":"...",
  "paragraph":"...",
  "post":"...",
  "vectors":{"material":"...","light":"...","threshold":"...","proportion":"...","narrative":"..."},
  "prompts":[
    {"label":"חוץ","text":"English architectural exterior prompt..."},
    {"label":"סף","text":"English architectural threshold prompt..."},
    {"label":"פנים","text":"English architectural interior prompt..."}
  ],
  "spaces":[
    {"caption":"תיאור עברי קצר — מרחב פרטי"},
    {"caption":"תיאור עברי קצר — מרחב מעבר"},
    {"caption":"תיאור עברי קצר — מרחב קהילתי"}
  ]
}`,
        }],
      });

      const text = response.content[0]?.text ?? '';
      const data = parseClaudeJson(text);

      // Safe defaults
      data.spaces = (data.spaces ?? []).map((s, i) => ({
        id: ['private','threshold','communal'][i] ?? `space_${i}`,
        caption: s.caption ?? '',
      }));
      if (data.spaces.length === 0) {
        data.spaces = [
          { id: 'private',   caption: '' },
          { id: 'threshold', caption: '' },
          { id: 'communal',  caption: '' },
        ];
      }
      data.prompts  = data.prompts  ?? [];
      data.vectors  = data.vectors  ?? {};

      // Blend colors
      const t = mode === 'dominant' ? 0.2 : 0.5;
      const pA = selected[0];
      const pB = selected[selected.length - 1];
      const cA = cultures.find(c => c.id === pA.id)?.colors || fusions.find(f => f.id === pA.id)?.colors || pA.colors;
      const cB = cultures.find(c => c.id === pB.id)?.colors || fusions.find(f => f.id === pB.id)?.colors || pB.colors;
      const blendedColors = {
        primary:   blendHex(cA.primary,   cB.primary,   t),
        secondary: blendHex(cA.secondary, cB.secondary, t),
        accent:    blendHex(cA.accent,    cB.accent,    t),
      };

      const fusionName = customName.trim() || selected.map(p => p.name).join(' × ');
      const id = buildFusionId(selected);

      const fusion = {
        id,
        name: fusionName,
        name_custom: customName.trim(),
        lineage: {
          parents: selected.map(p => p.id),
          parent_names: selected.map(p => p.name),
          parent_weights: selected.map(p => getWeight(p.id)),
          fusion_logic: mode,
        },
        chaos: data.chaos,
        order: data.order,
        role: data.role,
        colors: blendedColors,
        gradient: `linear-gradient(145deg, ${cA.primary} 0%, ${blendedColors.primary} 40%, ${cB.secondary} 80%, ${cB.secondary}CC 100%)`,
        vectors: data.vectors,
        insight: data.insight,
        paragraph: data.paragraph,
        post: data.post,
        spaces: [
          { id: 'private',   label: 'מרחב פרטי',   caption: data.spaces[0]?.caption ?? '', gradient: `linear-gradient(160deg, ${blendedColors.accent}, ${blendedColors.secondary})` },
          { id: 'threshold', label: 'מרחב מעבר',   caption: data.spaces[1]?.caption ?? '', gradient: `linear-gradient(160deg, ${blendedColors.primary}, ${blendedColors.accent})` },
          { id: 'communal',  label: 'מרחב קהילתי', caption: data.spaces[2]?.caption ?? '', gradient: `linear-gradient(160deg, ${cA.primary}, ${cB.primary})` },
        ],
        prompts: data.prompts,
        created_at: Date.now(),
      };

      onCreate(fusion);
    } catch (err) {
      setError(err.message || 'שגיאה ביצירת מיזוג');
      console.error('Fusion error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fusion-modal" onClick={onClose}>
      <div className="fusion-modal__box" dir="rtl" onClick={e => e.stopPropagation()}>
        {generating && (
          <GeneratingOverlay names={selected.map(p => p.name).join(' × ')} />
        )}

        <button className="fusion-modal__close" onClick={onClose}>×</button>
        <h2 className="fusion-modal__title">יצירת מיזוג</h2>
        <p className="fusion-modal__sub">בחר 2 עד 4 תרבויות לשילוב</p>

        <div className="fusion-modal__grid">
          {allParents.map(item => {
            const isSelected = selected.find(p => p.id === item.id);
            const selIdx = selected.findIndex(p => p.id === item.id);
            return (
              <button
                key={item.id}
                className={`fusion-modal__item ${isSelected ? 'fusion-modal__item--selected' : ''}`}
                style={isSelected ? { borderColor: item.colors?.accent, backgroundColor: item.colors?.accent + '20' } : {}}
                onClick={() => toggleSelect(item)}
              >
                <span className="fusion-modal__item-dot" style={{ background: item.colors?.accent || '#888' }} />
                <span className="fusion-modal__item-name">{item.name}</span>
                {item._type === 'fusion' && <span className="fusion-modal__item-badge">×</span>}
                {isSelected && <span className="fusion-modal__item-num">{selIdx + 1}</span>}
              </button>
            );
          })}
        </div>

        {selected.length >= 2 && (
          <>
            <div className="fusion-modal__modes">
              <span className="fusion-modal__modes-label">מצב מיזוג:</span>
              {[['equal','שווה'],['weighted','משוקלל'],['dominant','דומיננטי']].map(([val, lbl]) => (
                <label key={val} className="fusion-modal__mode-opt">
                  <input type="radio" name="mode" value={val} checked={mode===val} onChange={() => setMode(val)} />
                  {lbl}
                </label>
              ))}
            </div>

            {(mode === 'weighted' || mode === 'dominant') && (
              <div className="fusion-modal__sliders">
                {selected.map(p => (
                  <div key={p.id} className="fusion-modal__slider-row">
                    <span className="fusion-modal__slider-name">{p.name}</span>
                    <input
                      type="range" min="0" max="100" step="5"
                      value={Math.round(getWeight(p.id) * 100)}
                      onChange={e => setWeight(p.id, e.target.value)}
                      className="fusion-modal__slider"
                    />
                    <span className="fusion-modal__slider-val">{Math.round(getWeight(p.id) * 100)}%</span>
                  </div>
                ))}
              </div>
            )}

            <input
              className="fusion-modal__name-input"
              placeholder="שם מותאם אישית (אופציונלי)"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              dir="rtl"
            />
          </>
        )}

        {error && <p className="fusion-modal__error">{error}</p>}

        <button
          className="fusion-modal__create-btn"
          disabled={selected.length < 2 || generating}
          onClick={handleCreate}
        >
          {`צור מיזוג — ${selected.map(p=>p.name).join(' × ') || '?'}`}
        </button>
      </div>
    </div>
  );
}
