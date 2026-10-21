import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from './components/TopBar';
import Home from './pages/Home';
import EntryPage from './pages/EntryPage';
import Lab from './pages/Lab';
import NotFound from './pages/NotFound';
import { useData } from './store/data';

// A page turn rather than a cut: the outgoing spread tips away on the spine,
// the next one settles in. Pages are routes, so every one has its own address.
const turn = {
  initial: { opacity: 0, rotateY: -8, x: -40 },
  animate: { opacity: 1, rotateY: 0, x: 0 },
  exit: { opacity: 0, rotateY: 6, x: 30 },
};

function ReadStart() {
  const { entries } = useData();
  let last = null;
  try { last = localStorage.getItem('architaip:last'); } catch { /* private mode */ }
  const target = entries.cultures.find((c) => c.id === last) ?? entries.cultures[0];
  return <Navigate to={`/c/${target.id}`} replace />;
}

export default function App() {
  const location = useLocation();

  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);

  return (
    <div className="app">
      <TopBar />
      <main className="stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="stage__page"
            variants={turn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/read" element={<ReadStart />} />
              <Route path="/c/:id" element={<EntryPage kind="culture" />} />
              <Route path="/f/:id" element={<EntryPage kind="fusion" />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
