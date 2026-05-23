import { forwardRef } from 'react';

const CoverPage = forwardRef(function CoverPage(_props, ref) {
  return (
    <div className="page cover-page" ref={ref}>
      {/* Video background */}
      <video
        className="cover-page__video"
        src={`${import.meta.env.BASE_URL}cover-video.mp4`}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Cover image overlay */}
      <div
        className="cover-page__img"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}cover.png)` }}
      />

      {/* Dark gradient overlay for text legibility */}
      <div className="cover-page__overlay" />

      {/* Content */}
      <div className="cover-page__content">
        <div className="cover-page__eyebrow">
          מגזין ארכיטקטורה תרבותית
        </div>

        <h1 className="cover-page__title">ארכיטייפ</h1>

        <p className="cover-page__dna-line">DNA של תרבות</p>

        <p className="cover-page__sub">
          11 תרבויות. 11 ארכיטייפים. מרחב אחד.
        </p>

        <div className="cover-page__hint">דפדף →</div>
      </div>
    </div>
  );
});

export default CoverPage;
