export const cultures = [
  {
    id: 'mesopotamia',
    index: 1,
    name: 'מסופוטמיה',
    archetype: 'שמירה על הסדר',
    chaos: 'כוח עיוור',
    order: 'כיבוש יומיומי',
    role: 'שמירה',
    colors: { primary: '#C19A6B', secondary: '#4A3728', accent: '#D4A843' },
    gradient: 'linear-gradient(145deg, #C19A6B 0%, #6B4A2A 40%, #4A3728 70%, #2A1F14 100%)',
    vectors: {
      material: 'לבנת בוץ כבדה, גסה, לא מלוטשת — חומר שנלקח מהאדמה ויחזור אליה',
      light: 'אור אופקי וכבד, שמש מדברית שמשטחת צל, בלי חסד',
      threshold: 'שערים מסיביים כהגנה — הסף הוא חומה, לא הזמנה',
      proportion: 'נמוך ורחב, צמוד לאדמה, כובד גרביטציוני מכוון',
      narrative: 'כל מבנה הוא עדות לניצחון זמני על הכאוס — לא חגיגה, אלא הכרזה',
    },
    insight: '"המרחב אינו מגן — הוא מכריז. אני עומד. הסדר מחזיק."',
    paragraph: 'מסופוטמיה לימדה את האנושות שהבית הוא מלחמה. כל לבנת בוץ שהונחה בין נהרות פרת וחידקל היתה מעשה של מרד מכוון כנגד הכאוס של שיטפון, של סערה, של מה שהיה לפני שהאדם קם ובנה. המרחב הסומרי לא מזמין — הוא מגן. לא שואל — הוא קובע. הפרופורציה שלו נמוכה, צמודה לאדמה, כאילו מי שבנה ידע שהמגדל יתמוטט והחמר יישאר.',
    post: 'לבנת בוץ אחת. יום אחד. הכאוס נדחה בעוד יממה.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'תא הפנים — הכבד שמחזיק את הקיום',
        gradient: 'linear-gradient(160deg, #8B6914 0%, #4A3728 50%, #2A1F14 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'שער העיר — ההכרזה לפני הכניסה',
        gradient: 'linear-gradient(160deg, #C19A6B 0%, #8B6914 50%, #4A3728 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'חצר הזיגורט — מקום ניצחון קהילתי על הכאוס',
        gradient: 'linear-gradient(160deg, #D4A843 0%, #C19A6B 40%, #4A3728 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Ancient Mesopotamian ziggurat at golden hour, massive mud-brick stepped pyramid rising from flat alluvial plain, heavy horizontal shadows, desert dust haze, no vegetation, raw earth tones of ochre and sienna, architectural photography, wide angle, dramatic sky with storm clouds approaching, 8k resolution',
      },
      {
        label: 'סף',
        text: 'Monumental stone gate of ancient Babylon, Ishtar Gate proportions, towering defensive walls of baked brick, geometric patterns, deep shadow on threshold, torchlight inside darkness, human figure dwarfed by scale, ancient Near East architectural photography, dramatic chiaroscuro',
      },
      {
        label: 'פנים',
        text: 'Interior of ancient Sumerian mud-brick throne room, low ceiling pressing down, massive thick walls, single shaft of harsh light from high opening, packed earth floor, no decoration only weight and mass, oppressive atmosphere of order imposed, cinematic photography',
      },
    ],
  },

  {
    id: 'egypt',
    index: 2,
    name: 'מצרים',
    archetype: 'הוכחת הקיום',
    chaos: 'חוסר משקל קוסמי',
    order: 'שקילת הלב',
    role: 'הוכחה',
    colors: { primary: '#D4AF37', secondary: '#1C1C1C', accent: '#C4863A' },
    gradient: 'linear-gradient(145deg, #D4AF37 0%, #8B6914 30%, #3A2A10 65%, #1C1C1C 100%)',
    vectors: {
      material: 'אבן נצחית, חלקה, מדויקת — חומר שמסרב לחלוף',
      light: 'אור שמגיע בזווית מחושבת, יוצר צל מדויק — כל פתח הוא כוונה',
      threshold: 'פרופילאקס — מעבר טקסי שמחייב הכנה ולא רק הגעה',
      proportion: 'מונומנטלי מכוון — הגוף האנושי מדגיש את זעירותו',
      narrative: 'המרחב מזכיר לכל מי שנכנס: אתה זמני, האבן נצחית',
    },
    insight: '"אתה חולף. האבן נשארת. חי את חייך בהתאם."',
    paragraph: 'האדריכלות המצרית היא מסמך נצחיות. כל אבן שהונחה על גבי אבן בנתה טיעון: החיים קצרים, הבנייה תישאר. הזמן לא נמדד בשנים אלא בשושלות, לא בבני אדם אלא בפרעונים. המרחב המצרי אינו מנחם — הוא מחייב. הוא שואל כל מי שעובר בשעריו: האם חייך שקולים לנוצת מאת? האם עמדת במבחן הנצח? הפרופורציה הענקית אינה גאווה — היא אמת מידה קוסמית שמול אדם ביום דין.',
    post: 'האבן זוכרת. הגוף שוכח. בנה בהתאם.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'חדר הקבורה — המרחב הפרטי האמיתי',
        gradient: 'linear-gradient(160deg, #1C1C1C 0%, #3A2A10 50%, #D4AF37 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'פילון הכניסה — שער בין עולמות',
        gradient: 'linear-gradient(160deg, #D4AF37 0%, #8B6914 50%, #1C1C1C 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'היכל העמודים — המקום שבו קנה המידה שולט',
        gradient: 'linear-gradient(160deg, #C4863A 0%, #D4AF37 30%, #3A2A10 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Egyptian temple exterior at dawn, massive stone pylons casting diagonal geometric shadows, hypostyle hall columns visible through entrance, warm gold limestone in raking light, hieroglyphic reliefs carved deep into stone, small human figures showing monumental scale, Luxor Temple aesthetic, architectural photography 8k',
      },
      {
        label: 'סף',
        text: 'Ancient Egyptian ceremonial threshold, massive stone doorway with cartouche carvings, dramatic contrast between blinding exterior sunlight and dark interior, figure in white linen at threshold moment of crossing, deep shadows inside, gold accents on carved reliefs, symbolic architectural photography',
      },
      {
        label: 'פנים',
        text: 'Interior of Egyptian hypostyle hall, forest of massive stone columns with papyrus capitals, shafts of calculated light from clerestory windows cutting through incense smoke, painted hieroglyphs on every surface, compressed human scale against monumental architecture, cinematic wide angle',
      },
    ],
  },

  {
    id: 'india',
    index: 3,
    name: 'הודו הוודאית',
    archetype: 'ביצוע הדהרמה',
    chaos: 'אי-תפקוד דהרמי',
    order: 'קשר קוסמי חובה',
    role: 'ביצוע',
    colors: { primary: '#FF6B35', secondary: '#2D1B00', accent: '#FFD700' },
    gradient: 'linear-gradient(145deg, #FF6B35 0%, #CC4400 30%, #7A2200 65%, #2D1B00 100%)',
    vectors: {
      material: 'עץ מגולף, אבן חיה, חומר שמכיל אלוהות — כל משטח הוא מקדש',
      light: 'אור פילטרי דרך גילופים, נקודות אור בתוך חשכה — קדושה מתגלה בפיר',
      threshold: 'מנדפה — טרם הכניסה יש מרחב הכנה, לא ניתן להיכנס ישירות',
      proportion: 'רב-שכבתי ואנכי, צמיחה כלפי מעלה כמו מנטרה חזותית',
      narrative: 'המרחב הוא קוסמוגרמה — תרשים של הסדר האלוהי מתורגם לאדריכלות',
    },
    insight: '"המרחב לא מכיל אלוהות — הוא מיצגה. כל עמוד הוא ריקוד קפוא."',
    paragraph: 'המקדש ההינדי אינו מקום שבו נמצא האל — הוא האל. הגוף האדריכלי של הגופורם עולה כלפי מעלה בריבוי צורות ודמויות כמו מנטרה מוצקת, ומה שנראה כאוס בסגנון הוא בעצם קריאה מדויקת של מבנה הקוסמוס. הכניסה אל הגרבהגריה — רחם המקדש — היא חזרה אל מקור הקיום. האור כמעט נעדר. החשיכה היא הנוכחות האלוהית. מי שמחפש מזבח ומנורה יפספס: כאן, המרחב עצמו הוא הטקס.',
    post: 'כל צעד פנימה — צעד אחד עמוק יותר לתוך הקוסמוס.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'גרבהגריה — רחם האלוהות, חושך מוחלט ונוכחות',
        gradient: 'linear-gradient(160deg, #2D1B00 0%, #5C2800 50%, #FF6B35 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'מנדפה — האולם שמכין את המאמין',
        gradient: 'linear-gradient(160deg, #FF6B35 0%, #CC4400 50%, #2D1B00 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'חצר המקדש — קהילה של גופים וקדושה',
        gradient: 'linear-gradient(160deg, #FFD700 0%, #FF6B35 40%, #2D1B00 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Hindu temple gopuram tower rising dramatically, intricate stone carvings of deities covering every surface, warm ochre and burnt orange sandstone, tropical vegetation at base, monsoon light from behind storm clouds, sacred geometry ascending into sky, Dravidian architectural style, architectural photography 8k',
      },
      {
        label: 'סף',
        text: 'Mandapa entrance hall of Hindu temple, carved stone columns with mythological figures, filtered light through ornate lattice stone screens creating patterns on floor, incense smoke curling, devotee silhouette at threshold, warm amber light, sacred atmosphere, architectural photography',
      },
      {
        label: 'פנים',
        text: 'Garbhagriha inner sanctum of Hindu temple, near total darkness with single oil lamp flame illuminating deity sculpture, rough stone walls, ancient atmosphere, votive offerings, sacred intimate space, low ceiling, smell of flowers and camphor implied, cinematic photography with dramatic contrast',
      },
    ],
  },

  {
    id: 'china',
    index: 4,
    name: 'סין הקדומה',
    archetype: 'שיקוף קוסמי',
    chaos: 'חוסר הרמוניה שמיים-ארץ',
    order: 'שמיים כמדד',
    role: 'שיקוף',
    colors: { primary: '#C41E3A', secondary: '#1A1A2E', accent: '#DAA520' },
    gradient: 'linear-gradient(145deg, #8B0000 0%, #5C0A0A 30%, #2A1A2E 65%, #1A1A2E 100%)',
    vectors: {
      material: 'עץ, אבן ירוקה, חרסינה — חומרים שמתנהגים לפי טבעם המדויק',
      light: 'אור שמגיע דרך חצר פנימית, שמיים כמקור יחיד — הארץ מקבלת',
      threshold: 'שער עגול — סף שמסמן מעבר בין עולמות, לא בין חדרים',
      proportion: 'סימטריה מדויקת, ציר מרכזי חזק — כל אלמנט יודע את מקומו',
      narrative: 'המרחב ממשיך את הדאו — הוא לא נלחם בטבע, הוא ממשיך אותו',
    },
    insight: '"הבית הוא שאלה שיש לה תשובה. הציר מדבר. כי השמיים מקשיבים."',
    paragraph: 'הארכיטקטורה הסינית הקלאסית נבנתה מתוך ידיעה אחת: השמיים והאדמה מדברים, ועל הבית להיות המתורגמן. הציר המרכזי של האוסף האדריכלי — מדרומה צפונה, פתוח לשמיים — אינו עיצוב אלא תיאולוגיה. החצר הפנימית היא לא "גינה" — היא הנשמה של המבנה, הנשימה שמאפשרת לשמיים לגעת בארץ. הפרופורציה הסינית מחייבת: כל אלמנט יודע את מקומו ביחס לאחרים, כמו בקונפוציוס — יחס הוא הכל.',
    post: 'כאשר הבית בסדר, השמיים יכולים לדבר אל הארץ.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'חדר הלמדן — שתיקה ויחסים',
        gradient: 'linear-gradient(160deg, #1A1A2E 0%, #2A1A2E 50%, #8B0000 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'שער הירח — הסף בין עולמות',
        gradient: 'linear-gradient(160deg, #DAA520 0%, #8B0000 50%, #1A1A2E 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'החצר הפנימית — השמיים כתקרה משותפת',
        gradient: 'linear-gradient(160deg, #8B0000 0%, #DAA520 30%, #1A1A2E 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Traditional Chinese imperial courtyard complex, Forbidden City aesthetic, perfect bilateral symmetry on central axis, curved upturned roof tiles of terracotta, vermillion red columns, misty morning light, pebble courtyard with no people, profound stillness, architectural photography 8k',
      },
      {
        label: 'סף',
        text: 'Circular moon gate in Chinese garden wall, perfectly round stone opening framing a composition of bamboo and scholar rocks beyond, white plaster wall, moss on stone, contemplative garden architecture, Suzhou garden aesthetic, soft diffused light, architectural photography',
      },
      {
        label: 'פנים',
        text: 'Chinese literati pavilion interior, wooden lattice screens filtering soft light, scholar rocks in tokonoma-like alcove, calligraphy hanging scrolls, low lacquered furniture, pine and plum blossom view through window, ink painting atmosphere, intimate intellectual space, architectural photography',
      },
    ],
  },

  {
    id: 'maya',
    index: 5,
    name: 'מאיה',
    archetype: 'תשלום החוב הקוסמי',
    chaos: 'חוב דם שלא שולם',
    order: 'עסקת קיום',
    role: 'תשלום',
    colors: { primary: '#4A7C2F', secondary: '#6B1A1A', accent: '#C4A35A' },
    gradient: 'linear-gradient(145deg, #2D5016 0%, #1A3A0A 35%, #5C1515 65%, #3A0A0A 100%)',
    vectors: {
      material: 'אבן גיר מסותתת, ג\'ונגל שחודר פנימה — הטבע לא נדחה, הוא שותף',
      light: 'אור שנופל בדיוק אסטרונומי — בימים מסוימים השמש מדברת ישירות',
      threshold: 'מדרגות תלולות מכוונות — הסף הוא מאמץ גופני, טיפוס הוא תשלום',
      proportion: 'פירמידלי, אנכי מתכנס — הפרופורציות מכוונות לנקודה בשמיים',
      narrative: 'המרחב הוא שעון ולוח שנה — הוא מודד זמן ומחייב טקס',
    },
    insight: '"כל מדרגה שעלית — יום חיים ששולם. הגוף הוא מטבע הקיום."',
    paragraph: 'הפירמידה המאיאנית אינה קבר — היא שעון. כל שכבה מונה מחזור, כל פתח מכוון לאירוע אסטרונומי, כל מדרגה דורשת מחיר פיזי. מי שלא הבין זאת חשב שהמאיה בנו לתפארת; בפועל, הם בנו חוב. האל נתן שמש, גשם, תירס — והאדם חייב בחזרה. הארכיטקטורה היא שטר חוב מגולף באבן גיר, ומי שעולה במדרגות מחזיר אותו צעד אחר צעד. המרחב הוא טיעון: הקיום אפשרי רק כיוון שיש מי ששילם.',
    post: 'הג\'ונגל יחזור. לפני שיחזור — הטקס.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'חדר הכוהן — המרחב שבין חוב לתשלום',
        gradient: 'linear-gradient(160deg, #3A0A0A 0%, #5C1515 50%, #4A7C2F 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'מדרגות הפירמידה — כל צעד הוא טקס',
        gradient: 'linear-gradient(160deg, #C4A35A 0%, #4A7C2F 40%, #3A0A0A 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'מגרש הכדור — המשחק שיש בו מות',
        gradient: 'linear-gradient(160deg, #4A7C2F 0%, #2D5016 50%, #5C1515 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Mayan stepped pyramid emerging dramatically from dense jungle, Chichen Itza or Tikal aesthetic, steep stone stairs ascending to sky altar, morning mist in jungle canopy, precise astronomical alignment visible, carved serpent balustrades, deep green jungle framing grey limestone, architectural photography 8k',
      },
      {
        label: 'סף',
        text: 'Top of Mayan pyramid looking down steep staircase, jaguar throne at summit, sacrifice altar, view over jungle canopy to horizon, dramatic sky, corbeled arch temple entrance, carved glyphs around doorway, liminal between earth and sky, sacred architecture photography',
      },
      {
        label: 'פנים',
        text: 'Mayan ball court interior, long narrow stone playing field, vertical stone ring embedded in wall, corbeled stone walls, carved relief panels of players and sacrifice, jungle light filtering over walls, ancient athletic sacred space, architectural photography',
      },
    ],
  },

  {
    id: 'israel',
    index: 6,
    name: 'ישראל הקדומה',
    archetype: 'ברית ואמון',
    chaos: 'ניתוק מהברית',
    order: 'בחירה הדדית',
    role: 'עדות',
    colors: { primary: '#C4A882', secondary: '#2C2C2C', accent: '#A07840' },
    gradient: 'linear-gradient(145deg, #C4A882 0%, #8B7355 35%, #4A3A28 65%, #2C2C2C 100%)',
    vectors: {
      material: 'אבן ירושלמית גולמית, עץ זית מיושן — חומר שנושא זיכרון',
      light: 'אור שנכנס מלמעלה ולא מהצד — אור כמחייב, לא כמנחם',
      threshold: 'ספים שדורשים החלטה — לא ניתן לחצות בשוגג',
      proportion: 'פרופורציה של עדות לא של נוחות — המרחב לא מפנק',
      narrative: 'המרחב שואל: מה אתה חייב לזכור?',
    },
    insight: '"כאן לא בנו כדי להתפאר. בנו כדי לזכור. זיכרון הוא ברית."',
    paragraph: 'הבית הישראלי הקדום — ארבעת החדרים, האבן הגולמית, הספ שדורש עצירה — אינו בנייה של עושר או שלטון. הוא בנייה של זיכרון. כל אבן ירושלמית שהונחה נבחרה מהשדה, נותרה גולמית, כי הגימור יתמוטט — הזיכרון לא. האור הנכנס מלמעלה לא מנחם, הוא דורש: ראה. שים לב. אתה חלק ממשהו שקדם לך ויבוא אחריך. המרחב הישראלי הקדום הוא מדיום ברית — הוא לא מספר סיפור, הוא מצריך עד.',
    post: 'הכניסה דרכו — ולא ניתן לשכוח מה אתה חייב לזכור.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'חדר המשפחה — זיכרון שמחייב נוכחות',
        gradient: 'linear-gradient(160deg, #2C2C2C 0%, #4A3A28 50%, #C4A882 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'הסף שדורש החלטה — לא בית ולא רחוב',
        gradient: 'linear-gradient(160deg, #C4A882 0%, #8B7355 50%, #2C2C2C 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'שער העיר — מקום שיפוט ועדות ציבורית',
        gradient: 'linear-gradient(160deg, #A07840 0%, #C4A882 30%, #2C2C2C 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Ancient Israelite four-room house exterior, rough Jerusalem limestone blocks, narrow stone-paved street, direct harsh vertical light from above, no ornament, olive tree courtyard, Iron Age settlement aesthetic, ochre and grey stone tones, architectural photography 8k',
      },
      {
        label: 'סף',
        text: 'Ancient city gate of biblical Israel, massive stone pillars flanking narrow threshold, elders seated in stone niches of gate complex, figure pausing at threshold deciding whether to enter, vertical shaft of light marking threshold, serious atmospheric photography',
      },
      {
        label: 'פנים',
        text: 'Interior of ancient Israelite pillar house, hewn stone pillars dividing space, packed earth floor, single oil lamp in niche, rough limestone walls, intimate human scale, shaft of vertical light from above, bread on stone surface, documentary architectural photography',
      },
    ],
  },

  {
    id: 'persia',
    index: 7,
    name: 'פרס זורואסטרית',
    archetype: 'בחירה קוסמית',
    chaos: 'רוע פעיל',
    order: 'מלחמה מוסרית',
    role: 'בחירה',
    colors: { primary: '#1B5FAA', secondary: '#8B0000', accent: '#C5A028' },
    gradient: 'linear-gradient(145deg, #1B4D8E 0%, #0D3060 35%, #6B0000 65%, #3A0000 100%)',
    vectors: {
      material: 'שיש מלוטש, פסיפס צבעוני — יופי כנשק נגד החושך',
      light: 'אור שמנצח חושך — הבדל מכוון בין מרחבים מוארים לחשוכים',
      threshold: 'פרופילאון מרשים — הכניסה מכריזה על ניצחון לפני שנכנסים',
      proportion: 'אימפריאלי ומרהיב — קנה המידה אומר: הטוב שולט כאן',
      narrative: 'אתה בתוך הטוב, בחוץ שורר הרוע',
    },
    insight: '"כאן, בתוך המרחב הזה, בחרת בטוב. בחוץ — ההחלטה מחכה לך."',
    paragraph: 'הארכיטקטורה הזורואסטרית נבנתה על הבחנה אחת: אור ורוע. כל עמוד, כל קשת, כל פסיפס צבעוני בחצר אחמנית — הם הצהרת מלחמה מקופלת. הבניין לא עומד שם כי הוא יפה; הוא עומד שם כי היופי הוא כלי מלחמה נגד החושך. המרחב הפרסי הגדול — האפדנה, עמודיה הדקים הגבוהים, שוריה המקבילים — אינו מנחה קהל, הוא מגייס אותו. מי שעובר בין עמודיו מבין: בחרת צד. אין ניטרלים.',
    post: 'האש בוערת. הבחירה נשארת.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'מקדש האש — ניצחון האור בין ארבעה קירות',
        gradient: 'linear-gradient(160deg, #C5A028 0%, #8B0000 50%, #0D3060 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'שער ה-All Nations — הכניסה כהכרזת בחירה',
        gradient: 'linear-gradient(160deg, #1B4D8E 0%, #C5A028 40%, #8B0000 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'אפדנה — יחד בצד הנכון של הקוסמוס',
        gradient: 'linear-gradient(160deg, #8B0000 0%, #1B4D8E 40%, #C5A028 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Persepolis ceremonial staircase with relief carvings of tribute-bearing nations, slender stone columns against blue sky, Achaemenid architectural grandeur, warm limestone in strong sunlight, carved soldiers and immortals lining approach, imperial scale, architectural photography 8k',
      },
      {
        label: 'סף',
        text: 'Gate of All Nations at Persepolis, massive stone propylon with lamassu guardian figures, carved bull capitals on columns, dramatic entrance announcing the power of good over evil, approaching procession, Persian imperial aesthetic, architectural photography',
      },
      {
        label: 'פנים',
        text: 'Zoroastrian fire temple inner sanctuary, eternal flame burning in alabaster vessel, carved stone walls with Ahura Mazda winged disc symbol, light triumphing over darkness, polished stone floor reflecting flame, sacred atmosphere, architectural photography with dramatic contrast',
      },
    ],
  },

  {
    id: 'greece',
    index: 8,
    name: 'יוון הקלאסית',
    archetype: 'הכרת הגבול',
    chaos: 'הוברִיס',
    order: 'גבול קפדני',
    role: 'קתרסיס',
    colors: { primary: '#E8E4C9', secondary: '#1C3A5E', accent: '#9B8B4A' },
    gradient: 'linear-gradient(145deg, #E8E4C9 0%, #B8AA7A 35%, #2A4A70 65%, #1C3A5E 100%)',
    vectors: {
      material: 'שיש לבן, אבן חיה שמגיבה לאור — חומר שמחפש שלמות',
      light: 'אור ים-תיכוני חד ובהיר — צללים מדויקים כגיאומטריה',
      threshold: 'פרונאוס — מרחב הכנה לפני הקדוש, ללא מעבר ישיר',
      proportion: 'יחס הזהב ומודולור האנושי — הגוף הוא קנה המידה של הכל',
      narrative: 'המרחב מוכיח שסדר אפשרי — ויכוח מנצח נגד הכאוס',
    },
    insight: '"הגוף שלך הוא קנה המידה. החוק שלך הוא הגבול. ראה — ושמור."',
    paragraph: 'המקדש היווני הוא הוכחה. לא של אמונה — של אפשרות. כי לפני שיוון בנתה פרתנון, היה ניתן לטעון שסדר מתמטי אינו אפשרי באבן. שהיחס המושלם הוא רעיון, לא גוף. היוונים ענו: הנה. אבן ואור. הגוף האנושי כנקודת מוצא, הגיאומטריה כשפה, ורפרפת אנטסיס עדינה שמחזירה לעמוד את הלחץ האבוד — כולם יחד מוכיחים שהגבול ניתן להגדרה, ולכן ניתן לכבד. הטרגדיה היוונית אמרה את אותו דבר בשפה אחרת: ראה את גבולך.',
    post: 'הפרופורציה אינה יופי. היא אתיקה מגולפת.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'אדיטון — הפנימי ביותר, לא לכל עין',
        gradient: 'linear-gradient(160deg, #1C3A5E 0%, #2A4A70 50%, #E8E4C9 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'פרונאוס — הסף שמחייב הכנה',
        gradient: 'linear-gradient(160deg, #E8E4C9 0%, #9B8B4A 50%, #1C3A5E 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'תיאטרון — מרחב קתרסיס קהילתי',
        gradient: 'linear-gradient(160deg, #9B8B4A 0%, #E8E4C9 30%, #1C3A5E 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Doric Greek temple on hill, white marble columns casting precise geometric shadows in Aegean light, entasis curve visible on columns, perfect proportional harmony, blue sky and sea backdrop, no human figures, mathematical perfection made stone, architectural photography 8k golden hour',
      },
      {
        label: 'סף',
        text: 'Greek temple pronaos entrance, rhythmic colonnade framing view into shadow, precise entablature above, triglyphs and metopes carved, figure pausing in propylaeum threshold, light and shadow geometry, philosophical space between outside world and sacred interior, architectural photography',
      },
      {
        label: 'פנים',
        text: 'Greek outdoor theater carved into hillside, perfect acoustic geometry of stone seating rising in precise curves, orchestra circle below, blue sky backdrop as stage, ancient drama space, human scale against landscape, Epidaurus aesthetic, architectural photography wide angle',
      },
    ],
  },

  {
    id: 'celtic',
    index: 9,
    name: 'קלטים',
    archetype: 'חציית הסף',
    chaos: 'גבול סגור',
    order: 'נזילות הקרומים',
    role: 'חציית סף',
    colors: { primary: '#3A7A34', secondary: '#4A3728', accent: '#7AB87A' },
    gradient: 'linear-gradient(145deg, #2D5A27 0%, #1A3A18 35%, #3A2A18 65%, #1A1008 100%)',
    vectors: {
      material: 'אבן מחוספסת, כיסוי טבעי מאזוב, עץ עתיק — חומר שהטבע מאמץ בחזרה',
      light: 'אור מפוזר דרך עלווה, ערפל ואור בו-זמנית — לא ניתן להפריד',
      threshold: 'גבול מטושטש מכוון — קשה לדעת מתי היית בפנים ומתי בחוץ',
      proportion: 'אורגני ולא סימטרי — הצורה צומחת מהקרקע כמו עץ',
      narrative: 'המרחב שואל: היכן מסתיים הבית ומתחיל היער?',
    },
    insight: '"אין פנים ואין חוץ. יש רק רגע המעבר. היה שם."',
    paragraph: 'הארכיטקטורה הקלטית לא מנסה לנצח את הטבע — היא ממשיכה אותו. מעגלי האבן, הגבעות המוקפות עפר, הכפרים שגבולם עם היער אינו ברור — כולם מגדירים מרחב שמזמין את הכאוס פנימה בזהירות מחושבת. הגיבור הקלטי לא עוצר בסף — הוא יודע לעבור בו. הגבול המטושטש בין עולם החיים לעולם המתים, בין היישוב ליער, בין הנראה לבלתי נראה — הוא לא חולשה ארכיטקטונית. הוא הגדרה תיאולוגית: הסף הוא המקדש.',
    post: 'הקדושה לא בפנים. הקדושה בין הפנים לחוץ.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'הבית הכפרי — המרחב שהיער מאמץ בחזרה',
        gradient: 'linear-gradient(160deg, #1A1008 0%, #3A2A18 50%, #3A7A34 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'מעגל האבן — הגבול שאף פעם לא ברור',
        gradient: 'linear-gradient(160deg, #3A7A34 0%, #2D5A27 50%, #1A1008 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'הגבעה המוקפת — יחד בתוך הטבע',
        gradient: 'linear-gradient(160deg, #7AB87A 0%, #3A7A34 40%, #1A1008 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Celtic stone circle in misty Scottish highland, ancient mossy standing stones arranged in sacred geometry, boundary between cultivated land and wild forest ambiguous, morning fog, liminal atmospheric quality, pre-Christian sacred space, no clear inside or outside, architectural photography 8k',
      },
      {
        label: 'סף',
        text: 'Celtic roundhouse threshold, low thatched entrance requiring the body to bow, wattle and daub walls with moss and lichen, forest edge immediately behind, ambiguous boundary between domestic and wild, figure pausing at the unclear threshold, liminal sacred space photography',
      },
      {
        label: 'פנים',
        text: 'Celtic Iron Age hill fort seen from inside, earthwork ramparts organically following landscape contours, interior gathering space, forest visible just beyond walls, natural materials reclaimed by vegetation, communal fire pit, organic irregular forms, atmospheric photography',
      },
    ],
  },

  {
    id: 'japan',
    index: 10,
    name: 'יפן שינטו',
    archetype: 'טוהר אקטיבי',
    chaos: 'קגארה — זוהמה',
    order: 'נוכחות הרוחות',
    role: 'טיהור',
    colors: { primary: '#F0ECD8', secondary: '#2C2416', accent: '#9B7B4A' },
    gradient: 'linear-gradient(145deg, #F0ECD8 0%, #C8B898 35%, #6A5040 65%, #2C2416 100%)',
    vectors: {
      material: 'עץ הינוקי, נייר ואשי, חצץ מגורף — חומרים שמגיבים לזמן בחן',
      light: 'אור מסונן דרך שוג\'י, מפוזר ושווה — לא כיוון אחד, אלא נוכחות',
      threshold: 'טוריי ונוצה — הסף הוא טקס ניקוי, לא מעבר פיזי בלבד',
      proportion: 'ממוזער ומדויק — כל סנטימטר נושא כוונה, אין בזבוז',
      narrative: 'המרחב הוא שמירה — הוא מוזמן לנוח בקשב מלא',
    },
    insight: '"פחות. מדויק. כוונה. הרוחות נוכחות כאשר הרעש נעלם."',
    paragraph: 'הארכיטקטורה היפנית השינטואיסטית בנויה על הנחה אחת: הרוחות — הקאמי — נמצאות בכל דבר, ותפקיד המרחב הוא לאפשר להן להיות נוכחות. לא לזמן אותן, אלא להפסיק להפריע להן. גן הצ\'ן המגורף, קירות ה-שוג\'י שמפזרים אור, מרחב ה-מא — החלל ריק שהוא הנושא האמיתי — כולם עובדים יחד כדי להוריד את הרעש של הנוכחות האנושית ולתת לקדושה לדבר. הסף היפני — הטוריי — אינו סגירה, הוא כוונה: כאן, אתה שם לב.',
    post: 'גרף את החצץ. הרוחות ינוחו. אתה תנוח.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'חדר התה — מרחב טיהור אישי מוחלט',
        gradient: 'linear-gradient(160deg, #2C2416 0%, #6A5040 50%, #F0ECD8 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'הטוריי — הסף שמסמן כוונה',
        gradient: 'linear-gradient(160deg, #F0ECD8 0%, #9B7B4A 50%, #2C2416 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'גן הצ\'ן — שתיקה קהילתית',
        gradient: 'linear-gradient(160deg, #9B7B4A 0%, #F0ECD8 30%, #2C2416 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'Japanese zen rock garden, perfectly raked white gravel around two stones, wooden engawa verandah edge, shoji screen glowing from interior light, moss and stone wall, absolute stillness, wabi-sabi aesthetic, negative space as subject, architectural photography 8k minimal',
      },
      {
        label: 'סף',
        text: 'Torii gate path at Shinto shrine, vermillion painted wooden pillars in ancient cryptomeria forest, dappled forest light, stone lanterns lining path, sense of threshold crossing between worlds, no people, sacred liminal atmosphere, Japanese architectural photography',
      },
      {
        label: 'פנים',
        text: 'Japanese tea house interior, tatami mat floor, tokonoma alcove with single hanging scroll and flower arrangement, shoji paper screens glowing with diffused light, wooden ceiling, absolute minimalism, every object intentional, no excess, wabi-sabi tea ceremony space, architectural photography',
      },
    ],
  },

  {
    id: 'africa',
    index: 11,
    name: 'אפריקה Ubuntu',
    archetype: 'קישור השלם',
    chaos: 'ניתוק קהילתי',
    order: 'רשת יחסים',
    role: 'גישור',
    colors: { primary: '#C4622D', secondary: '#1A0A00', accent: '#E8B84B' },
    gradient: 'linear-gradient(145deg, #C4622D 0%, #8B3A15 35%, #3A1A00 65%, #1A0A00 100%)',
    vectors: {
      material: 'טיט, במבוק, סיבים טבעיים — חומר שהקהילה בנתה בידיים',
      light: 'אור פתוח של חצר מרכזית — השמיים הם התקרה המשותפת',
      threshold: 'חצר פנימית כלב — הכניסה היא אל הקהילה, לא אל הפרט',
      proportion: 'מעגלי ומרכזי — הפרופורציה אומרת: המרכז שייך לכולם',
      narrative: 'אני קיים כי אנחנו קיימים',
    },
    insight: '"בית שנבנה לפרט לבדו — אינו בית. הוא בידוד עם קירות."',
    paragraph: 'Ubuntu — אני קיים כי אנחנו קיימים — הוא לא פילוסופיה, הוא תוכנית בנייה. החצר המרכזית של הכפר האפריקאי המסורתי, המוקפת בבתים עגולים המצביעים פנימה, אינה תכנון מקרי. היא טיעון: אדם בלי קהילה אינו אדם שלם, ולכן הבית שלו חייב לפנות קהילה. החומר — טיט ועץ ובמבוק — הוא חומר של ידיים, של שיתוף, של בנייה ביחד. הבית לא נבנה כדי להתרשם, הוא נבנה כדי לחיות — וחיים אמיתיים הם תמיד בגוף ראשון רבים.',
    post: 'הקיר בין הבתים? הוא לא הפרדה. הוא הזמנה.',
    spaces: [
      {
        id: 'private',
        label: 'מרחב פרטי',
        caption: 'הבית העגול — פרטי אך פונה קהילה',
        gradient: 'linear-gradient(160deg, #1A0A00 0%, #3A1A00 50%, #C4622D 100%)',
      },
      {
        id: 'threshold',
        label: 'מרחב מעבר',
        caption: 'שער המתחם — כניסה לרשת, לא לפרט',
        gradient: 'linear-gradient(160deg, #C4622D 0%, #8B3A15 50%, #1A0A00 100%)',
      },
      {
        id: 'communal',
        label: 'מרחב קהילתי',
        caption: 'החצר המשותפת — התקרה היא השמיים',
        gradient: 'linear-gradient(160deg, #E8B84B 0%, #C4622D 40%, #1A0A00 100%)',
      },
    ],
    prompts: [
      {
        label: 'חוץ',
        text: 'West African compound housing, circular mud houses arranged around shared central courtyard, earth plaster with geometric painted patterns, terracotta and ochre, community gathering space, thatched roofs, children playing in courtyard, organic communal architecture, warm afternoon light, documentary architectural photography 8k',
      },
      {
        label: 'סף',
        text: 'African compound entrance gate, mud brick archway with carved patterns, transition from public street to private community courtyard, community members visible inside, decorated earth plaster walls, warm terracotta colors, threshold between individual and communal life, architectural photography',
      },
      {
        label: 'פנים',
        text: 'African communal gathering space, circular thatched-roof meeting house, central fire pit, community seated in circle, open to sky at center, Ubuntu philosophy made spatial, warm firelight and open sky light, communal decision-making space, documentary photography',
      },
    ],
  },
];

export default cultures;
