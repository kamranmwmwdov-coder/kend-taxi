import type { Config } from "tailwindcss";

// Rəng qərarı: Mavi əsas rəng (H-8 əsasında). Yaşıl "uğur" statusları üçün ayrılıb
// ki, status rənglərində (Aktiv/Tamamlandı = yaşıl) qarışıqlıq yaranmasın.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1D6FE0",
          light: "#4A90F0",
          dark: "#1352A8",
        },
        success: { DEFAULT: "#1E9E5A", dark: "#166F40" },
        warning: { DEFAULT: "#E08A1D" },
        danger: { DEFAULT: "#D6403C" },
        surface: { DEFAULT: "#FFFFFF", muted: "#F5F6F8" },
        ink: { DEFAULT: "#1F2430", muted: "#5B6270" },
        status: {
          new: "#8A8F98",
          waiting: "#E08A1D",
          accepted: "#1D6FE0",
          active: "#1E9E5A",
          completed: "#166F40",
          cancelled: "#D6403C",
        },
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
    },
  },
  plugins: [],
};
export default config;
