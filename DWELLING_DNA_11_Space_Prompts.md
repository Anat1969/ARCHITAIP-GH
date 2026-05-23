# DWELLING DNA
## מסמך 11 — Space Prompts: חוץ | סף | פנים
### שתי פרשנויות × שלושה מרחבים = שישה פרומפטים לכל תרבות

---

### עיקרון
כל תרבות מקבלת שישה פרומפטים:
שלושה מרחבים (חוץ, סף, פנים) × שתי פרשנויות (מסורתית / מינימליסטית מודרנית).
הפרשנות המודרנית אינה מחקה את המסורתית — היא שואלת:
*אם האדריכל של היום הפנים את ה-DNA הזה, מה הוא היה בונה?*

---

## פרשנות א — מסורתית (Historical DNA)
### החומר, האור, הסף כפי שהתרבות עצמה יצרה אותם

---

### כפתור "חוץ" — Exterior (מסורתי)

```javascript
const buildExteriorPrompt = (culture) => `
A single exterior architectural fragment from the world of ${culture.name} —
not a monument, but a lived surface: a wall, a gate, a courtyard edge,
a place where the built world meets sky and earth.

The exterior embodies: ${culture.analysis.order_essence}.
The material speaks: ${culture.dna_vectors.material}.
The light falls: ${culture.dna_vectors.light}.
The threshold announces: ${culture.dna_vectors.threshold}.

This exterior does not perform — it declares.
The space between inside and outside is charged with: ${culture.dna_vectors.narrative}.

Color field: ${culture.color_palette.primary} as the dominant surface,
${culture.color_palette.secondary} as shadow and depth,
${culture.color_palette.accent} as the accent where light strikes material.

Composition: rule of thirds. The horizon line in the lower third.
Sky occupies the upper third — open, charged, present.
The built element anchors the center-right or center-left.

Historical materiality. Weathered. Honest.
No people. No text. No frame divisions.
No CGI. No symmetry. No staged cleanliness.
Time has touched this surface. It shows.

Architectural photography, 16:9, 2K resolution,
editorial quality — National Geographic Architecture meets El Croquis.
`;
```

---

### כפתור "סף" — Threshold (מסורתי)

```javascript
const buildThresholdPrompt_Traditional = (culture) => `
The threshold of ${culture.name} — the exact moment of crossing.
Not a door. Not a gate. The charged space between worlds.

This threshold demands: ${culture.dna_vectors.threshold}.
The human crossing it must: ${culture.analysis.human_role}.
On one side: ${culture.analysis.chaos_essence}.
On the other: ${culture.analysis.order_essence}.

Material of the crossing: ${culture.dna_vectors.material}.
Light at the threshold: ${culture.dna_vectors.light} —
falling precisely on the point of decision.

The composition is the crossing itself:
deep shadow on the chaos side.
${culture.color_palette.primary} warmth on the order side.
The threshold line is the golden ratio vertical.

This is not a welcoming entrance.
It is a question the building asks before you enter.

No people. No text. No frame divisions.
Historical materiality. Raw and intentional.
Architectural photography, 9:16 portrait (threshold is vertical),
2K resolution, editorial quality.
`;
```

---

### כפתור "פנים" — Interior (מסורתי)

```javascript
const buildInteriorPrompt_Traditional = (culture) => `
An interior space from the world of ${culture.name} —
a room that embodies ${culture.analysis.order_essence}.

The person who inhabits this space is asked to: ${culture.analysis.human_role}.
The space responds to that demand with: ${culture.dna_vectors.proportion}.

Material of the interior: ${culture.dna_vectors.material}.
Light inside: ${culture.dna_vectors.light}.
The space tells: ${culture.dna_vectors.narrative}.

Color: ${culture.color_palette.primary} on the dominant wall or floor surface.
${culture.color_palette.secondary} in the shadow zones.
${culture.color_palette.accent} where light touches a single object or surface.

Composition: the eye enters from the lower left, guided by light to the center.
Rule of thirds. One strong diagonal of light.
The room breathes — it is never cluttered.

No people. No text. No decorative objects added.
No furniture from another era. No anachronism.
Historical materiality. Time-worn. Inhabited.

Architectural photography, 4:3,
2K resolution, editorial quality — Domus, Casabella level.
`;
```

---

## פרשנות ב — מינימליסטית מודרנית (Modern Minimal DNA)
### אדריכל עכשווי שהפנים את ה-DNA ומתרגם אותו לשפה של היום

---

### כפתור "חוץ" — Exterior (מודרני)

```javascript
const buildExteriorPrompt_Modern = (culture) => `
A contemporary minimalist building exterior — designed by an architect
who deeply understands the cultural DNA of ${culture.name}
and has translated it into the architectural language of today.

The DNA that drives this design:
Chaos understood as: ${culture.analysis.chaos_essence}.
Order achieved through: ${culture.analysis.order_essence}.
The human purpose: ${culture.analysis.human_role}.

Modern translation of the material: ${culture.dna_vectors.material}
— now expressed through contemporary construction:
poured concrete, weathering steel, raw limestone slabs,
or engineered timber — but carrying the same emotional weight.

Light: ${culture.dna_vectors.light}
— now achieved through precisely placed apertures,
cantilevered overhangs, or light wells cut through mass.

The exterior is a single, powerful volume.
No decoration. No ornament. Only the logic of the DNA made visible.
The facade is a statement, not a surface.

Color: ${culture.color_palette.primary} as the primary material finish,
${culture.color_palette.secondary} as recessed or shadowed planes,
${culture.color_palette.accent} as a single material accent — a frame, an edge, a reveal.

Composition: strong geometric mass against sky.
Rule of thirds. One decisive shadow line.
The building is alone — no context, only sky and ground.

Contemporary architecture. Precision. Zero excess.
References: David Chipperfield, Peter Zumthor, Tadao Ando, Alvaro Siza.
No people. No text. No cars. No landscape furniture.
Clean sky. Hard ground. Pure building.

Architectural photography, 16:9, 2K resolution,
editorial quality — Wallpaper*, Architectural Review, Dezeen at its finest.
`;
```

---

### כפתור "סף" — Threshold (מודרני)

```javascript
const buildThresholdPrompt_Modern = (culture) => `
A contemporary minimalist threshold — the entrance sequence of a building
designed around the cultural DNA of ${culture.name}.

The threshold logic: ${culture.dna_vectors.threshold}
— now expressed in modern architectural language:
a compressed low corridor that opens to height,
a shadow zone before light,
a change in floor material that marks the crossing,
or a controlled slot of sky that announces arrival.

The crossing demands: ${culture.analysis.human_role}.
The material of transition: ${culture.dna_vectors.material}
— reinterpreted as raw concrete, polished stone, or weathered steel.

Light at the threshold: ${culture.dna_vectors.light}
— achieved through a skylight above the crossing point,
a narrow vertical slot in the wall,
or a precisely angled cut in the ceiling.

${culture.color_palette.secondary} dominant — the threshold is a dark,
compressed, intentional moment.
${culture.color_palette.primary} arrives beyond — the promise of the interior.
${culture.color_palette.accent} marks the exact crossing line.

Composition: the threshold is the vertical golden ratio.
Deep shadow foreground. Light beyond.
The eye is pulled through.

No people. No text. No decorative elements.
Contemporary precision. Minimal and loaded.
References: Zumthor's Therme Vals, Ando's Church of Light.

Architectural photography, 9:16 portrait,
2K resolution, editorial quality.
`;
```

---

### כפתור "פנים" — Interior (מודרני)

```javascript
const buildInteriorPrompt_Modern = (culture) => `
A contemporary minimalist interior — a living space designed by an architect
who has translated the cultural DNA of ${culture.name} into modern form.

The DNA at work:
The space orders itself around: ${culture.analysis.order_essence}.
It asks its inhabitant to: ${culture.analysis.human_role}.
It tells them: ${culture.dna_vectors.narrative}.

Modern material palette derived from: ${culture.dna_vectors.material}
— now expressed as polished concrete floors,
lime-washed walls, raw linen, oiled oak, or honed stone.
One material dominates. Two complement. Nothing competes.

Light: ${culture.dna_vectors.light}
— achieved through a single large aperture, a skylight,
or a light well that creates one strong directional beam.
The light is the protagonist. The room serves it.

Proportion: ${culture.dna_vectors.proportion}
— translated into ceiling height, room length-to-width ratio,
the width of reveals, the depth of recesses.
Every dimension is a decision.

Color: ${culture.color_palette.primary} as the floor or dominant wall.
${culture.color_palette.secondary} in the shadow zones and ceiling.
${culture.color_palette.accent} in one precise detail —
a recessed shelf, a structural reveal, a single object.

The room is empty except for what the DNA demands.
No styling. No decoration. No art on walls.
Only space, light, material, proportion.

References: Pawson, Chipperfield, Aires Mateus, Studio Mumbai.
No people. No text. No objects that don't belong to the space.

Architectural photography, 4:3,
2K resolution, editorial quality — Wallpaper*, Kinfolk Architecture.
`;
```

---

## מפת הכפתורים בעורך

```
┌─────────────────────────────────────────────┐
│  PAGE EDITOR — בחר סוג מרחב                │
├─────────────┬─────────────┬─────────────────┤
│    חוץ      │     סף      │     פנים        │
│  EXTERIOR   │  THRESHOLD  │   INTERIOR      │
└──────┬──────┴──────┬──────┴──────┬──────────┘
       │             │             │
  ┌────▼────┐   ┌────▼────┐   ┌───▼─────┐
  │מסורתי  │   │מסורתי  │   │מסורתי  │
  │מודרני  │   │מודרני  │   │מודרני  │
  └─────────┘   └─────────┘   └─────────┘
```

---

## טבלת פונקציות מלאה

```javascript
// שש פונקציות — שני מצבים × שלושה מרחבים
const PROMPT_BUILDERS = {
  exterior: {
    traditional: buildExteriorPrompt,
    modern:      buildExteriorPrompt_Modern
  },
  threshold: {
    traditional: buildThresholdPrompt_Traditional,
    modern:      buildThresholdPrompt_Modern
  },
  interior: {
    traditional: buildInteriorPrompt_Traditional,
    modern:      buildInteriorPrompt_Modern
  }
};

// שימוש:
const prompt = PROMPT_BUILDERS[spaceType][interpretation](culture);
const image  = await generateSpaceImage(prompt, culture);
```

---

## הנחיות טכניות קבועות — לכל הפרומפטים

```
FIXED_TECHNICAL (append to every prompt):
No people. No text rendered in image. No frame divisions.
No CGI feel. No staged look. No symmetry imposed artificially.
Natural textures as protagonists. Light as narrative.
Professional editorial quality. Ultra high resolution.
```

---

```
STATUS: APPROVED ✓
VERSION: 1.0
TYPE: PROMPT EXPANSION
SPACE TYPES: חוץ (Exterior) | סף (Threshold) | פנים (Interior)
INTERPRETATIONS: Traditional | Modern Minimalist
TOTAL PROMPTS PER CULTURE: 6
AFFECTS: Document 10 (AI Prompts), Document 03 (Screens — add mode toggle)
```
