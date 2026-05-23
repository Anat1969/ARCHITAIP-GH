# DWELLING DNA
## מסמך 9 — Heyzine Flipbook Integration

---

### עיקרון השילוב
כל מגזין-תרבות שנבנה ב-DWELLING DNA יכול להיוצא כ-PDF
ולהפוך אוטומטית לחוברת דיגיטלית עם דפדוף אמיתי דרך Heyzine API.
הלקוח מקבל URL חי — פותח בדפדפן, דופף, מרגיש מגזין.

---

### פרטי חיבור

```
CLIENT_ID: 53c79c41b67fea2d
API_KEY:   70e858e6e0584a16f4a82d8b1274864c3c53c3da.53c79c41b67fea2d

⚠️  שמור את המפתחות ב-.env בלבד — לעולם לא בקוד
    HEYZINE_CLIENT_ID=53c79c41b67fea2d
    HEYZINE_API_KEY=70e858e6e0584a16f4a82d8b1274864c3c53c3da.53c79c41b67fea2d
```

---

### זרימת עבודה מלאה

```
משתמש לוחץ "ייצא כחוברת"
          ↓
המערכת מייצרת PDF מעמודי המגזין
          ↓
PDF נשלח ל-Heyzine REST API (Sync)
          ↓
Heyzine מחזיר URL לחוברת + thumbnail
          ↓
URL נשמר לתרבות/גרסה
          ↓
המשתמש רואה preview ב-iframe
          ↓
כפתור "שלח ללקוח" מעתיק את ה-URL
```

---

### REST API — יצירת Flipbook

**Endpoint:**
```
POST https://heyzine.com/api1/rest
Authorization: Bearer HEYZINE_API_KEY
```

**Request:**
```json
{
  "pdf": "https://your-storage.com/dwelling-dna-israel-v1.pdf",
  "client_id": "53c79c41b67fea2d",
  "title": "DWELLING DNA — ישראל הקדומה",
  "subtitle": "Vol. 01 — מרחב פרטי",
  "description": "ארכיטקטורה שנגזרת מברית ואמון",
  "prev_next": true,
  "full_screen": true,
  "share": true,
  "background_color": "1a1410",
  "tags": "dwelling-dna,israel,private-space,v1"
}
```

**Response:**
```json
{
  "id": "flipbook_id.pdf",
  "url": "https://heyzine.com/flip-book/xxxxxx.html",
  "thumbnail": "https://cdnc.heyzine.com/flip-book/cover/xxxxxx.jpg",
  "pdf": "https://cdnc.heyzine.com/flip-book/pdf/xxxxxx.pdf",
  "meta": {
    "num_pages": 9,
    "aspect_ratio": 0.7078
  }
}
```

---

### שמירת נתוני Flipbook על התרבות/גרסה

```json
{
  "culture_id": "culture_006",
  "version_name": "גרסה לקוח א׳",
  "export": {
    "pdf_url": "https://your-storage.com/...",
    "flipbook": {
      "id": "flipbook_id.pdf",
      "url": "https://heyzine.com/flip-book/xxxxxx.html",
      "thumbnail": "https://cdnc.heyzine.com/flip-book/cover/xxxxxx.jpg",
      "created_at": "timestamp",
      "heyzine_tags": "dwelling-dna,israel,v1"
    }
  }
}
```

---

### הטמעה ב-Present Mode

כשהמשתמש עובר למצב הצגה ויש flipbook מוכן:

```html
<iframe
  allowfullscreen="allowfullscreen"
  allow="clipboard-write"
  scrolling="no"
  style="width: 100%; height: 100vh; border: none;"
  src="https://heyzine.com/flip-book/xxxxxx.html">
</iframe>
```

הממשק הקיים (סרגל דק מתקפל) נשמר — ה-iframe מחליף את תצוגת הקנבס.

---

### כפתורי פעולה ב-UI

**בעמוד העורך:**
```
[תצוגת עריכה]  [תצוגת מגזין]  [ייצא PDF]  [צור חוברת]
```

**אחרי יצירת חוברת:**
```
[פתח חוברת]  [העתק קישור ללקוח]  [עדכן חוברת]
```

**כפתור "העתק קישור ללקוח"** — מעתיק את ה-URL של Heyzine.
הלקוח פותח בדפדפן — רואה מגזין מקצועי עם דפדוף.

---

### ניהול Flipbooks — API נוסף

**רשימת כל החוברות בחשבון:**
```
GET https://heyzine.com/api1/flipbook-list
Authorization: Bearer HEYZINE_API_KEY
```

**מחיקת חוברת ישנה:**
```
POST https://heyzine.com/api1/flipbook-delete
Authorization: Bearer HEYZINE_API_KEY
{ "id": "flipbook_id.pdf" }
```

**ארגון בבוקשלף (לפי תרבות):**
```
POST https://heyzine.com/api1/bookshelf-add
Authorization: Bearer HEYZINE_API_KEY
{
  "id": "bookshelf_id",
  "flipbook_id": "flipbook_id.pdf",
  "position": 0
}
```

---

### אסטרטגיית Bookshelves

כל תרבות = bookshelf נפרד ב-Heyzine.
כל גרסה = flipbook בתוך ה-bookshelf.

```
Heyzine Account
├── Bookshelf: DWELLING DNA — ישראל
│   ├── Flipbook: גרסה לקוח א׳
│   ├── Flipbook: גרסה כנס ב׳
│   └── Flipbook: גרסה סטודנטים
├── Bookshelf: DWELLING DNA — יפן
│   └── Flipbook: גרסה א׳
└── Bookshelf: DWELLING DNA — FUSIONS
    └── Flipbook: Japan × Israel — גרסה א׳
```

---

### Developer Instruction — Heyzine Integration

```
Integrate Heyzine Flipbook API into DWELLING DNA.

Credentials stored in .env:
HEYZINE_CLIENT_ID=53c79c41b67fea2d
HEYZINE_API_KEY=70e858e6e0584a16f4a82d8b1274864c3c53c3da.53c79c41b67fea2d

Flow:
1. User clicks "Create Flipbook" in the editor
2. System exports current magazine pages as PDF
3. PDF is uploaded to storage and a direct URL is obtained
4. POST to https://heyzine.com/api1/rest with PDF URL + metadata
5. Save returned flipbook URL and ID to the culture/version object
6. Show iframe preview in Present Mode using the flipbook URL
7. Add "Copy Link for Client" button that copies the Heyzine URL

Also implement:
- Bookshelf per culture (one bookshelf = one culture)
- Each version export = one flipbook in the bookshelf
- List and manage flipbooks per culture from within the app
- Delete outdated flipbooks via API

Background color for flipbook: match the culture's DNA palette primary color.
Title format: "DWELLING DNA — [Culture Name]"
Subtitle format: "Vol. [N] — [Chapter Name] — [Version Name]"
Tags format: "dwelling-dna,[culture-id],[chapter],[version]"
```

---

```
STATUS: APPROVED ✓
VERSION: 1.0
TYPE: INTEGRATION
AFFECTS: Documents 3, 6 (Present Mode update)
NOTE: Store API keys in .env only — never hardcode
```
