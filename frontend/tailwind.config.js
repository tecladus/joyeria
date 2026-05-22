/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "outline-variant": "#d1c5b4",
        "outline": "#7f7667",
        "on-error": "#ffffff",
        "surface-container-highest": "#e3e2e0",
        "primary-fixed": "#ffdea5",
        "surface-variant": "#e3e2e0",
        "on-surface-variant": "#4e4639",
        "on-primary-container": "#4e3700",
        "secondary": "#5f5e5e",
        "inverse-primary": "#e9c176",
        "on-tertiary-fixed-variant": "#4a473e",
        "tertiary": "#625e55",
        "inverse-on-surface": "#f1f1ef",
        "tertiary-container": "#aaa59a",
        "on-tertiary-container": "#3e3b33",
        "error": "#ba1a1a",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed": "#261900",
        "on-secondary-fixed-variant": "#474747",
        "background": "#faf9f7",
        "on-tertiary-fixed": "#1e1c14",
        "primary": "#775a19",
        "tertiary-fixed": "#e8e2d6",
        "primary-fixed-dim": "#e9c176",
        "surface-tint": "#775a19",
        "on-primary": "#ffffff",
        "surface": "#faf9f7",
        "secondary-container": "#e4e2e1",
        "surface-dim": "#dadad8",
        "on-tertiary": "#ffffff",
        "surface-container": "#efeeec",
        "on-surface": "#1a1c1b",
        "on-primary-fixed-variant": "#5d4201",
        "surface-container-high": "#e9e8e6",
        "surface-container-low": "#f4f3f1",
        "on-error-container": "#93000a",
        "surface-bright": "#faf9f7",
        "inverse-surface": "#2f3130",
        "on-secondary-fixed": "#1b1c1c",
        "tertiary-fixed-dim": "#cbc6ba",
        "error-container": "#ffdad6",
        "on-secondary": "#ffffff",
        "secondary-fixed-dim": "#c8c6c6",
        "on-secondary-container": "#656464",
        "secondary-fixed": "#e4e2e1",
        "primary-container": "#c5a059",
        "on-background": "#1a1c1b"
      },
      "borderRadius": {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      "spacing": {
        "margin-desktop": "64px",
        "unit": "8px",
        "gutter": "24px",
        "margin-mobile": "20px",
        "container-max": "1280px",
        "section-gap": "120px"
      },
      "fontFamily": {
        "headline-lg": ["Playfair Display"],
        "label-caps": ["Montserrat"],
        "display-lg": ["Playfair Display"],
        "display-lg-mobile": ["Playfair Display"],
        "body-lg": ["Montserrat"],
        "body-md": ["Montserrat"],
        "headline-md": ["Playfair Display"]
      },
      "fontSize": {
        "headline-lg": ["32px", { "lineHeight": "1.3", "fontWeight": "400" }],
        "label-caps": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.15em", "fontWeight": "600" }],
        "display-lg": ["64px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "400" }],
        "display-lg-mobile": ["40px", { "lineHeight": "1.2", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "letterSpacing": "0.01em", "fontWeight": "300" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "1.4", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    // Plugins opcionales si se instalaron
    // require('@tailwindcss/forms'),
  ],
}
