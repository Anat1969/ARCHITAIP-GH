import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="empty-page" dir="rtl">
      <span className="mono">404</span>
      <h1>העמוד הזה לא קיים במגזין</h1>
      <p className="muted">ייתכן שהקישור ישן, או שהתרבות או המיזוג נמחקו.</p>
      <Link to="/" className="btn btn--primary">חזרה לאטלס</Link>
    </section>
  );
}
