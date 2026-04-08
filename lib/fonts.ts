import localFont from "next/font/local";

export const helveticaNeue = localFont({
  src: [
    {
      path: "../public/fonts/Helvetica/HelveticaNeueLT.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
});

export const helvetica = localFont({
  src: [
    {
      path: "../public/fonts/Helvetica/Helvetica.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Helvetica/Helvetica-Oblique.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Helvetica/Helvetica-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Helvetica/Helvetica-LightOblique.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/Helvetica/Helvetica-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Helvetica/Helvetica-BoldOblique.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-helvetica",
  display: "swap",
});
