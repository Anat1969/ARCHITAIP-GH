# DWELLING DNA
## מסמך 4 — Prompt Engine Logic

---

### עיקרון המנוע
המנוע לא מתאר מרחב — הוא מתרגם אמונה לתחושה חזותית.
קלט: שישה וקטורי DNA של תרבות.
פלט: שלושה פרומפטים + תובנה + פוסט.

---

### הקלט — DNA Vectors

```json
{
  "culture": "string",
  "analysis": {
    "chaos_essence": "string",
    "order_essence": "string",
    "human_role": "string"
  },
  "dna_vectors": {
    "material": "string",
    "light": "string",
    "threshold": "string",
    "proportion": "string",
    "narrative": "string",
    "color_palette": {
      "primary": "hex",
      "secondary": "hex",
      "accent": "hex"
    }
  }
}
```

---

### הפלט — Engine Output

```json
{
  "culture": "string",
  "prompts": {
    "private_space": "string",
    "threshold_space": "string",
    "communal_space": "string"
  },
  "insight": "string",
  "post": "string"
}
```

---

### נוסחת בניית הפרומפט

כל פרומפט נבנה משישה שכבות בסדר קבוע:

```
[תחושה] — [מתח/ניגוד] — [חומר] — [אור] — [פרופורציה] — [הנחיות טכניות]
```

**שכבה 1 — תחושה:**
נגזרת מהמתח בין כאוס לסדר של התרבות.
לא "חדר שקט" — אלא "שקט שנרכש במאמץ".

**שכבה 2 — מתח/ניגוד:**
כל פרומפט חייב ניגוד בין שני קצוות.
נגזר מוקטור הנרטיב + תפקיד האדם.

**שכבה 3 — חומר:**
ישירות מוקטור החומר.
מרקם, כובד, גסות/עידון — מתורגם לשפה חזותית.

**שכבה 4 — אור:**
ישירות מוקטור האור.
כיוון, עוצמה, מקור — אור הוא גיבור, לא רקע.

**שכבה 5 — פרופורציה:**
מוקטור הפרופורציה + פלטת הצבעים.
יחסי גובה-רוחב, קנה מידה, דומיננטיות הצבע הראשי.

**שכבה 6 — הנחיות טכניות (קבועות לכל פרומפט):**
```
Architectural photography, no people, no text, no frame divisions,
rule of thirds composition, golden ratio proportions,
natural textures as protagonists, light as narrative,
professional editorial quality, ultra high resolution
```

---

### שלושה טיפוסי מרחב — הגדרות

**Private Space — מרחב פרטי**
חדר שינה, חדר עבודה, פינת מחשבה.
השאלה: *כיצד התרבות מגדירה את הרגע שבו האדם לבד עם עצמו?*
וקטור דומיננטי: נרטיב + חומר.

**Threshold Space — מרחב מעבר**
כניסה, מסדרון, סף, מעבר בין חוץ לפנים.
השאלה: *כיצד התרבות מגדירה את רגע המעבר — מה הוא דורש?*
וקטור דומיננטי: סף + אור.

**Communal Space — מרחב קהילתי**
סלון, חצר, מרחב משותף, שולחן.
השאלה: *כיצד התרבות מגדירה את הרגע שבו בני אדם נפגשים?*
וקטור דומיננטי: פרופורציה + פלטת צבעים.

---

### דוגמה מלאה — ישראל

**קלט:**
```json
{
  "culture": "Israel",
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
      "accent": "#8B7355"
    }
  }
}
```

**פלט:**

```json
{
  "culture": "Israel",
  "prompts": {
    "private_space": "A room where silence carries the weight of memory —
      raw Jerusalem stone walls unpolished and unapologetic,
      vertical light descending from a single high opening
      cutting across a worn wooden surface,
      the tension between covenant and solitude made spatial,
      ochre and ash tones, proportion of witness not comfort,
      no ornament only presence,
      architectural photography, no people, no text,
      no frame divisions, rule of thirds composition,
      golden ratio proportions, natural textures as protagonists,
      light as narrative, professional editorial quality,
      ultra high resolution",

    "threshold_space": "A threshold that demands a decision before crossing —
      unfinished concrete meeting ancient stone at the entry point,
      light falling vertically from above onto the transition surface,
      the moment between outside and covenant rendered architectural,
      deep shadow on one side, ochre warmth on the other,
      no decoration only intention,
      architectural photography, no people, no text,
      no frame divisions, rule of thirds composition,
      golden ratio proportions, natural textures as protagonists,
      light as narrative, professional editorial quality,
      ultra high resolution",

    "communal_space": "A gathering place built for testimony not comfort —
      raw stone and dark iron, a table that remembers every meal,
      light entering from above onto the communal surface,
      the space between people charged with mutual obligation,
      ochre #C4A882 dominant, charcoal #2C2C2C structural,
      proportion that says we chose to be here together,
      architectural photography, no people, no text,
      no frame divisions, rule of thirds composition,
      golden ratio proportions, natural textures as protagonists,
      light as narrative, professional editorial quality,
      ultra high resolution"
  },
  "insight": "מרחב שלא מתחנף — הוא מחכה שתחליט אם אתה שייך לו.",
  "post": "Stone doesn't forgive. Neither does covenant. The room knows."
}
```

---

### לוגיקת יצירת Insight ו-Post

**Insight — משפט אחד בעברית:**
נוסחה: [מה המרחב עושה] + [מה הוא דורש מהאדם]
מקסימום 12 מילים.
תחושה מעל תיאור.

**Post — משפט אחד-שניים באנגלית:**
סגנון מגזין עילי — חד, בלתי נשכח, לא מסביר.
מקסימום 10 מילים.
יכול להיות שבור דרמטית.

---

### פסאודו-קוד — זרימת המנוע

```
function generateCultureContent(culture):

  // שלב 1: ניתוח תרבות חדשה (אם user_added)
  if culture.source == "user_added":
    analysis = analyzeCulture(culture.name)
    dna = generateDNA(analysis)
    palette = generatePalette(dna)

  // שלב 2: בניית שלושה פרומפטים
  prompts = {
    private:   buildPrompt("private",   culture.dna, culture.analysis),
    threshold: buildPrompt("threshold", culture.dna, culture.analysis),
    communal:  buildPrompt("communal",  culture.dna, culture.analysis)
  }

  // שלב 3: יצירת insight ו-post
  insight = generateInsight(culture.analysis, culture.dna.narrative)
  post    = generatePost(culture.analysis, culture.dna.narrative)

  // שלב 4: שמירה + החזרה למשתמש לאישור
  return { prompts, insight, post }


function buildPrompt(space_type, dna, analysis):
  feeling   = tensionToFeeling(analysis.chaos, analysis.order)
  contrast  = narrativeToContrast(dna.narrative, analysis.human_role)
  material  = dna.material
  light     = dna.light
  scale     = spaceScale(space_type, dna.proportion)
  color     = paletteToPrompt(dna.color_palette)
  technical = FIXED_TECHNICAL_INSTRUCTIONS

  return compose(feeling, contrast, material, light, scale, color, technical)
```

---

### הנחיות טכניות קבועות (FIXED_TECHNICAL_INSTRUCTIONS)

```
Architectural photography, no people, no text, no frame divisions,
rule of thirds composition, golden ratio proportions,
natural textures as protagonists, light as narrative,
professional editorial quality, ultra high resolution,
no CGI feel, no staged look, raw and honest
```

---

```
STATUS: APPROVED ✓
VERSION: 1.0
NEXT: מסמך 5 — Content Seed
```
