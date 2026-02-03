import * as fs from "node:fs/promises";
import * as path from "node:path";
import QRCode from "qrcode";

// Generates a PNG QR code for the guest upload page.
//
// How to use:
// - Set `UPLOAD_URL` below to your deployed URL + `/upload`
// - Run: `npm run qr`
// - Print: `public/qr-upload.png`

const UPLOAD_URL = process.env.UPLOAD_URL ?? "http://localhost:3000/upload";

async function main() {
  const outputPath = path.join(process.cwd(), "public", "qr-upload.png");

  const png = await QRCode.toBuffer(UPLOAD_URL, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 640,
    color: {
      dark: "#111827",
      light: "#ffffff",
    },
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, png);

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outputPath}`);
  // eslint-disable-next-line no-console
  console.log(`QR destination: ${UPLOAD_URL}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
