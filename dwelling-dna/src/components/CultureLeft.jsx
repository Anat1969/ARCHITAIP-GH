import { forwardRef } from 'react';
import SpaceCard from './SpaceCard';
import PromptButton from './PromptButton';

const CultureLeft = forwardRef(function CultureLeft({ culture, images, onImageChange, pageNum }, ref) {
  const { id, colors, gradient, vectors, interpretation } = culture;
  const prompts = culture.prompts ?? [];
  const spaces  = culture.spaces  ?? [];

  return (
    <div
      className="page culture-left"
      data-culture={id}
      ref={ref}
      style={{
        '--c-primary': colors.primary,
        '--c-secondary': colors.secondary,
        '--c-accent': colors.accent,
        '--c-gradient': gradient,
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0.35) 100%), ${gradient}`,
        backgroundSize: '200% 100%',
        backgroundPosition: '0% 50%',
      }}
    >
      {pageNum != null && <span className="page-num page-num--left">{pageNum}</span>}
      <div className="culture-left__inner">

        {/* ── Row 1: Traditional spaces ── */}
        <div className="culture-left__section-label">פרשנות מסורתית</div>
        <div className="culture-left__cards-row">
          {spaces.map((space, idx) => (
            <SpaceCard
              key={space.id}
              cultureId={id}
              spaceId={space.id}
              label={space.label}
              caption={space.caption}
              gradient={space.gradient}
              imageUrl={images?.[space.id]}
              onImageChange={onImageChange}
              generatePrompt={prompts[idx]?.text || space.caption}
            />
          ))}
        </div>

        {/* ── DNA Vectors (below traditional row) ── */}
        <div className="culture-left__dna">
          <div className="culture-left__dna-title">DNA וקטורים</div>
          <div className="culture-left__vectors">
            {Object.entries(vectors).map(([key, val]) => {
              const labels = { material: 'חומר', light: 'אור', threshold: 'סף', proportion: 'פרופורציה', narrative: 'נרטיב' };
              return (
                <div key={key} className="culture-left__vector-row">
                  <span className="culture-left__vector-key">{labels[key]}</span>
                  <span className="culture-left__vector-val">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Row 2: Modern interpretation (images + copy buttons) ── */}
        <div className="culture-left__section-label">פרשנות מודרנית</div>
        <div className="culture-left__row">
          <div className="culture-left__cards-row">
            {prompts.map((p, idx) => {
              const modernPrompt = buildModernPrompt(culture, idx, p.text);
              return (
                <SpaceCard
                  key={`prompt_${idx}`}
                  cultureId={id}
                  spaceId={`prompt_${idx}`}
                  label={p.label}
                  caption={modernEntry(culture, idx)?.caption ?? ''}
                  gradient={gradient}
                  imageUrl={images?.[`prompt_${idx}`]}
                  onImageChange={onImageChange}
                  generatePrompt={modernPrompt}
                />
              );
            })}
          </div>
          <div className="culture-left__btns-row">
            {prompts.map((p, idx) => (
              <PromptButton
                key={`m_${p.label}`}
                label={p.label}
                text={buildModernPrompt(culture, idx, p.text)}
              />
            ))}
          </div>
        </div>

        {/* ── Architectural DNA Interpretation (below modern row) ── */}
        {interpretation && (
          <div className="culture-left__interpretation">
            <div className="culture-left__interpretation-title">פרשנות ה-DNA האדריכלי</div>
            <p className="culture-left__interpretation-text" dir="rtl">{interpretation}</p>
          </div>
        )}

      </div>
    </div>
  );
});

/**
 * The prompt for the future half of the spread.
 *
 * A culture can carry its own hand-written `modern` set — a distilled reading
 * always beats a formula. Everything else falls back to the builder below,
 * which hands the model the ancestral logic to carry forward instead of the
 * ancient prompt to restage: quoting the period description was what kept
 * returning a dressed-up reconstruction rather than a projection.
 */
function modernEntry(culture, idx) {
  return culture.modern?.[idx] ?? null;
}

function buildModernPrompt(culture, idx, ancientText = '') {
  const own = modernEntry(culture, idx);
  if (own?.text) return own.text;

  const spaceTypes = ['exterior', 'threshold', 'interior'];
  const spaceThemes = [
    'mass, enclosure, and how the building meets the ground',
    'the passage inward — compression, filtering, arrival',
    'the inhabited room — light, proportion, and what the space asks of the body',
  ];

  // English throughout: the culture's own fields are Hebrew, and Hebrew inside
  // an image prompt comes back as noise. The ancestral description carries the
  // substance instead, framed as logic to carry forward rather than to restage.
  return `Speculative architecture of the next century, ${spaceTypes[idx] || 'architectural space'}. ` +
    `Spatial focus: ${spaceThemes[idx] || spaceThemes[0]}. ` +
    `Inherited logic to distil — "${ancientText}" — keep its spatial reasoning (weight, light, sequence, proportion) ` +
    `and discard every period motif, ornament, ruin and costume. ` +
    `Rebuild it with the means of a future era: robot-fabricated local matter, earth and mass-timber composites, ` +
    `embedded climate skins, hairline joints, zero decoration. ` +
    `Not a historical reconstruction and not a museum set. ` +
    `Architectural photography, natural light, restrained palette, quiet monumental atmosphere.`;
}

export default CultureLeft;
