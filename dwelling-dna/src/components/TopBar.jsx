import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Mark from './Mark';
import LoginDialog from './LoginDialog';
import { useAuth } from '../store/auth';
import { useData } from '../store/data';
import { useInstallPrompt } from '../lib/install';
import { copyText } from '../lib/clipboard';

export const DEV_CHAT_URL = 'https://claude.ai/code/session_01VVH7JDffbMQREYfT2YAiLB';

export default function TopBar() {
  const { isAdmin, editing, setEditMode, user, signOut } = useAuth();
  const { save } = useData();
  const { canInstall, install } = useInstallPrompt();
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);
  const [login, setLogin] = useState(false);

  const copyLink = async () => {
    await copyText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

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
      {user ? (
        <button type="button" className="bar-btn bar-btn--quiet" onClick={signOut} title={user.email}>יציאה</button>
      ) : (
        <button type="button" className="bar-btn bar-btn--quiet" onClick={() => setLogin(true)}>כניסת עורכת</button>
      )}
    </>
  );

  return (
    <>
      <header className="topbar" dir="rtl">
        <Link to="/" className="topbar__brand" aria-label="ארכיטייפ, לדף הבית">
          <Mark size={30} />
          <span className="topbar__name">ארכיטייפ</span>
          <span className="topbar__tag">DWELLING DNA</span>
        </Link>

        <nav className="topbar__nav" aria-label="ניווט ראשי">
          <NavLink to="/" end className="topbar__link">אטלס</NavLink>
          <NavLink to="/read" className="topbar__link">קריאה</NavLink>
          <NavLink to="/lab" className="topbar__link">מעבדת מיזוג</NavLink>
        </nav>

        <div className="topbar__status" aria-live="polite">
          {save.state !== 'idle' && <span className={`save save--${save.state}`}>{save.message}</span>}
        </div>

        <div className="topbar__actions">{actions}</div>

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
              <NavLink to="/" end className="topbar__link">אטלס</NavLink>
              <NavLink to="/read" className="topbar__link">קריאה</NavLink>
              <NavLink to="/lab" className="topbar__link">מעבדת מיזוג</NavLink>
              <div className="topbar__drawer-actions">{actions}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AnimatePresence>{login && <LoginDialog onClose={() => setLogin(false)} />}</AnimatePresence>
    </>
  );
}
