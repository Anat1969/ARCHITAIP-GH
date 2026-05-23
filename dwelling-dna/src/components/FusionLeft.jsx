import { forwardRef } from 'react';
import SpaceCard from './SpaceCard';

const FusionLeft = forwardRef(function FusionLeft({ fusion, images, onImageChange, pageNum }, ref) {
  const { id, colors, gradient, vectors, chaos, order, role, spaces } = fusion;

  return (
    <div
      className="page culture-left fusion-left"
      data-culture={id}
      ref={ref}
      style={{
        '--c-primary': colors.primary,
        '--c-secondary': colors.secondary,
        '--c-accent': colors.accent,
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0.35) 100%), ${gradient}`,
        backgroundSize: '200% 100%',
        backgroundPosition: '0% 50%',
      }}
    >
      {pageNum != null && <span className="page-num page-num--left">{pageNum}</span>}
      <div className="culture-left__inner fusion-left__inner">

        <div className="culture-left__section-label">מרחבי המיזוג</div>
        <div className="culture-left__cards-row">
          {(spaces ?? []).map((space, idx) => (
            <SpaceCard
              key={space.id}
              spaceId={space.id}
              label={space.label}
              caption={space.caption}
              gradient={space.gradient}
              imageUrl={images?.[space.id]}
              onImageChange={onImageChange}
              generatePrompt={fusion.prompts?.[idx]?.text || space.caption}
            />
          ))}
        </div>

        <div className="culture-left__dna">
          <div className="culture-left__dna-title">DNA וקטורים — מיזוג</div>
          <div className="culture-left__vectors">
            {Object.entries(vectors).map(([key, val]) => {
              const labels = {
                material: 'חומר', light: 'אור', threshold: 'סף',
                proportion: 'פרופורציה', narrative: 'נרטיב',
              };
              return (
                <div key={key} className="culture-left__vector-row">
                  <span className="culture-left__vector-key">{labels[key]}</span>
                  <span className="culture-left__vector-val">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="culture-right__triad">
          <div className="culture-right__triad-item">
            <span className="culture-right__triad-label">כאוס</span>
            <span className="culture-right__triad-val">{chaos}</span>
          </div>
          <span className="culture-right__triad-arrow">→</span>
          <div className="culture-right__triad-item">
            <span className="culture-right__triad-label">סדר</span>
            <span className="culture-right__triad-val">{order}</span>
          </div>
          <span className="culture-right__triad-arrow">→</span>
          <div className="culture-right__triad-item">
            <span className="culture-right__triad-label">תפקיד</span>
            <span className="culture-right__triad-val">{role}</span>
          </div>
        </div>

      </div>
    </div>
  );
});

export default FusionLeft;
