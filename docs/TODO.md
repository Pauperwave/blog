# TODO

## Set up Nuxt Studio authentication

`/editor` currently fails with:

```
[error] [nuxt-studio] In order to authenticate users, you need to set up a GITHUB OAuth application.
```

Nuxt Studio needs OAuth credentials to authenticate editors — this is a Studio requirement, unrelated to Nuxt UI.

**Steps** (GitHub, since that's the configured repository provider):

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set the callback URL to `https://blog.pauperwave.org/editor` (production) — a separate app is needed for local dev with a `http://localhost:3000/editor` callback
3. Copy the generated Client ID and Client Secret
4. Set as environment variables:
   - Production: add `STUDIO_GITHUB_CLIENT_ID` / `STUDIO_GITHUB_CLIENT_SECRET` to Vercel
   - Local dev: add the same two to `.env`

Alternative: Google OAuth is also supported (`STUDIO_GOOGLE_CLIENT_ID` / `STUDIO_GOOGLE_CLIENT_SECRET`), combined with `STUDIO_GITHUB_TOKEN` to allow Studio to push changes to the repo. See the [Nuxt Studio docs](https://nuxt.studio/) for details — out of scope for this project's own docs.
