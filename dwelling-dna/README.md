# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## מפתחות ו-AI (חשוב)

קריאות ה-AI **לא** יוצאות מהדפדפן. הן עוברות דרך שתי Edge Functions ב-Supabase,
כך שהמפתחות נשארים בשרת ולא נצרבים לתוך קוד האתר הציבורי:

| פונקציה | קובץ | סוד נדרש |
|---|---|---|
| `claude` | `supabase/functions/claude/index.ts` | `ANTHROPIC_API_KEY` |
| `fal-image` | `supabase/functions/fal-image/index.ts` | `FAL_API_KEY` |

### התקנה חד-פעמית

```bash
supabase login
supabase link --project-ref ihoxsbbxcqwnkhoyhmyj
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set FAL_API_KEY=xxxxxxxx:yyyyyyyy
supabase functions deploy claude
supabase functions deploy fal-image
```

קובץ `.env` מכיל רק ערכים ציבוריים (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
אין להוסיף אליו מפתחות סודיים — כל מה שמתחיל ב-`VITE_` נצרב לקוד הציבורי של האתר.
