# AquaTrack Frontend — File Placement

This zip mirrors your `frontend/src/` folder exactly. To install:

1. Copy everything inside `src/` here into your existing `frontend/src/` folder,
   **overwriting** `App.jsx` and `main.jsx` if prompted.
2. From your `frontend/` folder, install the one extra dependency this uses:
   ```bash
   npm install lucide-react
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173

## Folder structure

```
src/
  main.jsx              entry point (unchanged from Vite default)
  App.jsx                page routing + auth state, ties everything together
  styles/
    theme.css            all design tokens (colors, fonts) + shared CSS classes
  api/
    authApi.js           fetch wrapper for /api/auth/login and /api/auth/register
  hooks/
    useCountUp.js         animation hook used by the stat band
  components/
    NavBar.jsx
    Footer.jsx
    Hero.jsx
    GaugeDial.jsx         the animated meter-dial signature graphic
    StatBand.jsx
    Features.jsx
    HowItWorks.jsx
    CTA.jsx
    FormShell.jsx         shared wrapper used by Login/Register
  pages/
    HomePage.jsx
    LoginPage.jsx          calls api/authApi.js -> login()
    RegisterPage.jsx       calls api/authApi.js -> register()
    AboutPage.jsx
    ContactPage.jsx
    DashboardPage.jsx      basic placeholder, full version comes in Phase 2
```

## Backend connection

`src/api/authApi.js` points at `http://localhost:8080`. Your Spring Boot backend
needs CORS enabled for requests from `http://localhost:5173` (Vite's dev server)
or the browser will block these calls — ask for the CORS config if you haven't
added it yet.

## Next steps when you're ready

- Swap the `page` state in `App.jsx` for real routes with `react-router-dom`.
- Move `API_BASE` in `authApi.js` into a Vite env variable (`VITE_API_BASE`)
  so it's easy to point at a different backend URL per environment.
- Replace the in-memory `auth` state with whatever persistence strategy your
  team settles on (e.g. an auth context), now that it's isolated in one place.
