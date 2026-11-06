import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Mark from './Mark';
import { useAuth } from '../store/auth';
import { useData } from '../store/data';

export const DEV_CHAT_URL = 'https://claude.ai/code/session_01VVH7JDffbMQREYfT2YAiLB';

// The app name and its pages on the right; on the left the A&I logo button
// (<ai-menu> from https://appofapp-gh.vercel.app/ai-menu.js). Copy link, dev chat
// and install come from it; edit mode and editor access are its items.
export default function TopBar() {
  const { isAdmin, editing, setEditMode, user, signOut, openLogin } = useAuth();
  const { save, entries } = useData();
  const navigate = useNavigate();
  const waiting = entries.fusions.filter((f) => f.approved === false).length;
  const [menu, setMenu] = useState(false);
  const aiMenu = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const el = aiMenu.current;
    if (!el) return;
    el.items = [
      ...(isAdmin
        ? [
          { label: editing ? 'מצב עריכה' : 'מצב קריאה', hint: editing ? 'למצב קריאה' : 'למצב עריכה', pressed: editing, onSelect: () => setEditMode(!editing) },
          { label: waiting ? `ממתינים לאישור (${waiting})` : 'ממתינים לאישור', hint: 'מיזוגים של קוראים', onSelect: () => navigate('/pending') },
        ]
        : []),
      isAdmin || user
        ? { label: 'יציאה ממצב עורכת', hint: user?.email, onSelect: signOut }
        : { label: 'מצב עורכת', onSelect: () => openLogin() },
    ];
    el.status = isAdmin ? (editing ? 'מצב עריכה' : 'מצב קריאה') : '';
  }, [isAdmin, editing, setEditMode, user, signOut, openLogin, waiting, navigate]);

  const nav = (
    <>
      <NavLink to="/dna" className="topbar__link"><span className="topbar__n">01</span>מהי תרבות</NavLink>
      <NavLink to="/compare" className="topbar__link"><span className="topbar__n">02</span>השוואה</NavLink>
      <NavLink to="/cultures" className={({ isActive }) => `topbar__link ${isActive || /^\/[cf]\//.test(pathname) ? 'active' : ''}`}><span className="topbar__n">03</span>תרבויות</NavLink>
      <NavLink to="/lab" className="topbar__link"><span className="topbar__n">04</span>מעבדת מיזוג</NavLink>
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

      {/* Left: the A&I logo button. */}
      <div className="topbar__studio">
        <ai-menu ref={aiMenu} chat={DEV_CHAT_URL} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
