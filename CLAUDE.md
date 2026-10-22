# ARCHITAIP-GH

האפליקציה נמצאת ב-`dwelling-dna/`. כתובת חיה: https://architaip.vercel.app (Vercel, פרויקט `architaip`, rootDirectory `dwelling-dna`). רק מיזוג ל-main מעדכן אותה.
GitHub Pages הישן מפנה לכתובת החדשה בלבד.

## החלטות קבועות
- Supabase: הפרויקט המשותף `cultura-GH` (ktqmwpbzcnzkhjskqisy). כל הטבלאות והפונקציות בקידומת `architaip`.
- קריאה ציבורית, כתיבה רק לרשומים ב-`architaip_admins` (כרגע shtanat5@gmail.com). גם פונקציות ה-AI בודקות זאת.
- כלי ה-SQL של Supabase חוסם `drop policy` (דורש אישור ונתקע). לשנות מדיניות עם `alter policy` או ליצור חדשה.
- אין ספריית דפדוף. כל עמוד הוא כתובת, והמעבר בין עמודים הוא אנימציה של framer-motion.
- שכבות צפות (דיאלוג, הגדלה) נפתחות דרך portal מתחת לסרגל העליון. בלי portal הטרנספורם של מעבר העמוד נועל אותן לעמוד.
- יצירת תרבות או מיזוג: טיוטה לאישור, לא שמירה אוטומטית.
- עברית, RTL, בלי אייקונים. IBM Plex Sans Hebrew דק בכותרות, IBM Plex Mono לתוויות. צבעי התרבויות נשמרים.

## תמונות: כלל שלא נשבר
- בכל מקום שיש בו פרומפט יש מסגרת שמקבלת תמונה: גרירה (גם מלשונית אחרת), הדבקה ב-Ctrl+V ולחיצה לבחירת קובץ. כך גם בתצוגה המוגדלת.
- ההרשאה נמצאת מאחורי הפעולה ולא לפניה. בלי כניסה התמונה מוצגת מיד, נשמרת בדפדפן (IndexedDB) ונפתח חלון כניסה. אחרי הכניסה היא עולה לשרת לבד.
- כפתורי התמונה גלויים תמיד, לא רק במצב עריכה. רכיב חדש עם פרומפט משתמש ב-`useImageDrop` וב-`attachImage`.

## בדיקה לפני דחיפה
`npm run lint && npm run build`, ואז `npx vite preview --port 4173 &` ו-`CHROME=/opt/pw-browsers/chromium npm run test:e2e`.

## פריסה
- מיזוג ל-main לא תמיד מפעיל פריסה ב-Vercel. אחרי מיזוג לבדוק `list_deployments` עם `branch: main`, ואם אין, `create_deployment` עם `gitSource` של main ו-`target: production`.
- Google כבוי ב-Supabase המשותף. הכניסה היא קישור או קוד במייל. כפתור Google מופיע לבד כשהוא יופעל.

## מיזוג
ענת אישרה מיזוג קבוע ל-main אחרי בדיקה ירוקה.
