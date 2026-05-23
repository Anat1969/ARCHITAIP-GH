import { forwardRef } from 'react';
import SpaceCard from './SpaceCard';
import PromptButton from './PromptButton';

const CultureLeft = forwardRef(function CultureLeft({ culture, images, onImageChange, pageNum }, ref) {
  const { id, colors, gradient, vectors } = culture;
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

        {/* ── Row 1: Traditional spaces (images only, no copy buttons) ── */}
        <div className="culture-left__section-label">פרשנות מסורתית</div>
        <div className="culture-left__cards-row">
          {spaces.map((space, idx) => (
            <SpaceCard
              key={space.id}
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

        {/* ── Row 2: Modern interpretation (images + copy buttons) ── */}
        <div className="culture-left__section-label">פרשנות מודרנית</div>
        <div className="culture-left__row">
          <div className="culture-left__cards-row">
            {prompts.map((p, idx) => {
              const modernPrompt = buildModernPrompt(culture, p, idx);
              return (
                <SpaceCard
                  key={`prompt_${idx}`}
                  spaceId={`prompt_${idx}`}
                  label={p.label}
                  caption=""
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
                text={buildModernPrompt(culture, p, idx)}
              />
            ))}
          </div>
        </div>

        {/* ── DNA Vectors ── */}
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

      </div>
    </div>
  );
});

// Build a radical-minimalist modern reinterpretation prompt
function buildModernPrompt(culture, prompt, idx) {
  const spaceTypes = ['exterior facade', 'threshold entrance', 'interior space'];
  const archetypeMap = {
    0: 'raw materiality, weight and mass',
    1: 'liminal transition, passage and threshold',
    2: 'communal gathering, spatial hierarchy',
  };
  const vectorCore = culture.vectors
    ? Object.values(culture.vectors).slice(0, 2).join(', ')
    : '';

  return `Radical minimalist contemporary architecture, ${spaceTypes[idx] || 'architectural space'}. ` +
    `Core concept: ${culture.archetype || culture.role} — ${archetypeMap[idx] || ''}. ` +
    `Distilled essence: ${vectorCore}. ` +
    `Bare concrete, precision glass, structural steel. Zero ornament. Pure geometric abstraction. ` +
    `Tadao Ando silence, Peter Zumthor materiality, Alvaro Siza light. ` +
    `2024 architecture, architectural photography, natural light, extreme minimalism, museum quality`;
}

export default CultureLeft;
