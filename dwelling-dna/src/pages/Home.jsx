import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../store/data';
import { pad2 } from '../lib/dna';

const BASE = import.meta.env.BASE_URL;

// The gate: one screen, one sentence, and the four rooms of the magazine in
// the order they are meant to be read.
const DOORS = [
  { n: '01', to: '/dna', title: 'מהי תרבות', sub: 'השאלה, שלוש הרמות וארבע המשפחות' },
  { n: '02', to: '/compare', title: 'השוואה', sub: 'כל התרבויות על אותם קריטריונים' },
  { n: '03', to: '/cultures', title: 'תרבויות', sub: 'עמוד לכל תרבות: DNA ומרחבים' },
  { n: '04', to: '/lab', title: 'מעבדת מיזוג', sub: 'שתי תשובות, בית אחד' },
];

export default function Home() {
  const { entries, status } = useData();

  useEffect(() => { document.title = 'ארכיטייפ | DWELLING DNA'; }, []);

  return (
    <div className="home" dir="rtl">
      <section className="cover">
        <video className="cover__video" src={`${BASE}cover-video.mp4`} autoPlay muted loop playsInline poster={`${BASE}cover.png`} />
        <div className="cover__veil" />
        <div className="cover__inner">
          <motion.div className="mono cover__eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            מגזין ארכיטקטורה תרבותית / DWELLING DNA
          </motion.div>
          <motion.h1
            className="cover__title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          >
            ארכיטייפ
          </motion.h1>
          <motion.p className="cover__lede" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}>
            כל תרבות היא תשובה לשאלה אחת: ממה צריך להגן, ומה בונים כנגדו.
            המגזין קורא <b>{entries.cultures.length}</b> תרבויות באותם קריטריונים, ומקרין אותן אל הבית של המאה הבאה.
          </motion.p>
          <nav className="doors" aria-label="פרקי המגזין">
            {DOORS.map((d, i) => (
              <motion.div key={d.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
                <Link to={d.to} className={`door ${i === 0 ? 'door--first' : ''}`}>
                  <span className="mono door__n">{d.n}</span>
                  <span className="door__title">{d.title}</span>
                  <span className="door__sub">{d.sub}</span>
                </Link>
              </motion.div>
            ))}
          </nav>
          <dl className="cover__stats mono">
            <div><dt>CULTURES</dt><dd>{pad2(entries.cultures.length)}</dd></div>
            <div><dt>FAMILIES</dt><dd>04</dd></div>
            <div><dt>CRITERIA</dt><dd>11</dd></div>
            <div><dt>FUSIONS</dt><dd>{pad2(entries.fusions.length)}</dd></div>
          </dl>
        </div>
      </section>

      {status === 'offline' && (
        <p className="notice notice--error home__offline">השרת לא זמין כרגע. המגזין מוצג מהתוכן המובנה, ושינויים לא יישמרו.</p>
      )}
    </div>
  );
}
