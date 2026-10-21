// The two generators: a new culture from a name, and a fusion of several.
// Both return a complete entry but save nothing - the editor sees the result
// first and decides whether it enters the magazine.

import { askClaude } from './claude';
import { parseClaudeJson } from './parseClaudeJson';
import { SPACE_KINDS, blendHex } from './dna';

const HEX = /^#[0-9a-f]{6}$/i;

function stamp() {
  return Date.now().toString(36);
}

function normalizeSpaces(raw, colors, fallbackGradient) {
  return SPACE_KINDS.map((k, i) => {
    const s = raw?.[i] ?? {};
    return {
      id: k.id,
      label: k.label,
      caption: s.caption ?? '',
      gradient: s.gradient || [
        `linear-gradient(160deg, ${colors.accent}, ${colors.secondary})`,
        `linear-gradient(160deg, ${colors.primary}, ${colors.accent})`,
        fallbackGradient,
      ][i],
    };
  });
}

function normalizePrompts(raw) {
  const labels = ['חוץ', 'סף', 'פנים'];
  return labels.map((label, i) => ({ label, text: raw?.[i]?.text ?? '' })).filter((p) => p.text);
}

export async function generateCulture({ name, period, region, description }) {
  const text = await askClaude({
    model: 'claude-opus-5',
    maxTokens: 8000,
    prompt: `אתה מומחה לארכיטקטורה תרבותית. בנה פרופיל אדריכלי מלא עבור:
שם: ${name}${period ? `\nתקופה: ${period}` : ''}${region ? `\nאזור: ${region}` : ''}${description ? `\nהערות: ${description}` : ''}

חלץ את ההיגיון המרחבי, לא את הקישוט. החזר JSON בלבד, כל מחרוזת בשורה אחת:
{
  "archetype": "2-3 מילים בעברית",
  "chaos": "ממה התרבות מתגוננת, משפט קצר",
  "order": "מה היא בונה כנגדו",
  "role": "תפקיד האדריכלות, מילה אחת",
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "gradient": "linear-gradient(145deg, #hex 0%, #hex 40%, #hex 70%, #hex 100%)",
  "vectors": { "material": "", "light": "", "threshold": "", "proportion": "", "narrative": "" },
  "insight": "ציטוט מזוקק, בלי מרכאות",
  "paragraph": "3-4 משפטים",
  "post": "משפט קצר אחד",
  "interpretation": "איך ה-DNA מתורגם לבית עכשווי, 2-3 משפטים",
  "spaces": [ {"caption":"מרחב פרטי"}, {"caption":"מרחב מעבר"}, {"caption":"מרחב קהילתי"} ],
  "prompts": [
    {"text":"English prompt, traditional exterior, documentary realism, professional architecture photography"},
    {"text":"English prompt, traditional threshold"},
    {"text":"English prompt, traditional interior"}
  ]
}`,
  });

  const d = parseClaudeJson(text);
  const colors = {
    primary: HEX.test(d.colors?.primary) ? d.colors.primary : '#8a8178',
    secondary: HEX.test(d.colors?.secondary) ? d.colors.secondary : '#3a3632',
    accent: HEX.test(d.colors?.accent) ? d.colors.accent : '#c2a878',
  };
  const gradient = typeof d.gradient === 'string' && d.gradient.startsWith('linear-gradient')
    ? d.gradient
    : `linear-gradient(145deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

  return {
    id: `c_${stamp()}`,
    name: name.trim(),
    archetype: d.archetype ?? '',
    chaos: d.chaos ?? '', order: d.order ?? '', role: d.role ?? '',
    colors, gradient,
    vectors: d.vectors ?? {},
    insight: d.insight ?? '', paragraph: d.paragraph ?? '', post: d.post ?? '',
    interpretation: d.interpretation ?? '',
    spaces: normalizeSpaces(d.spaces, colors, gradient),
    prompts: normalizePrompts(d.prompts),
    isCustom: true,
  };
}

export async function generateFusion(parents, mode, weights, customName = '') {
  const modeLabel = { equal: 'שווה', weighted: 'משוקלל', dominant: 'דומיננטי' }[mode];
  const lines = parents.map((p, i) =>
    `תרבות ${i + 1} (${p.name}, משקל ${Math.round(weights[i] * 100)}%): כאוס="${p.chaos}", סדר="${p.order}", תפקיד="${p.role}", וקטורים=${JSON.stringify(p.vectors)}`,
  ).join('\n');

  const text = await askClaude({
    model: 'claude-opus-5',
    maxTokens: 8000,
    prompt: `אתה מומחה לארכיטקטורה תרבותית. סנתז מיזוג ${modeLabel} בין ${parents.map((p) => p.name).join(' + ')}.
${mode === 'dominant' ? `${parents[0].name} מובילה, האחרות מתבלות.` : ''}
${lines}

חשוף את המתח בין ההיגיונות, לא ממוצע שלהם. החזר JSON בלבד, כל מחרוזת בשורה אחת:
{
  "chaos":"", "order":"", "role":"", "insight":"", "paragraph":"", "post":"",
  "vectors":{"material":"","light":"","threshold":"","proportion":"","narrative":""},
  "spaces":[{"caption":"מרחב פרטי"},{"caption":"מרחב מעבר"},{"caption":"מרחב קהילתי"}],
  "prompts":[
    {"text":"English prompt, private space of the fusion, documentary realism, professional architecture photography"},
    {"text":"English prompt, threshold"},
    {"text":"English prompt, communal space"}
  ]
}`,
  });

  const d = parseClaudeJson(text);
  const t = mode === 'dominant' ? 0.2 : 0.5;
  const a = parents[0].colors ?? {};
  const b = parents[parents.length - 1].colors ?? {};
  const colors = {
    primary: blendHex(a.primary, b.primary, t),
    secondary: blendHex(a.secondary, b.secondary, t),
    accent: blendHex(a.accent, b.accent, t),
  };
  const gradient = `linear-gradient(145deg, ${a.primary} 0%, ${colors.primary} 45%, ${b.secondary} 100%)`;

  return {
    id: `${parents.map((p) => p.id).join('_')}_${stamp()}`.slice(0, 120),
    name: customName.trim() || parents.map((p) => p.name).join(' × '),
    name_custom: customName.trim(),
    lineage: {
      parents: parents.map((p) => p.id),
      parent_names: parents.map((p) => p.name),
      parent_weights: weights,
      fusion_logic: mode,
    },
    chaos: d.chaos ?? '', order: d.order ?? '', role: d.role ?? '',
    colors, gradient,
    vectors: d.vectors ?? {},
    insight: d.insight ?? '', paragraph: d.paragraph ?? '', post: d.post ?? '',
    spaces: normalizeSpaces(d.spaces, colors, gradient),
    prompts: normalizePrompts(d.prompts),
  };
}
