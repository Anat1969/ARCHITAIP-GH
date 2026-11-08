// The explainer film: eight scenes, each a frame from the magazine itself, a
// headline that carries the insight, and the narrator's line. The audio for
// each scene lives in storage (architaip-media/explainer/<id>.wav); if it
// cannot load, the film still plays on a timer with the line as subtitle.

export const EXPLAINER = [
  { id: 's1', frame: 'cover', head: 'ממה מגינים?', line: 'כל תרבות היא תשובה לשאלה אחת: ממה צריך להגן, ומה בונים כנגדו.' },
  { id: 's2', frame: 'cultures', head: '18 תרבויות, 11 קריטריונים', line: 'ארכיטייפ קורא שמונה עשרה תרבויות, ממסופוטמיה ועד העיר הלבנה, באותם אחד עשר קריטריונים.' },
  { id: 's3', frame: 'dna', head: 'מנגנון · די־אן־איי · מרחבים', line: 'שלוש רמות. המנגנון: כאוס, סדר ותפקיד. הדי־אן־איי: חומר, אור, סף, פרופורציה ונרטיב. והמרחבים שבהם זה קורה.' },
  { id: 's4', frame: 'families', head: 'איפה נמצא הכאוס?', line: 'וכשמעמידים אותן זו מול זו, מתגלה דפוס: ארבעה מקומות שבהם תרבות מאתרת את הכאוס. בטבע, בקוסמוס, באדם, ובניתוק.' },
  { id: 's5', frame: 'compare', head: 'הטבלה מגישה תובנה', line: 'הטבלה לא רק משווה. היא מגישה תובנה, והתאים שמוכיחים אותה נדלקים.' },
  { id: 's6', frame: 'lab', head: 'מהעולם אל הסביבה הקרובה', line: 'במעבדה בוחרים שתי תרבויות, מהעולם ומהסביבה הקרובה, והיסטוריון כותב את הבית שנולד מהמתח ביניהן.' },
  { id: 's7', frame: 'spaces', head: 'לזקק, לא לשחזר', line: 'החזון: לא לשחזר את העבר, אלא לזקק ממנו היגיון, ולבנות איתו את הבית של המאה הבאה.' },
  { id: 's8', frame: 'cover', head: 'כל מרחב הוא שאלה', line: 'ארכיטייפ. כל מרחב הוא שאלה, וכל תרבות היא תשובה.' },
];

export const EXPLAINER_AUDIO = (id) =>
  `https://ktqmwpbzcnzkhjskqisy.supabase.co/storage/v1/object/public/architaip-media/explainer/${id}.wav`;
