// The vocabulary the whole magazine shares: the five vectors every culture is
// read through, the three spaces it is projected into, and the prompt that
// carries an ancestral space forward into a built future.

export const VECTORS = [
  { key: 'material', label: 'חומר', en: 'MATERIAL' },
  { key: 'light', label: 'אור', en: 'LIGHT' },
  { key: 'threshold', label: 'סף', en: 'THRESHOLD' },
  { key: 'proportion', label: 'פרופורציה', en: 'PROPORTION' },
  { key: 'narrative', label: 'נרטיב', en: 'NARRATIVE' },
];

export const SPACE_KINDS = [
  { id: 'private', label: 'מרחב פרטי', en: 'PRIVATE' },
  { id: 'threshold', label: 'מרחב מעבר', en: 'THRESHOLD' },
  { id: 'communal', label: 'מרחב קהילתי', en: 'COMMUNAL' },
];

export const FUSION_MODES = [
  { id: 'equal', label: 'שווה', hint: 'כל תרבות תורמת במידה שווה' },
  { id: 'weighted', label: 'משוקלל', hint: 'לפי המשקלים שנקבעו' },
  { id: 'dominant', label: 'דומיננטי', hint: 'הראשונה מובילה, האחרות מתבלות' },
];

export function modernEntry(culture, idx) {
  return culture.modern?.[idx] ?? null;
}

/**
 * The prompt for the future half of the spread.
 *
 * A culture can carry its own hand-written `modern` set - a distilled reading
 * always beats a formula. Everything else falls back to the builder below,
 * which hands the model the ancestral logic to carry forward instead of the
 * ancient prompt to restage.
 */
export function buildModernPrompt(culture, idx, ancientText = '') {
  const own = modernEntry(culture, idx);
  if (own?.text) return own.text;

  const spaceTypes = ['exterior', 'threshold', 'interior'];
  const spaceThemes = [
    'mass, enclosure, and how the building meets the ground',
    'the passage inward - compression, filtering, arrival',
    'the inhabited room - light, proportion, and what the space asks of the body',
  ];

  // English throughout: Hebrew inside an image prompt comes back as noise.
  return `Speculative architecture of the next century, ${spaceTypes[idx] || 'architectural space'}. ` +
    `Spatial focus: ${spaceThemes[idx] || spaceThemes[0]}. ` +
    `Inherited logic to distil - "${ancientText}" - keep its spatial reasoning (weight, light, sequence, proportion) ` +
    `and discard every period motif, ornament, ruin and costume. ` +
    `Rebuild it with the means of a future era: robot-fabricated local matter, earth and mass-timber composites, ` +
    `embedded climate skins, hairline joints, zero decoration. ` +
    `Not a historical reconstruction and not a museum set. ` +
    `Documentary realism, professional architecture photography, natural light, restrained palette, quiet monumental atmosphere.`;
}

/** Both rows of a spread, ancestral then projected, in one shape. */
export function spreadRows(entry) {
  const prompts = entry.prompts ?? [];
  const spaces = entry.spaces ?? [];
  const ancestral = spaces.map((s, i) => ({
    slot: s.id,
    kind: SPACE_KINDS.find((k) => k.id === s.id) ?? { label: s.label, en: '' },
    label: s.label,
    caption: s.caption,
    gradient: s.gradient,
    prompt: prompts[i]?.text || s.caption,
  }));
  if (entry.kind === 'fusion') return { ancestral, modern: [] };
  const modern = prompts.map((p, i) => ({
    slot: `prompt_${i}`,
    kind: SPACE_KINDS[i] ?? { label: p.label, en: '' },
    label: p.label,
    caption: modernEntry(entry, i)?.caption ?? '',
    gradient: entry.gradient,
    prompt: buildModernPrompt(entry, i, p.text),
  }));
  return { ancestral, modern };
}

export function blendHex(a = '#888888', b = '#888888', t = 0.5) {
  const parse = (h) => {
    const n = parseInt(String(h).replace('#', '').slice(0, 6), 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const mix = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}
