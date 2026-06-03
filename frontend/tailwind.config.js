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
        "outline-variant": "var(--outline-variant)",
        "outline": "var(--outline)",
        "on-error": "var(--on-error)",
        "surface-container-highest": "var(--surface-container-highest)",
        "primary-fixed": "var(--primary-fixed)",
        "surface-variant": "var(--surface-variant)",
        "on-surface-variant": "var(--on-surface-variant)",
        "on-primary-container": "var(--on-primary-container)",
        "secondary": "var(--secondary)",
        "inverse-primary": "var(--inverse-primary)",
        "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)",
        "tertiary": "var(--tertiary)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        "tertiary-container": "var(--tertiary-container)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        "error": "var(--error)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "on-primary-fixed": "var(--on-primary-fixed)",
        "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",
        "background": "var(--background)",
        "on-tertiary-fixed": "var(--on-tertiary-fixed)",
        "primary": "var(--primary)",
        "tertiary-fixed": "var(--tertiary-fixed)",
        "primary-fixed-dim": "var(--primary-fixed-dim)",
        "surface-tint": "var(--surface-tint)",
        "on-primary": "var(--on-primary)",
        "surface": "var(--surface)",
        "secondary-container": "var(--secondary-container)",
        "surface-dim": "var(--surface-dim)",
        "on-tertiary": "var(--on-tertiary)",
        "surface-container": "var(--surface-container)",
        "on-surface": "var(--on-surface)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-low": "var(--surface-container-low)",
        "on-error-container": "var(--on-error-container)",
        "surface-bright": "var(--surface-bright)",
        "inverse-surface": "var(--inverse-surface)",
        "on-secondary-fixed": "var(--on-secondary-fixed)",
        "tertiary-fixed-dim": "var(--tertiary-fixed-dim)",
        "error-container": "var(--error-container)",
        "on-secondary": "var(--on-secondary)",
        "secondary-fixed-dim": "var(--secondary-fixed-dim)",
        "on-secondary-container": "var(--on-secondary-container)",
        "secondary-fixed": "var(--secondary-fixed)",
        "primary-container": "var(--primary-container)",
        "on-background": "var(--on-background)"
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
