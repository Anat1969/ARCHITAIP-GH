# DWELLING DNA
## מסמך 7 — Image System

---

### עיקרון יסוד
כל תמונה מחוברת לפרומפט שיצר אותה — לתמיד.
גלריה היא חלק ממערכת העיצוב, לא רכיב נפרד.
כל החלטה חזותית שמורה, ניתנת לשכפול, לשינוי, לווריאציה.

---

### API ליצירת תמונות

**המלצה: Hugging Face Inference API**
- חינמי לחלוטין למודלים פתוחים
- מודל מומלץ: `stabilityai/stable-diffusion-xl-base-1.0`
- איכות מקצועית, ללא רישום מסחרי
- אינטגרציה פשוטה ב-REST API

**גיבוי: Stability AI API**
- שכבת שימוש חינמית (25 קרדיטים בהרשמה)
- איכות גבוהה יותר לפרומפטים מורכבים
- endpoint: `https://api.stability.ai/v1/generation`

**זרימת יצירה:**
```
Prompt Engine → API Call → Image URL → Auto-save to Gallery
                                     → Link to Culture + Page + Version
                                     → Display with "View/Copy Prompt" button
```

---

### מבנה נתוני תמונה — Image Object

```json
{
  "image_id": "uuid-v4",
  "filename": "dwelling_dna_IL_private_001.jpg",
  "url": "local_or_cdn_url",
  "thumbnail_url": "thumbnail_url",

  "prompt": {
    "full_text": "הפרומפט המלא באנגלית",
    "space_type": "private_space | threshold_space | communal_space",
    "generated_by": "engine_auto | user_manual"
  },

  "source": "generated | uploaded | pasted",

  "linked_to": {
    "culture_id": "culture_006",
    "culture_name": "Israel",
    "chapter": "private_space",
    "page_id": "uuid",
    "version_name": "גרסה לקוח ראשוני"
  },

  "metadata": {
    "created_at": "ISO-timestamp",
    "dimensions": { "width": 1792, "height": 1024 },
    "file_size_kb": 0,
    "tags": []
  }
}
```

---

### פעולות מערכת — Image Actions

| פעולה | תיאור | זמין ב |
|-------|--------|--------|
| Generate | יצירת תמונה מפרומפט | עורך + מנוע |
| Upload | העלאה מהמחשב | עורך + גלריה |
| Paste | הדבקה ישירה Ctrl+V | עורך |
| Add to Page | הוספת תמונה מגלריה לעמוד | גלריה + עורך |
| Replace | החלפת תמונה קיימת בעמוד | עורך |
| Delete | מחיקה מהגלריה | גלריה |
| Duplicate | שכפול תמונה עם הפרומפט שלה | גלריה |
| View Prompt | הצגת הפרומפט המלא | בכל מקום |
| Copy Prompt | העתקת פרומפט ללוח | בכל מקום |
| Save to Gallery | שמירה ידנית לגלריה המרכזית | עורך |
| Tag | תיוג לפי נושא | גלריה |

---

### כפתור "הצג / העתק פרומפט"

נוכח על כל תמונה בכל מצב: עורך, גלריה, תצוגת עמוד.

**התנהגות:**
לחיצה → modal קטן ואלגנטי נפתח
המודל מציג:
```
┌─────────────────────────────────┐
│  PROMPT                         │
│  ─────────────────────────────  │
│  [הפרומפט המלא]                 │
│                                 │
│  תרבות: ישראל                   │
│  מרחב: פרטי                     │
│  גרסה: גרסה לקוח ראשוני        │
│                                 │
│  [העתק פרומפט]  [סגור]          │
└─────────────────────────────────┘
```

---

### גלריה מרכזית — Global Gallery

**מיקום:** מסך עצמאי, נגיש מכל מקום בכלי.

**תצוגה:**
גריד אדפטיבי — 3 עמודות ברירת מחדל, ניתן לשינוי.

**כל כרטיס תמונה:**
```
┌──────────────────┐
│                  │
│    [תמונה]       │
│                  │
├──────────────────┤
│ ישראל | פרטי     │
│ גרסה לקוח א'    │
├──────────────────┤
│ [פרומפט] [הוסף]  │
│ [שכפל]  [מחק]   │
└──────────────────┘
```

**פילטור:**
- לפי תרבות
- לפי פרק (פרטי / מעבר / קהילתי)
- לפי מקור (generated / uploaded / pasted)
- לפי גרסה
- חיפוש חופשי בפרומפט

---

### אינטגרציה עם עורך העמוד

כאשר עובדים בעורך:
- פאנל ימין → Images → "בחר מגלריה" → הגלריה נפתחת כ-overlay
- בחירת תמונה → מוספת מיידית לעמוד
- גרירת תמונה מגלריה לקנבס → drop ישיר
- Ctrl+V בקנבס → הדבקת תמונה מלוח ושמירה אוטומטית לגלריה

---

### שמירה ושיוך אוטומטי

כל תמונה שנוצרת נשמרת אוטומטית עם:
- הפרומפט המלא
- שם התרבות
- הפרק
- מספר העמוד
- שם הגרסה (אם קיימת)
- חותמת זמן

כל תמונה שמועלית ידנית — מחייבת שיוך ידני לתרבות ולפרק לפני שמירה.

---

### Developer Instruction — Image System
*פרומפט ישיר לקלוד קוד*

```
Add an image generation and gallery management system.

When the system generates images for design use, save each generated
image together with its original prompt.
Add a button next to every image: "View / Copy Prompt", allowing
the user to copy the prompt and reuse it in another image generation model.

Use Hugging Face Inference API (free tier) with model:
stabilityai/stable-diffusion-xl-base-1.0
Fallback: Stability AI API free tier.

The system must support:
- generating images from prompts
- saving generated images with their prompts
- uploading images from local machine
- pasting images directly into the editor (Ctrl+V)
- adding images to a page from the gallery
- replacing existing images on a page
- deleting images from the gallery
- duplicating images with their prompts
- saving images to a central gallery
- linking each image to its prompt, culture, chapter, page and version

Create a central image gallery (full screen, accessible from anywhere)
where users can:
- view all uploaded and generated images
- filter by culture, chapter, source, version
- copy prompts
- reuse images on any page
- delete images
- add new images

The gallery must be fully integrated into the magazine editor:
- panel in editor opens gallery as overlay
- drag from gallery to canvas
- Ctrl+V paste saves to gallery automatically
- every image, prompt, page and version remains connected and editable

Show "View / Copy Prompt" button on every image in every context:
editor, gallery, page view.
Button opens a small modal with the full prompt + copy button.
```

---

```
STATUS: APPROVED ✓
VERSION: 1.0
NEXT: החבילה מוכנה להעברה לקלוד קוד
```
