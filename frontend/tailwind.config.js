/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#a47ec2',        // Purple - buttons, accents, active states, focus indicators
        'primary-dark': '#8a5ea3', // Darker purple for hover states
        secondary: '#F6E3BA',      // Cream - backgrounds, cards, subtle accents
        'secondary-dark': '#e8d4a5', // Darker cream for hover states
        neutral: '#000000',        // Black - text, borders, contrast elements
      },
    },
  },
  plugins: [],
}
