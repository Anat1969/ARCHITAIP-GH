# DWELLING DNA
## מסמך 8 — Fusion Feature (עדכון)
### מיזוג ארכיטייפים — DNA היברידי

---

### עיקרון הפיצ'ר
שתיים או יותר תרבויות נכנסות — ארכיטייפ היברידי יוצא.
המערכת מחשבת DNA חדש מתוך המתח בין התרבויות שנבחרו.
כל מיזוג שומר שרשרת מקורות ברורה — תמיד ניתן לדעת מה יצר את מה.
המיזוגים חיים במגזין נפרד: FUSIONS.

---

### מבנה נתוני מיזוג — Fusion Object

```json
{
  "fusion_id": "uuid",
  "name": "Japan × Israel",
  "name_custom": "שם שנבחר ידנית (אופציונלי)",
  "source": "fusion",

  "lineage": {
    "parents": ["culture_010", "culture_006"],
    "parent_names": ["Japan", "Israel"],
    "parent_weights": [0.5, 0.5],
    "fusion_logic": "equal | weighted | dominant"
  },

  "analysis": {
    "chaos_essence": "מחושב מהמתח בין שתי הגדרות הכאוס",
    "order_essence": "מחושב מהחיתוך בין שתי הגדרות הסדר",
    "human_role": "מחושב מהמתח בין שני תפקידי האדם"
  },

  "dna_vectors": {
    "material": "שילוב מחושב מהוקטורים של ההורים",
    "light": "שילוב מחושב מהוקטורים של ההורים",
    "threshold": "שילוב מחושב מהוקטורים של ההורים",
    "proportion": "שילוב מחושב מהוקטורים של ההורים",
    "narrative": "שילוב מחושב מהוקטורים של ההורים",
    "color_palette": {
      "primary": "מחושב מפלטות ההורים",
      "secondary": "מחושב מפלטות ההורים",
      "accent": "מחושב מפלטות ההורים",
      "generated_by": "fusion_auto",
      "editable": true
    }
  },

  "chapters": {
    "private_space": { "pages": [] },
    "threshold_space": { "pages": [] },
    "communal_space": { "pages": [] }
  },

  "gallery": [],
  "created_at": "timestamp"
}
```

---

### לוגיקת חישוב ה-DNA

שלושה מצבי מיזוג שהמשתמש בוחר:

**Equal (שווה) — ברירת מחדל**
כל וקטור מחושב כדיאלוג שווה בין ההורים.
המתח ביניהם הוא ה-DNA החדש.

דוגמה — חומר: יפן (עץ הינוקי, ממוזער, מדויק) + ישראל (אבן גולמית, לא מתחנפת):
תוצאה: "חומר שמחפש דיוק אך מסרב להתחנף — עץ ואבן בדיאלוג בין שקט לאמירה"

**Weighted (משוקלל)**
המשתמש קובע כמה כוח לכל הורה (0–100%).
וקטור דומיננטי מהאב החזק יותר, עם שפה מהאב החלש.

**Dominant (דומיננטי)**
הורה אחד ראשי, השני משפיע.
DNA של ההורה הראשי עם "זיכרון" מהשני.

---

### פסאודו-קוד — מנוע המיזוג

```
function createFusion(culture_ids[], fusion_logic, weights[]):

  // שלב 1: טעינת הורים
  parents = cultures.getAll(culture_ids)

  // שלב 2: חישוב ניתוח
  fusion.analysis = {
    chaos:  synthesizeTension(parents.map(p => p.analysis.chaos)),
    order:  synthesizeIntersection(parents.map(p => p.analysis.order)),
    role:   synthesizeTension(parents.map(p => p.analysis.human_role))
  }

  // שלב 3: חישוב DNA לכל וקטור
  for each vector in DNA_VECTORS:
    fusion.dna[vector] = blendVectors(
      parents.map(p => p.dna[vector]),
      fusion_logic,
      weights
    )

  // שלב 4: חישוב פלטה
  fusion.dna.color_palette = blendPalettes(
    parents.map(p => p.dna.color_palette),
    fusion_logic
  )

  // שלב 5: שמירת שרשרת מקורות
  fusion.lineage = {
    parents: culture_ids,
    parent_names: parents.map(p => p.name),
    parent_weights: weights,
    fusion_logic: fusion_logic
  }

  // שלב 6: יצירת פרומפטים
  fusion.prompts = generatePrompts(fusion)

  // שלב 7: שמירה תחת FUSIONS
  fusions.save(fusion)
  return fusion
```

---

### עדכון מסך — Fusion Screen

**נוסף לזרימה הקיימת:**

```
CULTURES HOME
    │
    ├── [CULTURES]     ← קיים
    ├── [FUSIONS]      ← חדש
    └── [GALLERY]      ← קיים
```

**מסך FUSIONS:**
גריד של כל המיזוגים שנוצרו.
כל כרטיס מציג:
- שם המיזוג
- תמונות ממוזערות של ההורים עם חץ → ביניהן
- תמונה מייצגת של המיזוג
- כפתור "צפה בשרשרת"

**כפתור "צפה בשרשרת" — Lineage View:**
פותח modal עם עץ ויזואלי:
```
[Japan]  +  [Israel]
    ↓           ↓
      [Japan × Israel]
      DNA: equal blend
```
אם מיזוג נוצר ממיזוג אחר — העץ מתעמק:
```
[Japan]  +  [Israel]
      ↓
  [Japan × Israel]  +  [Greece]
              ↓
    [Japan × Israel × Greece]
```

---

### מסך יצירת מיזוג — Create Fusion

```
┌─────────────────────────────────────┐
│  CREATE FUSION                      │
│                                     │
│  בחר תרבויות (2 עד 4)              │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Japan │ │Israel│ │ + הוסף│        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  מצב מיזוג:                         │
│  ○ שווה  ○ משוקלל  ○ דומיננטי      │
│                                     │
│  שם מותאם אישית (אופציונלי):        │
│  [___________________________]      │
│                                     │
│  [צור מיזוג]                        │
└─────────────────────────────────────┘
```

---

### מגזין FUSIONS — עיצוב ייחודי

מגזין המיזוגים מקבל זהות ויזואלית עצמאית:
- פלטת צבעים: גרדיאנט בין פלטות ההורים
- כותרת כל עמוד: [שם הורה 1] × [שם הורה 2]
- מטא-דאטה גלוי: "DNA: equal blend of Japan + Israel"
- שרשרת מקורות מוצגת בתחתית כל עמוד

---

### כללי מפתח

- מיזוג יכול לקבל שם ידני — אחרת שמו הוא שמות ההורים מחוברים ב-×
- מיזוג יכול להיות הורה של מיזוג חדש — עומק ללא הגבלה
- כל מיזוג שמור עם lineage מלא — לא ניתן למחוק הורה ללא אזהרה
- מיזוג מופיע גם בגלריה הגלובלית, מסומן כ-FUSION

---

### עדכון מסמכים מושפעים

```
מסמך 2 — Data Architecture  → נוסף: Fusion Object
מסמך 3 — Screens & Flow     → נוסף: FUSIONS screen + Create Fusion
מסמך 4 — Prompt Engine      → תומך בקלט מסוג fusion
מסמך 6 — Design Vision      → נוסף: FUSIONS magazine visual identity
```

---

```
STATUS: APPROVED ✓
VERSION: 1.0
TYPE: FEATURE UPDATE
AFFECTS: Documents 2, 3, 4, 6
NEXT: העבר לקלוד קוד עם הוראה: "Add fusion feature per Document 8"
```
