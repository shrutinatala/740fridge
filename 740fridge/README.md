# 740fridge

A charming, private **digital fridge wall** for guests to upload photos taken inside your apartment.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Vercel Blob for image storage
- `sharp` for image conversion (auto-rotate + WebP)

## Routes

- `/` — main fridge wall (wrapped by a simple client-side password gate)
- `/upload` — mobile-first guest upload page (no login)
- `/api/upload` — multipart upload endpoint (stores WebP in Vercel Blob)
- `/api/photos` — lists photo URLs (used by the wall)

## Authentication (simple password gate)

- Password is client-side only (per requirements).
- Password: `4foot2inch`
- Implemented in `src/components/password-gate.tsx`.

## How uploads work

1. Guests open `/upload` on their phone.
2. They choose/take a photo.
3. The browser sends `multipart/form-data` to `POST /api/upload` with a single field named `file`.
4. The server:
   - Auto-rotates based on EXIF
   - Resizes to max 2000×2000 (keeps aspect ratio)
   - Converts to WebP
   - Uploads to Vercel Blob under `uploads/<timestamp>-<uuid>.webp`
5. The fridge wall lists blobs and renders the newest at the top.

Key code:

- Upload API: `src/app/api/upload/route.ts`
- Photo listing: `src/lib/blob.ts`

## Where images are stored

Images are stored in **Vercel Blob** (public access) so the fridge wall can render them.

You need:

- `BLOB_READ_WRITE_TOKEN` in local/dev and on deploy

## Generate + print the QR code

1. Copy env file:

```bash
cp .env.example .env.local
```

2. Set `UPLOAD_URL` to your deployed upload URL, e.g. `https://your-domain.com/upload`
3. Generate the PNG:

```bash
npm run qr
```

4. Print `public/qr-upload.png` and place it near the fridge.

## Environment variables

- `BLOB_READ_WRITE_TOKEN` — required for Vercel Blob uploads + listing
- `UPLOAD_URL` — used only for generating the QR image with `npm run qr`

## Local development

```bash
npm install
npm run dev
```

## Styling approach

- A bright, minimal fridge surface is implemented in `src/app/globals.css` via:
  - subtle speckle texture (radial gradient)
  - gentle vertical sheen (linear gradient)
- Photos render as “prints” with white borders and shadow.
- Magnets are lightweight SVG/HTML elements layered above photos.

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
