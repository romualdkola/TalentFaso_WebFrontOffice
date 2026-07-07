import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          subtle: "var(--primary-subtle)",
          "subtle-foreground": "var(--primary-subtle-foreground)",
          50: "#FEF2F3",
          100: "#FDE6E7",
          200: "#FBD1D3",
          300: "#F7ACB0",
          400: "#F17C83",
          500: "#E74D57",
          600: "#D32F3C",
          700: "#74101e",
          800: "#621119",
          900: "#541418",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          subtle: "var(--accent-subtle)",
          "subtle-foreground": "var(--accent-subtle-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
          subtle: "var(--destructive-subtle)",
          "subtle-foreground": "var(--destructive-subtle-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          subtle: "var(--info-subtle)",
        },
        success: {
          DEFAULT: "var(--success)",
          subtle: "var(--success-subtle)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle: "var(--warning-subtle)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--tf-radius-xl)",
        pill: "var(--tf-radius-pill)",
      },
      ringWidth: {
        DEFAULT: "var(--tf-ring-width)",
      },
      ringOffsetWidth: {
        DEFAULT: "var(--tf-ring-offset)",
      },
      fontFamily: {
        heading: ["var(--tf-font-heading)"],
        body: ["var(--tf-font-body)"],
        sans: ["var(--tf-font-body)"],
      },
      lineHeight: {
        body: "var(--tf-line-height)",
        heading: "var(--tf-line-height-heading)",
      },
      spacing: {
        "tf-1": "var(--tf-spacer-1)",
        "tf-2": "var(--tf-spacer-2)",
        "tf-3": "var(--tf-spacer-3)",
        "tf-4": "var(--tf-spacer-4)",
        "tf-5": "var(--tf-spacer-5)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
