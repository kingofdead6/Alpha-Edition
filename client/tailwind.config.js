/** Colours come from CSS variables in src/index.css so light/dark and the admin share one palette. */
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: token('--paper'),
        paper2: token('--paper-2'),
        ink: token('--ink'),
        muted: token('--muted'),
        line: token('--line'),
        cloth: token('--cloth'),
        clothink: token('--cloth-ink'),
        gilt: token('--gilt'),
        proof: token('--proof'),
        page: token('--page'),
        pageink: token('--page-ink'),
        ok: token('--ok'),
        warn: token('--warn'),
        info: token('--info'),
      },
      fontFamily: {
        display: 'var(--f-display)',
        body: 'var(--f-body)',
        mono: 'var(--f-mono)',
        hand: 'var(--f-hand)',
        read: 'var(--f-read)',
      },
      maxWidth: { site: '1220px' },
      transitionTimingFunction: { book: 'cubic-bezier(.2,.8,.2,1)' },
    },
  },
  plugins: [],
};
