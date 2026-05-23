# DWELLING DNA
## מסמך 2 — Data Architecture

---

### עיקרון הארגון
**תרבות = מגזין.**
כל תרבות היא ישות עצמאית. בתוכה: פרקים לפי טיפוס מרחב.
הניווט הראשי הוא תמיד לפי תרבות.

---

### מבנה היררכי

```
DWELLING DNA
└── Culture (מגזין)
    ├── metadata
    ├── dna_vectors (6)
    ├── color_palette (auto-generated)
    ├── chapters
    │   ├── private_space (מרחב פרטי)
    │   ├── threshold_space (מרחב מעבר)
    │   └── communal_space (מרחב קהילתי)
    │       └── pages[]
    │           ├── content
    │           ├── images[]
    │           └── versions[]
    └── gallery[]
```

---

### מבנה נתוני תרבות — Culture

```json
{
  "culture_id": "uuid",
  "name": "Israel",
  "name_he": "ישראל",
  "source": "library | user_added",
  "created_at": "timestamp",

  "analysis": {
    "chaos_essence": "ניתוק מהברית",
    "order_essence": "ברית ואמון",
    "human_role": "בחירה דדית"
  },

  "dna_vectors": {
    "material": "חומר גולמי שאינו מתחנף",
    "light": "אור שנכנס מלמעלה ולא מהצד",
    "threshold": "ספים שדורשים החלטה",
    "proportion": "פרופורציה של עדות לא של נוחות",
    "narrative": "נרטיב של זיכרון שמחייב",
    "color_palette": {
      "primary": "#C4A882",
      "secondary": "#2C2C2C",
      "accent": "#8B7355",
      "generated_by": "auto",
      "editable": true
    }
  },

  "chapters": {
    "private_space": { "pages": [] },
    "threshold_space": { "pages": [] },
    "communal_space": { "pages": [] }
  },

  "gallery": []
}
```

---

### מבנה נתוני עמוד — Page

```json
{
  "page_id": "uuid",
  "culture_id": "uuid",
  "chapter": "private_space | threshold_space | communal_space",
  "page_number": 1,
  "title": "כותרת העמוד",

  "content": {
    "headline": "",
    "insight": "",
    "post": "",
    "body": ""
  },

  "layout": {
    "template": "full_bleed | split | layered | typographic",
    "elements": []
  },

  "images": ["image_id"],
  "active_version": "uuid",
  "versions": []
}
```

---

### מבנה נתוני גרסה — Version

```json
{
  "version_id": "uuid",
  "page_id": "uuid",
  "name": "גרסה לקוח ראשוני",
  "created_at": "timestamp",
  "snapshot": { }
}
```

גרסאות נשמרות **ידנית בלבד**.
המשתמש בוחר מתי לשמור ומה לקרוא לגרסה.
כל גרסה שומרת snapshot מלא של העמוד — תוכן, פריסה, תמונות.

---

### מבנה נתוני תמונה — Image

```json
{
  "image_id": "uuid",
  "url": "local_or_hosted",
  "prompt": "הפרומפט המלא שיצר אותה",
  "source": "generated | uploaded | pasted",
  "linked_to": {
    "culture_id": "uuid",
    "chapter": "private_space",
    "page_id": "uuid",
    "version_name": "גרסה לקוח ראשוני"
  },
  "created_at": "timestamp",
  "tags": []
}
```

---

### שישה וקטורי DNA — הגדרות

| וקטור | תפקיד | משפיע על |
|-------|--------|----------|
| חומר | מרקם, כובד, גסות/עידון | פרומפט תמונה + עיצוב עמוד |
| אור | כיוון, עוצמה, מקור | פרומפט תמונה |
| סף | אופי המעבר בין מרחבים | פרומפט תמונה + בחירת פרק |
| פרופורציה | יחסי גובה-רוחב, קנה מידה | עיצוב עמוד + פריסה |
| נרטיב | הסיפור שהמרחב מספר | טקסט: כותרת, תובנה, פוסט |
| פלטת צבעים | שלושה צבעים ייחודיים | עיצוב מגזין + פרומפט תמונה |

---

### כללי מפתח

- כל entity מזוהה ב-UUID
- תרבות שנוספה ידנית מסומנת `source: user_added`
- פלטת צבעים נוצרת אוטומטית אך ניתנת לעריכה ידנית
- גרסאות נשמרות ידנית בלבד — אין auto-save לגרסאות
- כל תמונה מחוברת תמיד לפרומפט שיצר אותה

---

```
STATUS: APPROVED ✓
VERSION: 1.0
NEXT: מסמך 3 — Screens & Flow
```
