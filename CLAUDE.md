# ARCHITAIP-GH

האפליקציה נמצאת ב-`dwelling-dna/`. כתובת חיה: https://architaip.vercel.app (Vercel, פרויקט `architaip`, rootDirectory `dwelling-dna`). רק מיזוג ל-main מעדכן אותה.
GitHub Pages הישן מפנה לכתובת החדשה בלבד.

## סרגל עליון
- **בצד שמאל**: כפתור הלוגו "אד' ענת שטיבלמן A&I" (`<ai-menu>`). כל כפתורי הפעולה (העתקת קישור, שיחת הפיתוח, התקנה, מצב עריכה, מצב עורכת ויציאה) נמצאים בתוכו בלבד.
- **בצד ימין**: אייקון ושם האפליקציה (קישור לדף הבית), ומתחתם הניווט בין העמודים.
- בנייד: לוגו, שם האפליקציה וכפתור "תפריט".
- לעולם לא לפתוח חלון בתגובה להדבקה, גרירה או הקלדה. שורת מצב שקטה בסרגל בלבד.
- הנוסח המעודכן של הסקיל end-to-end-builder נמצא ב-`skills/end-to-end-builder/SKILL.md`.

## החלטות קבועות
- Supabase: הפרויקט המשותף `cultura-GH` (ktqmwpbzcnzkhjskqisy). כל הטבלאות והפונקציות בקידומת `architaip`.
- קריאה ציבורית. עריכה רק לעורכת: **קישור עורכת אישי** (`#editor=...`), נפתח פעם אחת בכל מכשיר ונשמר בו. המפתח שמור בשרת רק כ-hash ב-`architaip_editor_keys`.
- כל כתיבה עוברת דרך הפונקציה `architaip-edit`, שבודקת את המפתח וכותבת עם service role. העלאות תמונה מקבלות ממנה כתובת חתומה. גם פונקציות ה-AI בודקות את המפתח.
- כלי ה-SQL של Supabase חוסם `drop policy` (דורש אישור ונתקע). לשנות מדיניות עם `alter policy` או ליצור חדשה.
- אין ספריית דפדוף. כל עמוד הוא כתובת, והמעבר בין עמודים הוא אנימציה של framer-motion.
- שכבות צפות (דיאלוג, הגדלה) נפתחות דרך portal מתחת לסרגל העליון. בלי portal הטרנספורם של מעבר העמוד נועל אותן לעמוד.
- יצירת תרבות או מיזוג: טיוטה לאישור, לא שמירה אוטומטית.
- עברית, RTL, בלי אייקונים. IBM Plex Sans Hebrew דק בכותרות, IBM Plex Mono לתוויות. צבעי התרבויות נשמרים.

## תמונות: כלל שלא נשבר
- בכל מקום שיש בו פרומפט יש מסגרת שמקבלת תמונה: גרירה (גם מלשונית אחרת), הדבקה ב-Ctrl+V ולחיצה לבחירת קובץ. כך גם בתצוגה המוגדלת.
- ההרשאה נמצאת מאחורי הפעולה ולא לפניה. בלי כניסה התמונה מוצגת מיד, נשמרת בדפדפן (IndexedDB) ונפתח חלון כניסה. אחרי הכניסה היא עולה לשרת לבד.
- כפתורי התמונה גלויים תמיד, לא רק במצב עריכה. רכיב חדש עם פרומפט משתמש ב-`useImageDrop` וב-`attachImage`.

## PDF
- ההדפסה היא רכיב נפרד, `PrintSheet`: דף A4 אחד במידות מ"מ, תמונות כ-`<img>` (רקעים לא מודפסים), כל טקסט חתוך במספר שורות. שורות התמונות ממלאות את מה שנשאר.
- לא להדפיס את עמוד המסך. כל שדה חדש בעמוד נכנס ל-`PrintSheet` עם תקרת גובה. הבדיקה מוודאת עמוד אחד לכל תרבות.

## בדיקה לפני דחיפה
`npm run lint && npm run build`, ואז `npx vite preview --port 4173 &` ו-`CHROME=/opt/pw-browsers/chromium npm run test:e2e`.

## פריסה
- מיזוג ל-main לא תמיד מפעיל פריסה ב-Vercel. אחרי מיזוג לבדוק `list_deployments` עם `branch: main`, ואם אין, `create_deployment` עם `gitSource` של main ו-`target: production`.
- **לא להשתמש בכניסה במייל.** ה-Site URL של Supabase המשותף שייך לאפליקציה אחרת (localhost:3000), וקישור המייל חוזר לשם. אין לנו גישה להגדרות ה-Auth.
- Google כבוי. כפתור Google מופיע לבד כשהוא יופעל.
- לפני שינוי במנגנון הכניסה: לשאול את ענת. זו החלטת אבטחה.

## מיזוג
ענת אישרה מיזוג קבוע ל-main אחרי בדיקה ירוקה.

## A&I logo button
The top bar holds only the app name (links home), content navigation, and ONE logo button "אד' ענת שטיבלמן A&I" (`<ai-menu>` from https://appofapp-gh.vercel.app/ai-menu.js). Every editing and development action (העתקת קישור, שיחת הפיתוח, פרויקט המחקר, התקנת האפליקציה, edit mode, add, delete) lives only inside it, never as loose buttons. Standard: https://github.com/Anat1969/AppOfApp-GH/blob/main/docs/ai-menu-standard.md
