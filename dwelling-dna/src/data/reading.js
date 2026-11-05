// The historian's layer: where each culture locates its chaos, and the one
// line that sets it apart from the other ten. This is an editorial reading
// laid over the source data, not a field of the culture itself, so a culture
// the editor adds simply has no family until one is assigned here.

export const FAMILIES = [
  {
    id: 'nature',
    label: 'הכאוס בטבע',
    en: 'NATURE',
    color: '#9a5a2c',
    rule: 'הכאוס הוא כוח פיזי מבחוץ: מים, סערה, מדבר.',
    house: 'הבית הוא חומה.',
  },
  {
    id: 'cosmos',
    label: 'הכאוס בקוסמוס',
    en: 'COSMOS',
    color: '#2e4f7f',
    rule: 'היקום אינו יציב מעצמו, והאדם אחראי לתחזק אותו.',
    house: 'הבית הוא מכשיר.',
  },
  {
    id: 'human',
    label: 'הכאוס באדם',
    en: 'HUMAN',
    color: '#8e2f3c',
    rule: 'הכאוס הוא בחירה. הסכנה נמצאת בתוך האדם.',
    house: 'הבית מחנך.',
  },
  {
    id: 'bond',
    label: 'הכאוס בניתוק',
    en: 'BOND',
    color: '#3f7a5a',
    rule: 'הכאוס הוא סגירה, זוהמה או בידוד.',
    house: 'הבית מחבר.',
  },
];

export const FUSION_FAMILY = { id: 'fusion', label: 'מיזוגים', en: 'FUSION', color: '#6d6a64', rule: 'תשובות שנולדו ממפגש בין תרבויות.', house: '' };
export const OPEN_FAMILY = { id: 'open', label: 'ללא סיווג', en: 'OPEN', color: '#8d8880', rule: 'תרבות שעוד לא שויכה למשפחה.', house: '' };

export const READING = {
  mesopotamia: { family: 'nature', distinct: 'היחידה שהכאוס שלה פיזי. הבית הוא סכר, והסדר נבנה מחדש כל יום.' },
  egypt: { family: 'cosmos', distinct: 'נצח במקום הישרדות. הבית לא מגן מהיום, הוא מוכיח קיום מול המוות.' },
  india: { family: 'cosmos', distinct: 'הבית הוא ביצוע. האדריכלות היא טקס שחייב להתקיים כדי שהקוסמוס יתפקד.' },
  china: { family: 'cosmos', distinct: 'השמיים הם הסרגל. הסדר לא נכפה אלא מועתק, ולכן הציר והסימטריה.' },
  maya: { family: 'cosmos', distinct: 'הסדר נקנה בגוף. הבית מודד זמן וגובה מחיר, מדרגה אחר מדרגה.' },
  israel: { family: 'human', distinct: 'הסדר הוא הסכם בין שני צדדים. הבית לא מפאר, הוא זוכר ומעיד.' },
  persia: { family: 'human', distinct: 'לכאוס יש רצון. היופי הוא נשק, והאור הוא קו החזית.' },
  greece: { family: 'human', distinct: 'הכאוס הוא היוהרה של האדם. הגבול והמידה הם התרופה, והגוף הוא הסרגל.' },
  celtic: { family: 'bond', distinct: 'ההפך מכולן: הסכנה היא בגבול הסגור. הבית מטשטש פנים וחוץ.' },
  japan: { family: 'bond', distinct: 'הכאוס הוא לכלוך ולא אויב. הבית מנקה, מצמצם ומפנה מקום לנוכחות.' },
  africa: { family: 'bond', distinct: 'יחידת הקיום היא הקהילה. הבית בנוי סביב מרכז ששייך לכולם.' },
};

/** The family an entry belongs to, with fusions and unassigned cultures kept apart. */
export function familyOf(entry) {
  if (!entry) return OPEN_FAMILY;
  if (entry.kind === 'fusion') return FUSION_FAMILY;
  const id = READING[entry.id]?.family;
  return FAMILIES.find((f) => f.id === id) ?? OPEN_FAMILY;
}

export function distinctOf(entry) {
  return READING[entry?.id]?.distinct ?? entry?.archetype ?? '';
}

// The three levels a culture is read on. Elements of the same level share a
// band in the comparison, so the eye compares like with like.
export const LEVELS = [
  {
    id: 'mechanism',
    n: '01',
    en: 'WHY',
    label: 'המנגנון',
    q: 'למה בונים',
    fields: [
      { key: 'chaos', label: 'כאוס', en: 'CHAOS', q: 'ממה מגינים' },
      { key: 'order', label: 'סדר', en: 'ORDER', q: 'מה בונים כנגדו' },
      { key: 'role', label: 'תפקיד', en: 'ROLE', q: 'מה הבית עושה' },
    ],
  },
  {
    id: 'dna',
    n: '02',
    en: 'HOW',
    label: 'ה-DNA',
    q: 'איך זה נבנה',
    fields: [
      { key: 'material', label: 'חומר', en: 'MATERIAL', q: 'ממה', vector: true },
      { key: 'light', label: 'אור', en: 'LIGHT', q: 'איך נכנס', vector: true },
      { key: 'threshold', label: 'סף', en: 'THRESHOLD', q: 'איך עוברים', vector: true },
      { key: 'proportion', label: 'פרופורציה', en: 'PROPORTION', q: 'באיזה קנה מידה', vector: true },
      { key: 'narrative', label: 'נרטיב', en: 'NARRATIVE', q: 'מה המרחב אומר', vector: true },
    ],
  },
  {
    id: 'spaces',
    n: '03',
    en: 'WHERE',
    label: 'המרחבים',
    q: 'איפה זה קורה',
    fields: [
      { key: 'private', label: 'פרטי', en: 'PRIVATE', q: 'האדם לבדו' },
      { key: 'threshold', label: 'מעבר', en: 'THRESHOLD', q: 'בין פנים לחוץ' },
      { key: 'communal', label: 'קהילתי', en: 'COMMUNAL', q: 'האדם עם האחרים' },
    ],
  },
];

/** The value of one comparison field for an entry. */
export function fieldValue(entry, field) {
  if (field.vector) return entry.vectors?.[field.key] ?? '';
  if (field.key === 'distinct') return distinctOf(entry);
  return entry[field.key] ?? '';
}
