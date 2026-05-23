# DWELLING DNA
## מסמך 10 — AI Prompts & API Integration
### כל הפרומפטים לכל כפתור + Claude API + Nano Banana API

---

### סביבת משתנים — .env

```env
ANTHROPIC_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
HEYZINE_CLIENT_ID=53c79c41b67fea2d
HEYZINE_API_KEY=70e858e6e0584a16f4a82d8b1274864c3c53c3da.53c79c41b67fea2d
```

---

## חלק א — Claude API
### לניתוח תרבויות ויצירת מיזוגים

**Model:** `claude-sonnet-4-6`
**Endpoint:** `POST https://api.anthropic.com/v1/messages`
**Header:** `x-api-key: ANTHROPIC_API_KEY`

---

### כפתור 1 — "הוסף תרבות" (ניתוח תרבות חדשה)

**Trigger:** משתמש מקליד שם תרבות ולוחץ "צור מיזוג"

```javascript
const analyzeCulture = async (cultureName) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are an expert in cultural anthropology, architectural history, and the philosophy of space.
Your task is to analyze a culture and extract its spatial DNA — the beliefs about chaos and order
that shaped how its people built and inhabited space.
Always respond in valid JSON only. No explanations outside the JSON.`,
      messages: [{
        role: 'user',
        content: `Analyze the culture: "${cultureName}"

Return a JSON object with this exact structure:
{
  "name": "${cultureName}",
  "analysis": {
    "chaos_essence": "one sentence — what chaos means in this culture",
    "order_essence": "one sentence — what order/structure means in this culture",
    "human_role": "one sentence — what the individual human is required to do"
  },
  "dna_vectors": {
    "material": "one sentence — dominant building material and its emotional quality",
    "light": "one sentence — how light enters and what it communicates",
    "threshold": "one sentence — the nature of transitions between spaces",
    "proportion": "one sentence — the logic of scale and dimension",
    "narrative": "one sentence — the story the space tells its inhabitant"
  },
  "color_palette": {
    "primary": "#hex — dominant color derived from the culture's visual tradition",
    "secondary": "#hex — structural/shadow color",
    "accent": "#hex — the color of tension or celebration"
  },
  "insight": "one sentence in Hebrew — what the space demands from the person who enters it",
  "post": "one or two sentences in English — magazine-quality, sharp, unforgettable"
}`
      }]
    })
  });
  const data = await response.json();
  return JSON.parse(data.content[0].text);
};
```

---

### כפתור 2 — "צור מיזוג" (בין שתי תרבויות ויותר)

**Trigger:** משתמש בוחר 2–4 תרבויות + מצב מיזוג + לוחץ "צור מיזוג"

```javascript
const createFusion = async (cultures, fusionMode, weights) => {
  const culturesText = cultures.map((c, i) =>
    `Culture ${i+1}: ${c.name}
    - Chaos: ${c.analysis.chaos_essence}
    - Order: ${c.analysis.order_essence}
    - Human role: ${c.analysis.human_role}
    - Material: ${c.dna_vectors.material}
    - Light: ${c.dna_vectors.light}
    - Threshold: ${c.dna_vectors.threshold}
    - Proportion: ${c.dna_vectors.proportion}
    - Narrative: ${c.dna_vectors.narrative}
    - Primary color: ${c.color_palette.primary}`
  ).join('\n\n');

  const modeInstruction = {
    equal: 'Blend all cultures with equal weight. The tension between them IS the DNA.',
    weighted: `Blend with these weights: ${cultures.map((c,i) => `${c.name}: ${weights[i]}%`).join(', ')}. Dominant culture leads, others inflect.`,
    dominant: `${cultures[0].name} is primary. Others leave traces and memories in the space.`
  }[fusionMode];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: `You are an architectural theorist who specializes in cultural hybridity.
You synthesize the spatial DNA of multiple cultures into a new, coherent archetype.
The result must feel genuinely new — not a list of features, but a living tension.
Respond in valid JSON only.`,
      messages: [{
        role: 'user',
        content: `Create a fusion archetype from these cultures:

${culturesText}

Fusion mode: ${modeInstruction}

The fusion DNA must emerge from the TENSION between the cultures —
not averaging them, but finding what happens when their beliefs about
chaos, order, and human purpose inhabit the same space.

Return this exact JSON structure:
{
  "fusion_name": "short poetic name for this hybrid archetype (e.g. 'The Covenant Garden')",
  "analysis": {
    "chaos_essence": "what chaos means in this hybrid world",
    "order_essence": "what order means — where the two cultures agree or clash",
    "human_role": "what the person who lives here is asked to be"
  },
  "dna_vectors": {
    "material": "the material language of the hybrid space",
    "light": "how light behaves in this fusion",
    "threshold": "the nature of crossing between spaces",
    "proportion": "the scale logic of the hybrid",
    "narrative": "the story this space tells"
  },
  "color_palette": {
    "primary": "#hex — synthesized from parent palettes",
    "secondary": "#hex",
    "accent": "#hex"
  },
  "insight": "one sentence in Hebrew — what the space asks of you",
  "post": "one or two sentences in English — sharp, editorial, unforgettable"
}`
      }]
    })
  });
  const data = await response.json();
  return JSON.parse(data.content[0].text);
};
```

---

### כפתור 3 — "רענן תובנה" (יצירת insight ו-post חדשים לעמוד)

```javascript
const refreshInsightAndPost = async (culture) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: `You write for a high-end architectural magazine.
Your sentences are sharp, poetic, and impossible to forget.
Hebrew insight: max 12 words. English post: max 10 words. No explanations.
Respond in JSON only.`,
      messages: [{
        role: 'user',
        content: `Culture: ${culture.name}
Chaos: ${culture.analysis.chaos_essence}
Order: ${culture.analysis.order_essence}
Narrative vector: ${culture.dna_vectors.narrative}

Generate a new insight and post. Fresh angle, unexpected tension.

Return: { "insight": "...", "post": "..." }`
      }]
    })
  });
  const data = await response.json();
  return JSON.parse(data.content[0].text);
};
```

---

## חלק ב — Nano Banana API (Google Gemini)
### ליצירת תמונות והכנסתן לתוך מסגרות המגזין

**Model מומלץ:** `gemini-3-pro-image-preview` (Nano Banana Pro)
**Model חינמי/מהיר:** `gemini-2.5-flash-image` (Nano Banana)
**Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/interactions`
**Header:** `x-goog-api-key: GEMINI_API_KEY`

---

### כפתור 4 — "צור תמונה" לכל מרחב

**Trigger:** משתמש לוחץ "צור תמונה" בעמוד — המערכת בוחרת את הפרומפט לפי הפרק (פרטי/מעבר/קהילתי)

```javascript
const generateSpaceImage = async (culture, spaceType) => {

  // בניית הפרומפט לפי DNA + טיפוס מרחב
  const spacePrompts = {
    private_space: buildPrivatePrompt(culture),
    threshold_space: buildThresholdPrompt(culture),
    communal_space: buildCommunalPrompt(culture)
  };

  const prompt = spacePrompts[spaceType];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/interactions`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemini-3-pro-image-preview',
        input: [{
          type: 'text',
          text: prompt
        }],
        config: {
          response_modalities: ['IMAGE'],
          image_generation_config: {
            resolution: '2K',
            aspect_ratio: '16:9'
          }
        }
      })
    }
  );

  const data = await response.json();
  const imageBase64 = data.output_image.data;

  return {
    image_base64: imageBase64,
    prompt: prompt,
    culture_id: culture.culture_id,
    space_type: spaceType,
    model: 'nano-banana-pro',
    created_at: new Date().toISOString()
  };
};
```

---

### בניית פרומפטים לפי DNA — שלוש פונקציות

```javascript
const FIXED_TECHNICAL =
  `Architectural photography, no people, no text in image, no frame divisions,
  rule of thirds composition, golden ratio proportions,
  natural textures as protagonists, light as narrative,
  professional editorial quality, ultra high resolution,
  no CGI feel, no staged look, raw and honest materiality.`;

const buildPrivatePrompt = (culture) => `
  A private dwelling space where ${culture.analysis.chaos_essence} meets ${culture.analysis.order_essence} —
  the room of a person whose purpose is: ${culture.analysis.human_role}.
  Material: ${culture.dna_vectors.material}.
  Light: ${culture.dna_vectors.light}.
  Proportion: ${culture.dna_vectors.proportion}.
  This space tells: ${culture.dna_vectors.narrative}.
  Color field dominated by ${culture.color_palette.primary}, with ${culture.color_palette.accent} as tension.
  ${FIXED_TECHNICAL}
`;

const buildThresholdPrompt = (culture) => `
  A threshold space — the moment of crossing — where ${culture.dna_vectors.threshold}.
  The tension: ${culture.analysis.chaos_essence} on one side, ${culture.analysis.order_essence} on the other.
  Light: ${culture.dna_vectors.light} falling precisely on the crossing point.
  Material: ${culture.dna_vectors.material} defining the boundary.
  Deep shadow in ${culture.color_palette.secondary}, warmth in ${culture.color_palette.primary}.
  ${FIXED_TECHNICAL}
`;

const buildCommunalPrompt = (culture) => `
  A communal gathering space shaped by ${culture.analysis.order_essence} —
  built for people whose role is ${culture.analysis.human_role}.
  Proportion: ${culture.dna_vectors.proportion}.
  Light: ${culture.dna_vectors.light} illuminating the shared surface.
  Material: ${culture.dna_vectors.material}.
  The space announces: ${culture.dna_vectors.narrative}.
  Color: ${culture.color_palette.primary} dominant, ${culture.color_palette.accent} structural.
  ${FIXED_TECHNICAL}
`;
```

---

### כפתור 5 — "הכנס תמונה למסגרת" (Place into Magazine Frame)

הכנסת תמונה שנוצרה לתוך מסגרת עמוד המגזין — עם Nano Banana Edit

```javascript
const placeImageIntoFrame = async (generatedImageBase64, frameType, culture) => {

  // הוראות עריכה לפי סוג המסגרת
  const frameInstructions = {
    full_bleed: `
      Adapt this architectural image to fill a full-page magazine spread.
      Keep the composition. Extend edges naturally if needed.
      The image bleeds to all edges. No borders. No white space.
      Maintain the color palette: primary ${culture.color_palette.primary}.
    `,
    split_left: `
      Crop and recompose this image for the LEFT half of a two-column magazine layout.
      Strong vertical composition. The right edge should invite the eye to cross to the text.
      Aspect ratio: portrait 3:4. Keep the strongest visual element centered.
    `,
    split_right: `
      Crop and recompose this image for the RIGHT half of a two-column magazine layout.
      The left edge should anchor the spread. Strong vertical.
      Aspect ratio: portrait 3:4.
    `,
    layered_background: `
      Make this image suitable as a full-page background behind typography.
      Darken and desaturate the lower third slightly to ensure text legibility.
      The upper portion should remain vivid and editorial.
      Do not add any text or overlays — only adjust the image itself.
    `
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/interactions`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemini-3-pro-image-preview',
        input: [
          {
            type: 'image',
            mime_type: 'image/png',
            data: generatedImageBase64
          },
          {
            type: 'text',
            text: frameInstructions[frameType]
          }
        ],
        config: {
          response_modalities: ['IMAGE'],
          image_generation_config: {
            resolution: '2K'
          }
        }
      })
    }
  );

  const data = await response.json();
  return {
    framed_image_base64: data.output_image.data,
    frame_type: frameType,
    source_image_base64: generatedImageBase64,
    culture_id: culture.culture_id
  };
};
```

---

### כפתור 6 — "וריאציה" (צור גרסה חדשה לתמונה קיימת)

```javascript
const createVariation = async (existingImageBase64, culture, spaceType, variationNote) => {
  const basePrompt = spaceType === 'private_space'
    ? buildPrivatePrompt(culture)
    : spaceType === 'threshold_space'
    ? buildThresholdPrompt(culture)
    : buildCommunalPrompt(culture);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/interactions`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemini-3-pro-image-preview',
        input: [
          {
            type: 'image',
            mime_type: 'image/png',
            data: existingImageBase64
          },
          {
            type: 'text',
            text: `Based on this reference image, create a variation with this change: ${variationNote}.
            Maintain the same cultural DNA: ${basePrompt}
            Keep the same overall atmosphere but with the requested variation.`
          }
        ],
        config: {
          response_modalities: ['IMAGE'],
          image_generation_config: { resolution: '2K' }
        }
      })
    }
  );

  const data = await response.json();
  return {
    image_base64: data.output_image.data,
    variation_note: variationNote,
    parent_image: existingImageBase64
  };
};
```

---

## חלק ג — מפת כל הכפתורים ב-UI

| כפתור | API | פונקציה | מיקום |
|-------|-----|----------|--------|
| + הוסף תרבות | Claude | `analyzeCulture()` | Cultures Home |
| צור מיזוג | Claude | `createFusion()` | Fusions Screen |
| רענן תובנה | Claude | `refreshInsightAndPost()` | Page Editor |
| צור תמונה | Nano Banana | `generateSpaceImage()` | Page Editor |
| הכנס למסגרת | Nano Banana | `placeImageIntoFrame()` | Page Editor |
| וריאציה | Nano Banana | `createVariation()` | Gallery |
| צור חוברת | Heyzine | REST API | Editor Toolbar |
| העתק פרומפט | — | copy to clipboard | כל תמונה |
| שמור גרסה | — | local save | Editor Toolbar |
| ייצא PDF | — | browser print | Editor Toolbar |

---

## חלק ד — זרימת יצירה מלאה

```
משתמש לוחץ "צור תמונה" בעמוד
          ↓
Claude API → buildPrompt(culture, spaceType)
          ↓
Nano Banana Pro → generateSpaceImage()
          ↓
תמונה מוחזרת כ-base64
          ↓
שמירה אוטומטית לגלריה עם הפרומפט
          ↓
תצוגה בעמוד + כפתור "הצג/העתק פרומפט"
          ↓
[אופציונלי] Nano Banana → placeImageIntoFrame()
          ↓
תמונה מוכנסת למסגרת הנבחרת בעמוד
          ↓
[אופציונלי] Heyzine → createFlipbook()
          ↓
URL לחוברת מוכן לשליחה ללקוח
```

---

## חלק ה — Developer Instructions

```
Implement AI integration per Document 10.

1. Claude API (model: claude-sonnet-4-6):
   - Button "הוסף תרבות" → analyzeCulture(cultureName)
   - Button "צור מיזוג" → createFusion(cultures[], mode, weights[])
   - Button "רענן תובנה" → refreshInsightAndPost(culture)
   All Claude calls return JSON. Parse and save to culture/fusion object.

2. Nano Banana API (model: gemini-3-pro-image-preview):
   - Button "צור תמונה" → generateSpaceImage(culture, spaceType)
   - Button "הכנס למסגרת" → placeImageIntoFrame(imageBase64, frameType, culture)
   - Button "וריאציה" → createVariation(imageBase64, culture, spaceType, note)
   All Nano Banana calls return base64 image.
   Always save image + prompt together to gallery.

3. Prompt builders:
   buildPrivatePrompt(culture)
   buildThresholdPrompt(culture)
   buildCommunalPrompt(culture)
   FIXED_TECHNICAL appended to every image prompt.

4. Frame types for placeImageIntoFrame:
   full_bleed | split_left | split_right | layered_background

5. Store all API keys in .env only.
   Never expose keys client-side.
   All API calls go through server-side endpoints.
```

---

```
STATUS: APPROVED ✓
VERSION: 1.0
TYPE: AI INTEGRATION
APIs: Claude (Anthropic) + Nano Banana (Google Gemini) + Heyzine
AFFECTS: All screens with AI buttons
NOTE: All API calls server-side only — keys never exposed to client
```
