/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E6F0EC",
          100: "#C2D9CF",
          200: "#9EC2B2",
          300: "#7AAC95",
          400: "#569578",
          500: "#327E5B",
          600: "#1F6B48",
          700: "#0D3B2C",
          800: "#0A2E23",
          900: "#07211A",
        },
        gold: {
          50: "#FBF7E9",
          100: "#F5EBC8",
          200: "#EEDFAA",
          300: "#E7D389",
          400: "#DEC768",
          500: "#D4AF37",
          600: "#B8942E",
          700: "#9C7925",
          800: "#805E1C",
          900: "#644313",
        },
        accent: {
          50: "#FDECEE",
          100: "#FBD3D8",
          200: "#F8B9C1",
          300: "#F49FAA",
          400: "#F07C8B",
          500: "#E63946",
          600: "#CF1A28",
          700: "#A81420",
          800: "#810E18",
          900: "#5A0810",
        },
        dark: {
          50: "#F5F5F5",
          100: "#E5E5E5",
          200: "#CCCCCC",
          300: "#999999",
          400: "#666666",
          500: "#333333",
          600: "#262626",
          700: "#1A1A2E",
          800: "#121212",
          900: "#0A0A0A",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans SC",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Courier New", "monospace"],
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(212, 175, 55, 0.4)",
        "glow-green": "0 0 20px rgba(13, 59, 44, 0.4)",
        "glow-red": "0 0 20px rgba(230, 57, 70, 0.4)",
        "card": "0 4px 20px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "slide-out-left": "slideOutLeft 0.4s ease-out",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "number-roll": "numberRoll 0.3s ease-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(212, 175, 55, 0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(212, 175, 55, 0.7)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideOutLeft: {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(-50px)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        numberRoll: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "pool-table":
          "linear-gradient(135deg, #0D3B2C 0%, #1F6B48 50%, #0D3B2C 100%)",
        "gold-shine":
          "linear-gradient(135deg, #D4AF37 0%, #F5EBC8 50%, #D4AF37 100%)",
      },
    },
  },
  plugins: [],
};
