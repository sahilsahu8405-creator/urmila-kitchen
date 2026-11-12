/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#244638',
          dark: '#1B352B',
          light: '#2E5947',
          50: '#F0F5F2',
          100: '#E1EBE6',
          900: '#14271F',
        },
        cream: {
          DEFAULT: '#F8F5EC',
          light: '#FCFBF7',
          dark: '#EDE7D5',
        },
        sage: {
          DEFAULT: '#A8B69B',
          light: '#C4CFBB',
          dark: '#879778',
        },
        olive: {
          DEFAULT: '#777F52',
          light: '#919B68',
          dark: '#5D643E',
        },
        terracotta: {
          DEFAULT: '#BD8061',
          light: '#CE987E',
          dark: '#A46545',
        },
        charcoal: {
          DEFAULT: '#282C28',
          light: '#424742',
          muted: '#636B63',
        },
        borderLight: '#E8E2D2',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(36, 70, 56, 0.05)',
        'card': '0 4px 20px -2px rgba(36, 70, 56, 0.08)',
        'elevated': '0 12px 30px -4px rgba(36, 70, 56, 0.12)',
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}

