/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--bg-main)',
          card: 'var(--bg-card)',
          border: 'var(--border-card)',
          primary: 'var(--color-primary)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          sidebar: 'var(--bg-sidebar)',
          sidebarText: 'var(--text-sidebar)',
          sidebarMuted: 'var(--text-sidebar-muted)'
        }
      }
    },
  },
  plugins: [],
}
