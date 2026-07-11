// src_revenue/utils/theme.js
// ─────────────────────────────────────────────────────────────────────────
// Shared design tokens for the Staff Details module.
// Each page keeps its own `const styles = {...}` object (per your request)
// but all of them pull colors/fonts from here so the four pages read as
// one coherent, premium, colourful-light system rather than four
// accidentally-different ones.
// ─────────────────────────────────────────────────────────────────────────

export const theme = {
  // base surfaces
  bg: '#F5F6FC',
  bgAlt: '#EEF1FB',
  surface: '#FFFFFF',
  border: '#E6E8F5',
  borderStrong: '#D8DBF0',

  // text
  textPrimary: '#1E2140',
  textSecondary: '#5B5F82',
  textMuted: '#9498B8',

  // brand accents — one per workflow, used consistently across pages
  indigo: '#4F46E5',
  indigoDark: '#4338CA',
  indigoLight: '#EEF0FE',

  emerald: '#059669',
  emeraldDark: '#047857',
  emeraldLight: '#E6F7F0',

  amber: '#D97706',
  amberDark: '#B45309',
  amberLight: '#FEF3E1',

  rose: '#E11D48',
  roseDark: '#BE123C',
  roseLight: '#FDEAEE',

  teal: '#0D9488',
  tealLight: '#E3F6F4',

  // status colors (staff lifecycle)
  statusActive: '#059669',
  statusActiveBg: '#E6F7F0',
  statusExtended: '#2563EB',
  statusExtendedBg: '#EAF1FE',
  statusResigned: '#DC2626',
  statusResignedBg: '#FDEDED',

  // fonts
  fontDisplay: "'Sora', 'Segoe UI', sans-serif",
  fontBody: "'Inter', 'Segoe UI', sans-serif",

  shadowSm: '0 2px 8px rgba(30, 33, 64, 0.06)',
  shadowMd: '0 8px 24px rgba(30, 33, 64, 0.08)',
  shadowLg: '0 18px 40px -12px rgba(79, 70, 229, 0.25)',

  radiusSm: '8px',
  radiusMd: '14px',
  radiusLg: '20px',
};

// Font import + small utilities that inline styles can't express
// (hover states, placeholders, focus rings, scrollbars). Mount this once
// per page via <style>{fontFaceAndUtilities}</style>.
export const fontFaceAndUtilities = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; }

  .sd-fade-in { animation: sdFadeIn .35s ease both; }
  @keyframes sdFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .sd-card-hover { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
  .sd-card-hover:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -12px rgba(79,70,229,0.25); }

  .sd-btn { transition: filter .15s ease, transform .1s ease; cursor: pointer; }
  .sd-btn:hover { filter: brightness(1.06); }
  .sd-btn:active { transform: scale(0.98); }
  .sd-btn:disabled { opacity: .55; cursor: not-allowed; }

  .sd-input:focus, .sd-select:focus, .sd-textarea:focus {
    outline: none;
    border-color: #4F46E5 !important;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.14);
  }

  .sd-row-hover:hover { background: #F7F8FD !important; }

  .sd-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .sd-scroll::-webkit-scrollbar-thumb { background: #D8DBF0; border-radius: 8px; }
  .sd-scroll::-webkit-scrollbar-track { background: transparent; }

  .sd-tab { cursor: pointer; transition: color .15s ease, border-color .15s ease; }
`;

export function statusMeta(status) {
  switch (status) {
    case 'extended':
      return { label: 'Extended', color: theme.statusExtended, bg: theme.statusExtendedBg };
    case 'resigned':
      return { label: 'Resigned', color: theme.statusResigned, bg: theme.statusResignedBg };
    case 'active':
    default:
      return { label: 'Present', color: theme.statusActive, bg: theme.statusActiveBg };
  }
}