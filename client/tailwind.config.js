/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0a0a0a",
        "bg-dark": "#0a0a0a",
        "bg-darker": "#050505",
        "bg-card": "#111111",
        "neon-cyan": "#00ffff",
        "neon-pink": "#ff00ff",
        "neon-green": "#00ff00",
        "neon-blue": "#0080ff",
        "neon-purple": "#8000ff",
        "neon-yellow": "#ffff00",
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)",
        "neon-pink": "0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)",
        "neon-green": "0 0 20px rgba(0, 255, 0, 0.5), 0 0 40px rgba(0, 255, 0, 0.3)",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
