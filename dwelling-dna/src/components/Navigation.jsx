export default function Navigation({ onPrev, onNext, onGoTo, currentPage, totalPages }) {
  const isCover = currentPage === 0;
  const isBack  = currentPage >= totalPages - 1;

  return (
    <nav className="navigation" dir="rtl">
      <div className="navigation__center-group">
        <button
          className="navigation__arrow"
          onClick={onNext}
          disabled={isBack}
          aria-label="עמוד הבא"
        >→</button>

        <button
          className="navigation__home"
          onClick={() => onGoTo(0)}
          aria-label="כריכה"
        >בית</button>

        <button
          className="navigation__home"
          onClick={() => onGoTo(1)}
          aria-label="מקרא"
        >מקרא</button>

        <button
          className="navigation__arrow"
          onClick={onPrev}
          disabled={isCover}
          aria-label="עמוד קודם"
        >←</button>
      </div>

      <span className="navigation__pages">{currentPage + 1} / {totalPages}</span>
    </nav>
  );
}
