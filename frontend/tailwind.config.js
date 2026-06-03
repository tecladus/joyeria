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
        "outline-variant": "rgb(var(--outline-variant) / <alpha-value>)",
        "outline": "rgb(var(--outline) / <alpha-value>)",
        "on-error": "rgb(var(--on-error) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--surface-container-highest) / <alpha-value>)",
        "primary-fixed": "rgb(var(--primary-fixed) / <alpha-value>)",
        "surface-variant": "rgb(var(--surface-variant) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--on-surface-variant) / <alpha-value>)",
        "on-primary-container": "rgb(var(--on-primary-container) / <alpha-value>)",
        "secondary": "rgb(var(--secondary) / <alpha-value>)",
        "inverse-primary": "rgb(var(--inverse-primary) / <alpha-value>)",
        "on-tertiary-fixed-variant": "rgb(var(--on-tertiary-fixed-variant) / <alpha-value>)",
        "tertiary": "rgb(var(--tertiary) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--inverse-on-surface) / <alpha-value>)",
        "tertiary-container": "rgb(var(--tertiary-container) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--on-tertiary-container) / <alpha-value>)",
        "error": "rgb(var(--error) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--surface-container-lowest) / <alpha-value>)",
        "on-primary-fixed": "rgb(var(--on-primary-fixed) / <alpha-value>)",
        "on-secondary-fixed-variant": "rgb(var(--on-secondary-fixed-variant) / <alpha-value>)",
        "background": "rgb(var(--background) / <alpha-value>)",
        "on-tertiary-fixed": "rgb(var(--on-tertiary-fixed) / <alpha-value>)",
        "primary": "rgb(var(--primary) / <alpha-value>)",
        "tertiary-fixed": "rgb(var(--tertiary-fixed) / <alpha-value>)",
        "primary-fixed-dim": "rgb(var(--primary-fixed-dim) / <alpha-value>)",
        "surface-tint": "rgb(var(--surface-tint) / <alpha-value>)",
        "on-primary": "rgb(var(--on-primary) / <alpha-value>)",
        "surface": "rgb(var(--surface) / <alpha-value>)",
        "secondary-container": "rgb(var(--secondary-container) / <alpha-value>)",
        "surface-dim": "rgb(var(--surface-dim) / <alpha-value>)",
        "on-tertiary": "rgb(var(--on-tertiary) / <alpha-value>)",
        "surface-container": "rgb(var(--surface-container) / <alpha-value>)",
        "on-surface": "rgb(var(--on-surface) / <alpha-value>)",
        "on-primary-fixed-variant": "rgb(var(--on-primary-fixed-variant) / <alpha-value>)",
        "surface-container-high": "rgb(var(--surface-container-high) / <alpha-value>)",
        "surface-container-low": "rgb(var(--surface-container-low) / <alpha-value>)",
        "on-error-container": "rgb(var(--on-error-container) / <alpha-value>)",
        "surface-bright": "rgb(var(--surface-bright) / <alpha-value>)",
        "inverse-surface": "rgb(var(--inverse-surface) / <alpha-value>)",
        "on-secondary-fixed": "rgb(var(--on-secondary-fixed) / <alpha-value>)",
        "tertiary-fixed-dim": "rgb(var(--tertiary-fixed-dim) / <alpha-value>)",
        "error-container": "rgb(var(--error-container) / <alpha-value>)",
        "on-secondary": "rgb(var(--on-secondary) / <alpha-value>)",
        "secondary-fixed-dim": "rgb(var(--secondary-fixed-dim) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--on-secondary-container) / <alpha-value>)",
        "secondary-fixed": "rgb(var(--secondary-fixed) / <alpha-value>)",
        "primary-container": "rgb(var(--primary-container) / <alpha-value>)",
        "on-background": "rgb(var(--on-background) / <alpha-value>)"
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
