This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on GitHub Pages

This repository is configured for static export and deployment to GitHub Pages through
GitHub Actions.

### One-time setup in GitHub

1. In your repository, go to **Settings -> Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Ensure your default branch is `main` (the deploy workflow runs on pushes to `main`).

### Deploy

Push to `main` and GitHub Actions will:

1. Install dependencies
2. Build the Next.js static export (`out/`)
3. Publish it to GitHub Pages

Your site URL will be:

- `https://<username>.github.io/<repo>/` for project pages
- `https://<username>.github.io/` for user/org pages

If your repo is a project page, this setup automatically sets the correct `basePath`
and asset prefix during GitHub Actions builds.

## GitHub Codespaces (no terminal required for startup)

This repository includes a `.devcontainer` setup so the app starts automatically in
Codespaces.

### Use it from GitHub web UI

1. Open the repository on GitHub.
2. Click **Code -> Codespaces -> Create codespace on branch**.
3. Wait for the codespace to finish booting. The app auto-installs dependencies and
   starts on port `3000`.
4. Open the **Ports** panel.
5. For port `3000`, set visibility to **Public**.
6. Open the forwarded HTTPS URL on your phone from any network.
