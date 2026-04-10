[error] [nuxt-studio] In order to authenticate users, you need to set up a GITHUB OAuth application. Please set the `STUDIO_GITHUB_CLIENT_ID` and `STUDIO_GITHUB_CLIENT_SECRET` environment variables, Alternatively, you can set up a Google OAuth application and set the `STUDIO_GOOGLE_CLIENT_ID` and `STUDIO_GOOGLE_CLIENT_SECRET` environment variables alongside with `STUDIO_GITHUB_TOKEN` to push changes to the repository.

This is not a Nuxt UI issue — it's from nuxt-studio. You need to set up OAuth credentials for the Studio editor to authenticate users.

Since you're using GitHub as your repository provider (as configured in your studio config), the quickest fix is to create a GitHub OAuth App:

Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
Set the callback URL to https://yourdomain.com/editor (your studio route)
Copy the Client ID and Client Secret
Add them to your Vercel environment variables:

STUDIO_GITHUB_CLIENT_ID=your_client_id
STUDIO_GITHUB_CLIENT_SECRET=your_client_secret
For local development, add them to your .env:


STUDIO_GITHUB_CLIENT_ID=your_client_id
STUDIO_GITHUB_CLIENT_SECRET=your_client_secret
For more details, check the Nuxt Studio docs directly since this is outside Nuxt UI's scope.
