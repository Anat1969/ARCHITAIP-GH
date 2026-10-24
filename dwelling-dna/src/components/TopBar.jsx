import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Mark from './Mark';
import { useAuth } from '../store/auth';
import { useData } from '../store/data';
import { useInstallPrompt } from '../lib/install';
import { copyText } from '../lib/clipboard';

export const DEV_CHAT_URL = 'https://claude.ai/code/session_01VVH7JDffbMQREYfT2YAiLB';

/** The studio's signature: the A&I monogram over the architect's name. */
function StudioLogo() {
  return (
    <span className="studio" aria-label="אד' ענת שטיבלמן, A&I">
      <span className="studio__mono">A&amp;I</span>
      <span className="studio__name">אד' ענת שטיבלמן</span>
    </span>
  );
}

// The app name and its pages on the right; the studio logo on the left with
// every action button in one row directly beneath it.
export default function TopBar() {
  const { isAdmin, editing, setEditMode, user, signOut, openLogin } = useAuth();
  const { save } = useData();
  const { canInstall, install } = useInstallPrompt();
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);

  const copyLink = async () => {
    await copyText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const nav = (
    <>
      <NavLink to="/" end className="topbar__link">אטלס</NavLink>
      <NavLink to="/read" className="topbar__link">קריאה</NavLink>
      <NavLink to="/lab" className="topbar__link">מעבדת מיזוג</NavLink>
    </>
  );

  const actions = (
    <>
      <button type="button" className="bar-btn" onClick={copyLink}>
        {copied ? 'הקישור הועתק' : 'העתקת קישור'}
      </button>
      <a className="bar-btn" href={DEV_CHAT_URL} target="_blank" rel="noreferrer">שיחת הפיתוח</a>
      {canInstall && (
        <button type="button" className="bar-btn bar-btn--accent" onClick={install}>התקנת האפליקציה</button>
      )}
      {isAdmin && (
        <button
          type="button"
          className={`bar-btn ${editing ? 'bar-btn--on' : ''}`}
          onClick={() => setEditMode(!editing)}
          aria-pressed={editing}
        >
          {editing ? 'מצב עריכה' : 'מצב קריאה'}
        </button>
      )}
      {isAdmin || user ? (
        <button type="button" className="bar-btn bar-btn--quiet" onClick={signOut} title={user?.email}>יציאה ממצב עורכת</button>
      ) : (
        <button type="button" className="bar-btn bar-btn--quiet" onClick={() => openLogin()}>מצב עורכת</button>
      )}
    </>
  );

  return (
    <header className="topbar" dir="rtl">
      {/* Right: the app and its pages. */}
      <div className="topbar__app">
        <Link to="/" className="topbar__brand" aria-label="ארכיטייפ, לדף הבית">
          <Mark size={26} />
          <span className="topbar__name">ארכיטייפ</span>
          <span className="topbar__tag">DWELLING DNA</span>
        </Link>
        <nav className="topbar__nav" aria-label="ניווט ראשי">{nav}</nav>
      </div>

      <div className="topbar__status" aria-live="polite">
        {save.state !== 'idle' && <span className={`save save--${save.state}`}>{save.message}</span>}
      </div>

      {/* Left: the studio logo, and every action button directly beneath it. */}
      <div className="topbar__studio">
        <StudioLogo />
        <div className="topbar__actions">{actions}</div>
      </div>

      <button
        type="button"
        className="bar-btn topbar__menu-btn"
        onClick={() => setMenu((m) => !m)}
        aria-expanded={menu}
      >
        {menu ? 'סגירה' : 'תפריט'}
      </button>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="topbar__drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => { if (e.target.closest('a')) setMenu(false); }}
          >
            {nav}
            <div className="topbar__drawer-actions">{actions}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
