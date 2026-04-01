# GraphQL Tech Catalog Web

Next.js 14 App Router frontend with Apollo Client and cyberpunk design system.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`

## Known Limitations

### API Cold Starts (Render free tier)

The API is hosted on Render's free tier which spins down after 15 minutes of inactivity. The first request after inactivity takes ~60 seconds to respond while the server wakes up. Subsequent requests are instant.

To avoid this during a demo:

```bash
curl https://YOUR_API.onrender.com/health
```

Wait for `{ "status": "ok" }` before opening the frontend.
