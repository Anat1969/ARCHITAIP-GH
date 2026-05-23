import { forwardRef } from 'react';

const BackCover = forwardRef(function BackCover(_props, ref) {
  return (
    <div className="page back-cover" ref={ref}>
      <div className="back-cover__bg" />
      <div className="back-cover__content">
        <div className="back-cover__title">DWELLING DNA</div>
        <p className="back-cover__body">
          כל מרחב הוא שאלה.
          <br />
          כל תרבות — תשובה שונה.
          <br />
          כל ארכיטייפ — גוף חשיבה שנבנה
          <br />
          לבנה לבנה, דור אחר דור.
        </p>
        <div className="back-cover__tagline">
          המרחב שלך מספר מי אתה.
        </div>
        <div className="back-cover__line" />
        <div className="back-cover__meta">
          ארכיטייפ — תרבות — מרחב
        </div>
      </div>
    </div>
  );
});

export default BackCover;
