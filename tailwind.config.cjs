/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panablue: "#0a1156",
        panared: "#b65437",
        panagold: "#f5b750",
        soft: "#fefdfa"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(7,11,62,0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    },
  },
  plugins: [],
};
