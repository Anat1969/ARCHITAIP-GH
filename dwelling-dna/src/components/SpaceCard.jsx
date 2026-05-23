import { useState, useRef } from 'react';
import { fal } from '@fal-ai/client';

fal.config({ credentials: import.meta.env.VITE_FAL_API_KEY });

export default function SpaceCard({ spaceId, label, caption, gradient, imageUrl, onImageChange, generatePrompt }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(imageUrl || '');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const inputRef = useRef(null);

  const handleCardClick = () => {
    if (!editing && !generating) {
      setEditing(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleApply = () => {
    onImageChange?.(spaceId, inputVal.trim());
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
    if (e.key === 'Escape') setEditing(false);
  };

  const handleGenerate = async (e) => {
    e.stopPropagation();
    if (!generatePrompt) return;
    setGenerating(true);
    setGenError(null);
    try {
      const result = await fal.subscribe('fal-ai/flux/schnell', {
        input: {
          prompt: generatePrompt,
          image_size: 'landscape_4_3',
          num_inference_steps: 4,
          num_images: 1,
        },
      });
      const url = result?.data?.images?.[0]?.url;
      if (url) {
        onImageChange?.(spaceId, url);
        setInputVal(url);
      } else {
        setGenError('לא התקבלה תמונה');
      }
    } catch (err) {
      setGenError('שגיאה ביצירה');
      console.error('FAL error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const bgStyle = imageUrl
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: gradient };

  return (
    <div className="space-card" style={bgStyle} onClick={handleCardClick}>
      <div className="space-card__overlay" />
      <div className="space-card__body">
        <span className="space-card__label">{label}</span>
        <span className="space-card__caption">{caption}</span>
      </div>

      {!editing && !generating && generatePrompt && import.meta.env.VITE_FAL_API_KEY && (
        <button
          className="space-card__gen-btn"
          onClick={handleGenerate}
          title="צור תמונה עם AI"
        >
          ✨
        </button>
      )}

      {generating && (
        <div className="space-card__generating">
          <span className="space-card__gen-spinner">⟳</span>
          <span>יוצר תמונה...</span>
        </div>
      )}

      {genError && !generating && (
        <div className="space-card__gen-error">{genError}</div>
      )}

      {editing && (
        <div
          className="space-card__editor"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            className="space-card__input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleApply}
            placeholder="URL..."
            dir="ltr"
          />
        </div>
      )}
    </div>
  );
}
