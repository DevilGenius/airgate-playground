import type { CSSProperties } from 'react';
import { cssVar } from '@devilgenius/airgate-theme';

const PLAYGROUND_COMPOSER_TEXTAREA_HEIGHT = 88;

export const keyframes = `
/* ==========================================================================
   AirGate Playground — Design token defaults & responsive variables
   ========================================================================== */

/*
  Scoped defaults ensure graceful degradation without changing the host
  AirGate shell menu or topbar. They mirror AMC-WebUI's pearl palette.
*/
[data-pg-aesthetic] {
  /* ── AMC-WebUI pearl theme tokens ── */
  --theme-bg-primary: #ffffff;
  --theme-bg-secondary: #f9f9f9;
  --theme-bg-tertiary: #ececf1;
  --theme-bg-input: #ffffff;
  --theme-bg-accent: #40414f;
  --theme-bg-accent-hover: #202123;
  --theme-bg-danger: #df3434;
  --theme-bg-danger-hover: #b32929;
  --theme-bg-code-block: #f7f7f8;
  --theme-bg-user-message: #f3f4f6;
  --theme-bg-user-message-text: #000000;
  --theme-bg-model-message: transparent;
  --theme-bg-error-message: #ffeeee;
  --theme-bg-error-message-text: #df3434;
  --theme-bg-success: rgba(22, 163, 74, 0.1);
  --theme-bg-info: rgba(64, 65, 79, 0.05);

  --theme-text-primary: #000000;
  --theme-text-secondary: #000000;
  --theme-text-tertiary: #666666;
  --theme-text-accent: #ffffff;
  --theme-text-danger: #df3434;
  --theme-text-link: #2563eb;
  --theme-text-code: #000000;
  --theme-text-success: #16a34a;

  --theme-border-primary: #e5e5e5;
  --theme-border-secondary: #d9d9e3;
  --theme-border-focus: #40414f;
  --theme-scrollbar-thumb: #d9d9e3;

  --theme-icon-history: #000000;
  --theme-icon-attach: #323232;
  --theme-icon-stop: #ffffff;
  --theme-icon-settings: #000000;

  /* ── AirGate token bridge scoped by inherited values ── */
  --ag-bg: var(--theme-bg-secondary);
  --ag-bg-deep: var(--theme-bg-secondary);
  --ag-bg-surface: var(--theme-bg-secondary);
  --ag-bg-elevated: var(--theme-bg-primary);
  --ag-bg-hover: var(--theme-bg-tertiary);

  --ag-text: var(--theme-text-primary);
  --ag-text-secondary: var(--theme-text-secondary);
  --ag-text-tertiary: var(--theme-text-tertiary);
  --ag-text-inverse: var(--theme-text-accent);

  --ag-primary: var(--theme-bg-accent);
  --ag-primary-subtle: color-mix(in srgb, var(--theme-bg-accent) 10%, transparent);
  --ag-primary-hover: var(--theme-bg-accent-hover);

  --ag-danger: var(--theme-text-danger);
  --ag-danger-subtle: color-mix(in srgb, var(--theme-bg-danger) 10%, transparent);

  --ag-success: var(--theme-text-success);
  --ag-success-subtle: var(--theme-bg-success);

  --ag-border: var(--theme-border-secondary);
  --ag-border-subtle: var(--theme-border-primary);
  --ag-border-focus: var(--theme-border-focus);

  --ag-glass: color-mix(in srgb, var(--theme-bg-primary) 88%, transparent);
  --ag-glass-border: var(--theme-border-secondary);

  --ag-radius-sm: 8px;
  --ag-radius-md: 12px;
  --ag-radius-lg: 16px;

  --ag-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --ag-shadow-md: 0 10px 24px rgba(0, 0, 0, 0.10);
  --ag-shadow-lg: 0 18px 48px rgba(0, 0, 0, 0.16);

  --ag-transition: 150ms ease;

  --ag-font-sans: "Fira Code", ui-monospace, "SFMono-Regular", "SF Mono", "Cascadia Code", Consolas, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --ag-font-mono: "Fira Code", ui-monospace, "SFMono-Regular", "SF Mono", "Cascadia Code", Consolas, "Liberation Mono", Menlo, Monaco, "Courier New", monospace;

  /* ── Playground responsive properties (desktop defaults) ── */
  --pg-sidebar-width: 320px;
  --pg-sidebar-display: flex;
  --pg-conversation-tabs-display: none;
  --pg-msg-area-padding-top: 0;
  --pg-chat-max-w: 68rem;
  --pg-msg-row-padding: 12px 14px;
  --pg-msg-row-max-w: 100%;
  --pg-msg-bubble-max-w: min(80%, 64rem);
  --pg-assistant-bubble-max-w: min(calc(100% - 2.5rem), 64rem);
  --pg-user-bubble-padding: 12px 16px;
  --pg-user-bubble-radius: 18px 18px 4px 18px;
  --pg-empty-padding: 40px 24px 120px;
  --pg-empty-gap: 18px;
  --pg-input-area-padding: 0 0 calc(env(safe-area-inset-bottom, 0px) + 16px);
  --pg-input-wrapper-max-w: var(--pg-chat-max-w);
  --pg-input-wrapper-padding: 8px 12px;
  --pg-composer-control-height: 40px;
  --pg-input-actions-gap: 10px;
  --pg-input-actions-direction: row;
  --pg-input-actions-align: center;
  --pg-input-btn-group-width: auto;
  --pg-input-btn-group-justify: flex-start;
  --pg-input-btn-gap: 8px;
  --pg-input-btn-min-w: auto;
  --pg-input-btn-min-h: var(--pg-composer-control-height);
  --pg-input-btn-padding: 0 12px;
  --pg-input-btn-justify: center;
  --pg-core-button-radius: var(--field-radius, 0.5rem);
  --pg-selectors-wrap: nowrap;
  --pg-selectors-width: auto;
  --pg-selectors-gap: 8px;
  --pg-model-select-min-w: 188px;
  --pg-model-select-max-w: 280px;
  --pg-reasoning-select-min-w: 112px;
  --pg-reasoning-select-max-w: 132px;
  --pg-image-group-gap: 12px;
  --pg-image-frame-flex: 1 1 180px;
  --pg-image-frame-max-w: min(100%, 320px);
  --pg-error-bar-margin: 8px auto;
  --pg-error-bar-max-w: 44.35rem;
}

/* ── Dark theme overrides ── */
[data-theme="dark"] [data-pg-aesthetic],
.dark [data-pg-aesthetic],
[data-pg-aesthetic][data-theme="dark"] {
  --theme-bg-primary: #09090b;
  --theme-bg-secondary: #000000;
  --theme-bg-tertiary: #18181b;
  --theme-bg-input: #121214;
  --theme-bg-accent: #3b82f6;
  --theme-bg-accent-hover: #2563eb;
  --theme-bg-danger: #7f1d1d;
  --theme-bg-danger-hover: #991b1b;
  --theme-bg-code-block: #121214;
  --theme-bg-user-message: #2563eb;
  --theme-bg-user-message-text: #ffffff;
  --theme-bg-model-message: transparent;
  --theme-bg-error-message: rgba(127, 29, 29, 0.25);
  --theme-bg-error-message-text: #fca5a5;
  --theme-bg-success: rgba(6, 78, 59, 0.25);
  --theme-bg-info: rgba(30, 58, 138, 0.25);

  --theme-text-primary: #f4f4f5;
  --theme-text-secondary: #a1a1aa;
  --theme-text-tertiary: #52525b;
  --theme-text-accent: #ffffff;
  --theme-text-danger: #fca5a5;
  --theme-text-link: #38bdf8;
  --theme-text-code: #e4e4e7;
  --theme-text-success: #4ade80;

  --theme-border-primary: #18181b;
  --theme-border-secondary: #27272a;
  --theme-border-focus: #3b82f6;
  --theme-scrollbar-thumb: #27272a;

  --theme-icon-history: #a1a1aa;
  --theme-icon-attach: #a1a1aa;
  --theme-icon-stop: #ffffff;
  --theme-icon-settings: #a1a1aa;

  --ag-shadow-sm: 0 0 0 0 transparent;
  --ag-shadow-md: 0 0 0 0 transparent;
  --ag-shadow-lg: 0 0 1px rgba(255, 255, 255, 0.3) inset;
}

/* ── Mobile responsive overrides (≤ 960px) ── */
@media (max-width: 960px) {
  [data-pg-aesthetic] {
    --pg-sidebar-display: none;
    --pg-conversation-tabs-display: flex;
    --pg-msg-area-padding-top: 6px;
    --pg-msg-row-padding: 10px 8px;
    --pg-msg-row-max-w: 100%;
    --pg-msg-bubble-max-w: calc(100% - 28px);
    --pg-assistant-bubble-max-w: calc(100% - 8px);
    --pg-user-bubble-padding: 10px 13px;
    --pg-user-bubble-radius: 16px 16px 4px 16px;
    --pg-empty-padding: 32px 18px 96px;
    --pg-empty-gap: 12px;
    --pg-input-area-padding: 0 8px calc(env(safe-area-inset-bottom, 0px) + 10px);
    --pg-input-wrapper-max-w: 100%;
    --pg-input-wrapper-padding: 7px 10px;
    --pg-input-actions-gap: 8px;
    --pg-input-actions-direction: row;
    --pg-input-actions-align: center;
    --pg-input-btn-group-width: auto;
    --pg-input-btn-group-justify: flex-end;
    --pg-input-btn-gap: 6px;
    --pg-input-btn-min-w: 40px;
    --pg-input-btn-min-h: var(--pg-composer-control-height);
    --pg-input-btn-padding: 0 10px;
    --pg-input-btn-justify: center;
    --pg-selectors-wrap: nowrap;
    --pg-selectors-width: auto;
    --pg-selectors-gap: 6px;
    --pg-model-select-min-w: 150px;
    --pg-model-select-max-w: 48vw;
    --pg-reasoning-select-min-w: 96px;
    --pg-reasoning-select-max-w: 112px;
    --pg-image-group-gap: 8px;
    --pg-image-frame-flex: 1 1 140px;
    --pg-image-frame-max-w: min(100%, 240px);
    --pg-error-bar-margin: 8px;
    --pg-error-bar-max-w: none;
  }
}

/* ── Animations ── */
@keyframes pg-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes pg-fadein {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pg-spin {
  to { transform: rotate(360deg); }
}

/* ── Aesthetic baseline ── */
[data-pg-aesthetic] {
  font-feature-settings: 'cv11' on, 'ss01' on;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

[data-pg-aesthetic] * {
  box-sizing: border-box;
}

[data-pg-aesthetic] ::selection {
  background: #fde047;
  color: #1f2937;
}

[data-pg-aesthetic] textarea::placeholder {
  color: var(--theme-text-tertiary, #666666);
}

.pg-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--theme-scrollbar-thumb, #d9d9e3) transparent;
}
.pg-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.pg-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.pg-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--theme-scrollbar-thumb, #d9d9e3);
  border-radius: 10px;
}
.pg-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--theme-border-focus, #40414f);
}

/* ── Sidebar / conversation item interactions ── */
.pg-conv-delete {
  opacity: 0;
  color: var(--theme-text-tertiary, #666666);
  transition: opacity 120ms ease, background 120ms ease, color 120ms ease;
}
.pg-conv-item:hover .pg-conv-delete,
.pg-conv-item:focus-within .pg-conv-delete {
  opacity: 1;
}
.pg-conv-delete:hover {
  background: color-mix(in srgb, var(--theme-bg-danger, #df3434) 10%, transparent);
  color: var(--theme-text-danger, #df3434);
}
.pg-conv-delete:focus-visible {
  opacity: 1;
  outline: 2px solid var(--theme-border-focus, #40414f);
  outline-offset: 1px;
}

.pg-conv-item {
  position: relative;
  background: var(--pg-conv-bg, transparent);
}
.pg-conv-item:hover,
.pg-sidebar-action:hover {
  --pg-conv-bg: var(--theme-bg-tertiary, #ececf1);
  --pg-sidebar-action-bg: var(--theme-bg-tertiary, #ececf1);
  --pg-sidebar-action-color: var(--theme-text-primary, #000000);
}
.pg-conv-item.is-active {
  --pg-conv-bg: var(--theme-bg-tertiary, #ececf1);
}
.pg-sidebar-action:focus-visible {
  outline: 2px solid var(--theme-border-focus, #40414f);
  outline-offset: 2px;
}
.pg-conv-open:focus-visible {
  outline: 2px solid var(--theme-border-focus, #40414f);
  outline-offset: 2px;
  border-radius: 6px;
}
.pg-conversation-tabs [role="tablist"]::-webkit-scrollbar {
  display: none;
}
.pg-conversation-tab:hover {
  --pg-tab-bg: var(--theme-bg-tertiary, #ececf1);
  --pg-tab-color: var(--theme-text-primary, #000000);
}
.pg-conversation-tabs button:focus-visible {
  outline: 2px solid var(--theme-border-focus, #40414f);
  outline-offset: 2px;
}

/* ── Input wrapper focus ring ── */
.pg-input-wrapper:focus-within {
  --pg-input-border: color-mix(in oklab, var(--theme-bg-accent, #40414f) 18%, var(--theme-border-secondary, #d9d9e3));
  --pg-input-shadow:
    0 8px 40px rgba(0, 0, 0, 0.10),
    0 2px 12px rgba(0, 0, 0, 0.06),
    0 0 0 1px color-mix(in oklab, var(--theme-bg-accent, #40414f) 10%, transparent);
}

/* ── Native <select> styling ── */
.pg-composer-select {
  color-scheme: light;
}
[data-theme="dark"] .pg-composer-select,
.dark .pg-composer-select {
  color-scheme: dark;
}
.pg-composer-select:hover {
  --pg-select-bg: color-mix(in oklab, var(--field-background, var(--theme-bg-input, #ffffff)) 86%, var(--surface, var(--theme-bg-primary, #ffffff)) 14%);
  --pg-select-border: color-mix(in oklab, var(--border, var(--theme-border-secondary, #d9d9e3)) 92%, var(--foreground, var(--theme-text-primary, #000000)) 8%);
  --pg-select-color: var(--field-foreground, var(--theme-text-primary, #000000));
}
.pg-composer-select:focus {
  outline: none;
}
.pg-composer-select:focus-visible {
  --pg-select-bg: color-mix(in oklab, var(--field-background, var(--theme-bg-input, #ffffff)) 72%, var(--surface, var(--theme-bg-primary, #ffffff)) 28%);
  --pg-select-border: var(--focus, var(--theme-border-focus, #40414f));
  box-shadow: var(--field-shadow, none), 0 0 0 1px var(--focus, var(--theme-border-focus, #40414f));
}
.pg-composer-select option {
  background: var(--theme-bg-input, #ffffff);
  color: var(--theme-text-primary, #000000);
}

.pg-selectors::-webkit-scrollbar {
  display: none;
}

.pg-input-action:hover {
  --pg-input-action-bg: var(--theme-bg-tertiary, #ececf1);
  --pg-input-action-color: var(--theme-text-primary, #000000);
}

.pg-input-action:focus-visible,
.pg-send-action:focus-visible {
  outline: 2px solid var(--theme-border-focus, #40414f);
  outline-offset: 2px;
}

.pg-send-action:hover {
  --pg-send-bg: var(--theme-bg-accent-hover, #202123);
}

.pg-stop-action:hover {
  --pg-stop-bg: var(--theme-bg-danger-hover, #b32929);
}

.pg-send-label,
.pg-stop-label {
  display: none;
}

/* ── Compact mobile layout ── */
@media (max-width: 520px) {
  [data-pg-aesthetic] {
    --pg-msg-bubble-max-w: calc(100% - 18px);
    --pg-assistant-bubble-max-w: 100%;
    --pg-msg-row-padding: 9px 8px;
    --pg-input-area-padding: 0 8px calc(env(safe-area-inset-bottom, 0px) + 8px);
    --pg-input-btn-min-w: var(--pg-composer-control-height);
    --pg-input-btn-padding: 0;
    --pg-input-btn-gap: 6px;
    --pg-model-select-min-w: 138px;
    --pg-model-select-max-w: 46vw;
    --pg-reasoning-select-min-w: 92px;
    --pg-reasoning-select-max-w: 108px;
  }

  .pg-input-action-label {
    display: none;
  }
}
`;

export const styles: Record<string, CSSProperties> = {
  layout: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    isolation: 'isolate',
    background: 'var(--theme-bg-secondary)',
    fontFamily: cssVar('fontSans'),
    color: 'var(--theme-text-primary)',
    overflow: 'hidden',
  },
  // ── Sidebar ──
  sidebar: {
    width: 'var(--pg-sidebar-width)',
    minWidth: 'var(--pg-sidebar-width)',
    maxWidth: 'var(--pg-sidebar-width)',
    display: 'var(--pg-sidebar-display)' as any,
    flexDirection: 'column',
    minHeight: 0,
    background: 'var(--theme-bg-secondary)',
    borderRight: '1px solid var(--theme-border-primary)',
    position: 'relative',
    zIndex: 3,
    fontSynthesis: 'none',
    textRendering: 'geometricPrecision',
  },
  sidebarHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 4,
    padding: '12px 8px 8px',
  },
  sidebarTopbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    minWidth: 0,
    height: 36,
  },
  newBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    width: 'auto',
    minWidth: 0,
    minHeight: 36,
    gap: 8,
    padding: '8px 8px 8px 10px',
    border: 'none',
    borderRadius: 8,
    background: 'var(--pg-sidebar-action-bg, transparent)',
    color: 'var(--pg-sidebar-action-color, var(--theme-text-primary))',
    cursor: 'pointer',
    transition: cssVar('transition'),
    flexShrink: 0,
    fontFamily: cssVar('fontSans'),
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '20px',
    letterSpacing: 0,
  },
  newBtnIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    flexShrink: 0,
  },
  convList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 8px 12px',
  },
  convItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    padding: '8px 8px 8px 10px',
    borderRadius: 8,
    background: 'var(--pg-conv-bg, transparent)',
    transition: cssVar('transition'),
    margin: '2px 0',
    color: 'var(--theme-text-primary)',
  },
  convIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    flexShrink: 0,
    transition: cssVar('transition'),
  },
  convOpenBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontFamily: cssVar('fontSans'),
    textAlign: 'left' as const,
  },
  convTitle: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 14,
    lineHeight: '20px',
    letterSpacing: 0,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: 999,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
    marginTop: 0,
  },
  emptyConvList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '32px 16px',
    color: 'var(--theme-text-tertiary)',
    fontSize: 12,
  },
  // ── Main ──
  main: {
    position: 'relative' as const,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    background: 'var(--theme-bg-secondary)',
  },
  chatView: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    background: 'var(--theme-bg-secondary)',
  },
  conversationTabs: {
    display: 'var(--pg-conversation-tabs-display)' as any,
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    padding: '7px 10px',
    borderBottom: '1px solid var(--theme-border-primary)',
    background: 'var(--theme-bg-secondary)',
    flexShrink: 0,
  },
  tabsNewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    border: '1px solid var(--theme-border-secondary)',
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--theme-bg-input)',
    color: 'var(--theme-text-primary)',
    cursor: 'pointer',
    flexShrink: 0,
    transition: cssVar('transition'),
  },
  tabsScroller: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none' as any,
  },
  conversationTabItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    maxWidth: 180,
    minWidth: 92,
    height: 34,
    padding: '0 4px 0 11px',
    border: '1px solid var(--pg-tab-border, transparent)',
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--pg-tab-bg, transparent)',
    color: 'var(--pg-tab-color, var(--theme-text-secondary))',
    flex: '0 0 auto',
  },
  conversationTabItemActive: {
    '--pg-tab-bg': 'var(--theme-bg-tertiary)',
    '--pg-tab-color': 'var(--theme-text-primary)',
    '--pg-tab-border': 'var(--theme-border-secondary)',
  } as CSSProperties,
  conversationTabOpen: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    padding: 0,
    fontFamily: cssVar('fontSans'),
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '18px',
    letterSpacing: 0,
    textAlign: 'left' as const,
  },
  conversationTabClose: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    border: 'none',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--theme-text-tertiary)',
    cursor: 'pointer',
    flexShrink: 0,
    padding: 0,
  },
  emptyTabs: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 34,
    padding: '0 10px',
    color: 'var(--theme-text-tertiary)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  // ── Selectors (embedded in input card) ──
  selectors: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--pg-selectors-gap)',
    flexWrap: 'var(--pg-selectors-wrap)' as any,
    minWidth: 0,
    flex: '1 1 auto',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none' as any,
    width: 'var(--pg-selectors-width)' as any,
    maxWidth: '100%',
  },
  selectTrigger: {
    display: 'block',
    width: 'auto',
    maxWidth: '100%',
    height: 'var(--pg-composer-control-height)',
    minHeight: 'var(--pg-composer-control-height)',
    padding: '0 12px',
    border: '1px solid var(--pg-select-border, var(--field-border, var(--theme-border-secondary)))',
    borderRadius: 'var(--field-radius, 0.5rem)',
    backgroundColor: 'var(--pg-select-bg, var(--field-background, var(--theme-bg-input)))',
    backgroundClip: 'padding-box',
    color: 'var(--pg-select-color, var(--field-foreground, var(--theme-text-primary)))',
    boxShadow: 'var(--field-shadow, none)',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '20px',
    outline: 'none',
    appearance: 'auto',
    WebkitAppearance: 'menulist',
    cursor: 'pointer',
    transition: 'background-color 80ms ease, border-color 80ms ease, color 80ms ease, box-shadow 80ms ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  // ── Messages ──
  messagesArea: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
    paddingTop: 'var(--pg-msg-area-padding-top)',
    background: 'var(--theme-bg-secondary)',
    scrollbarWidth: 'thin' as any,
    scrollbarColor: 'var(--theme-scrollbar-thumb) transparent',
  },
  messagesInner: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 'var(--pg-chat-max-w)',
    minHeight: '100%',
    margin: '0 auto',
    padding: '12px 0 18px',
  },
  // ── Empty state ──
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 'var(--pg-empty-gap)',
    padding: 'var(--pg-empty-padding)',
    maxWidth: 820,
    margin: '0 auto',
    width: '100%',
    textAlign: 'center',
    animation: 'pg-fadein 0.4s ease-out',
  },
  emptyLogo: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 999,
    border: '1px solid var(--theme-border-secondary)',
    background: 'var(--theme-bg-input)',
    color: 'var(--theme-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0,
  },
  emptyTitle: {
    fontSize: 34,
    fontWeight: 500,
    color: 'var(--theme-text-primary)',
    lineHeight: 1.18,
    letterSpacing: 0,
    margin: 0,
  },
  emptyDesc: {
    fontSize: 14,
    color: 'var(--theme-text-tertiary)',
    lineHeight: 1.55,
    margin: 0,
  },
  emptyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 18px',
    border: 'none',
    borderRadius: 999,
    background: 'var(--theme-bg-accent)',
    color: 'var(--theme-text-accent)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: cssVar('transition'),
    marginTop: 12,
  },
  // ── Message row ──
  messageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    maxWidth: 'var(--pg-msg-row-max-w)',
    margin: '0 auto',
    padding: 'var(--pg-msg-row-padding)',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  messageStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
    maxWidth: 'var(--pg-msg-bubble-max-w)',
  },
  messageStackUser: {
    alignItems: 'flex-end',
  },
  messageStackAssistant: {
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: 'var(--pg-assistant-bubble-max-w)',
  },
  messageBubble: {
    minWidth: 0,
    maxWidth: '100%',
    borderRadius: 0,
    border: '1px solid transparent',
    boxShadow: 'none',
  },
  userBubble: {
    padding: 'var(--pg-user-bubble-padding)',
    borderRadius: 'var(--pg-user-bubble-radius)',
    background: 'var(--theme-bg-user-message)',
    color: 'var(--theme-bg-user-message-text)',
    borderColor: 'transparent',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  },
  assistantBlock: {
    width: '100%',
    padding: '6px 2px',
    background: 'transparent',
    color: 'var(--theme-text-primary)',
    borderColor: 'transparent',
  },
  messageCopyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--theme-text-tertiary)',
    cursor: 'pointer',
    transition: cssVar('transition'),
  },
  messageFooterRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    gap: 8,
    marginTop: 2,
  },
  messageActionRow: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginLeft: 'auto',
    minWidth: 0,
    flexShrink: 0,
  },
  messageActionRowLeft: {
    justifyContent: 'flex-start',
    marginLeft: 0,
    marginRight: 'auto',
  },
  messageCopyUnderBubbleBtn: {
    width: 28,
    height: 28,
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'transparent',
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 1.8,
    wordBreak: 'break-word',
    color: 'inherit',
  },
  markdownParagraph: {
    margin: '0 0 11px',
  },
  markdownH1: {
    margin: '4px 0 14px',
    fontSize: 22,
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: 0,
    color: 'var(--theme-text-primary)',
  },
  markdownH2: {
    margin: '18px 0 10px',
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: 0,
    color: 'var(--theme-text-primary)',
  },
  markdownH3: {
    margin: '16px 0 8px',
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.35,
    color: 'var(--theme-text-primary)',
  },
  markdownH4: {
    margin: '14px 0 8px',
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.4,
    color: 'var(--theme-text-primary)',
  },
  markdownList: {
    margin: '0 0 12px',
    paddingLeft: 20,
    color: 'var(--theme-text-primary)',
  },
  markdownListItem: {
    margin: '4px 0',
  },
  markdownBlockquote: {
    margin: '0 0 12px',
    padding: '9px 13px',
    borderLeft: '3px solid currentColor',
    borderRadius: 0,
    background: 'transparent',
    color: 'inherit',
    opacity: 0.85,
  },
  markdownCodeBlock: {
    margin: '4px 0 14px',
    padding: '13px 15px',
    borderRadius: 12,
    background: 'var(--theme-bg-code-block)',
    border: '1px solid var(--theme-border-secondary)',
    color: 'var(--theme-text-code)',
    fontFamily: cssVar('fontMono'),
    fontSize: 12.5,
    lineHeight: 1.72,
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  markdownInlineCode: {
    padding: '1px 5px 2px',
    borderRadius: 6,
    background: 'var(--theme-bg-info)',
    border: '1px solid var(--theme-bg-info)',
    color: 'var(--theme-text-link)',
    fontFamily: cssVar('fontMono'),
    fontSize: '0.9em',
  },
  markdownInlineMath: {
    display: 'inline-block',
    maxWidth: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    verticalAlign: '-0.18em',
  },
  markdownBlockMath: {
    margin: '4px 0 14px',
    padding: '12px 14px',
    borderRadius: 12,
    background: 'var(--theme-bg-input)',
    border: '1px solid var(--theme-border-secondary)',
    color: 'var(--theme-text-primary)',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  markdownLink: {
    color: 'var(--theme-text-link)',
    textDecoration: 'underline',
    textDecorationColor: 'currentColor',
    textUnderlineOffset: 3,
  },
  markdownDivider: {
    height: 1,
    border: 0,
    background: 'var(--theme-border-secondary)',
    margin: '16px 0',
  },
  reasoningBox: {
    marginBottom: 10,
    padding: '10px 12px',
    borderRadius: 14,
    background: 'color-mix(in srgb, var(--theme-bg-tertiary) 24%, transparent)',
    border: '1px solid var(--theme-border-secondary)',
  },
  reasoningSummary: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--theme-text-secondary)',
    userSelect: 'none',
  },
  reasoningContent: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.6,
    wordBreak: 'break-word',
    color: 'var(--theme-text-secondary)',
  },
  imageGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 'var(--pg-image-group-gap)',
    maxWidth: '100%',
    margin: '10px 0 6px',
  },
  generatedImageFrame: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    flex: 'var(--pg-image-frame-flex)' as any,
    maxWidth: 'var(--pg-image-frame-max-w)' as any,
    minWidth: 0,
  },
  generatedImagePreviewBtn: {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'zoom-in',
    textAlign: 'left',
    font: 'inherit',
  },
  generatedImageDimensions: {
    display: 'block',
    marginTop: 4,
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    color: 'var(--theme-text-tertiary)',
    textAlign: 'center' as const,
  },
  generatedImage: {
    display: 'block',
    maxHeight: 420,
    width: '100%',
    height: 'auto',
    borderRadius: 12,
    border: '1px solid var(--theme-border-secondary)',
    objectFit: 'contain',
  },
  imagePreviewOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: 'rgba(4, 7, 13, 0.78)',
    backdropFilter: 'blur(10px)',
  },
  imagePreviewModal: {
    position: 'relative',
    display: 'flex',
    maxWidth: 'min(94vw, 1120px)',
    maxHeight: '90vh',
    width: 'fit-content',
    borderRadius: 16,
    border: '1px solid var(--theme-border-secondary)',
    background: 'var(--theme-bg-primary)',
    boxShadow: '0 28px 90px rgba(0, 0, 0, 0.45)',
    overflow: 'hidden',
  },
  imagePreviewNavBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    border: '1px solid var(--theme-border-secondary)',
    borderRadius: '999px',
    background: cssVar('glass'),
    color: 'var(--theme-text-primary)',
    fontSize: 34,
    lineHeight: 1,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    boxShadow: cssVar('shadowMd'),
  },
  imagePreviewCounter: {
    position: 'absolute',
    left: '50%',
    bottom: 12,
    transform: 'translateX(-50%)',
    padding: '5px 10px',
    borderRadius: '999px',
    border: '1px solid var(--theme-border-secondary)',
    background: cssVar('glass'),
    color: 'var(--theme-text-secondary)',
    fontSize: 12,
    backdropFilter: 'blur(10px)',
    boxShadow: cssVar('shadowMd'),
  },
  imagePreviewCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    border: '1px solid var(--theme-border-secondary)',
    borderRadius: '999px',
    background: cssVar('glass'),
    color: 'var(--theme-text-primary)',
    fontSize: 22,
    lineHeight: 1,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    boxShadow: cssVar('shadowMd'),
  },
  imagePreviewLarge: {
    display: 'block',
    maxWidth: 'min(94vw, 1120px)',
    maxHeight: '90vh',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    background: 'var(--theme-bg-primary)',
  },
  interactionNotice: {
    position: 'sticky',
    bottom: 12,
    alignSelf: 'center',
    zIndex: 4,
    padding: '7px 12px',
    borderRadius: '999px',
    background: 'var(--theme-bg-primary)',
    border: '1px solid var(--theme-border-secondary)',
    color: 'var(--theme-text-secondary)',
    fontSize: 12,
    boxShadow: cssVar('shadowMd'),
  },
  messageMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 0,
    fontSize: 11,
    color: 'var(--theme-text-tertiary)',
  },
  metaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 28,
    minHeight: 28,
    padding: '0 8px',
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--theme-bg-input)',
    border: '1px solid var(--theme-border-secondary)',
    fontSize: 11,
    fontFamily: cssVar('fontMono'),
    lineHeight: '26px',
    color: 'var(--theme-text-secondary)',
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--theme-bg-accent)',
    animation: 'pg-pulse 1.2s ease-in-out infinite',
  },
  thinkingDots: {
    animation: 'pg-pulse 1.5s ease-in-out infinite',
  },
  // ── Error ──
  errorBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: 'var(--pg-error-bar-margin)',
    maxWidth: 'var(--pg-error-bar-max-w)',
    width: 'calc(100% - 28px)',
    padding: '10px 14px',
    borderRadius: 12,
    background: 'var(--theme-bg-error-message)',
    color: 'var(--theme-bg-error-message-text)',
    fontSize: 13,
    border: '1px solid color-mix(in srgb, var(--theme-bg-danger) 28%, transparent)',
  },
  errorMessage: {
    flex: 1,
    minWidth: 0,
  },
  recoverableBar: {
    background: 'var(--theme-bg-info)',
    color: 'var(--theme-text-link)',
    borderColor: 'color-mix(in srgb, var(--theme-text-link) 22%, transparent)',
  },
  errorRetryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    borderRadius: '999px',
    border: '1px solid color-mix(in srgb, var(--theme-bg-danger) 28%, transparent)',
    background: 'color-mix(in srgb, var(--theme-bg-danger) 10%, transparent)',
    color: 'var(--theme-text-danger)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: cssVar('fontSans'),
  },
  recoverableRetryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    borderRadius: '999px',
    border: '1px solid color-mix(in srgb, var(--theme-text-link) 24%, transparent)',
    background: 'var(--theme-bg-info)',
    color: 'var(--theme-text-link)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: cssVar('fontSans'),
  },
  // ── Input ──
  inputArea: {
    padding: 'var(--pg-input-area-padding)',
    background: 'transparent',
    borderTop: 'none',
    flexShrink: 0,
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    border: '1px solid var(--pg-input-border, var(--theme-border-secondary))',
    borderRadius: 26,
    background: 'var(--theme-bg-input)',
    padding: 'var(--pg-input-wrapper-padding)',
    boxShadow: 'var(--pg-input-shadow, 0 12px 28px rgba(0, 0, 0, 0.12))',
    transition: 'box-shadow 200ms ease, border-color 150ms ease, background-color 150ms ease',
    width: '100%',
    maxWidth: 'var(--pg-input-wrapper-max-w)',
    margin: '0 auto',
  },
  inputWrapperStreaming: {
    borderColor: 'var(--theme-border-secondary)',
  },
  imagePreviewList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    padding: '2px 4px 4px',
  },
  imagePreviewItem: {
    position: 'relative',
    width: 96,
    height: 96,
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid var(--theme-border-secondary)',
    background: 'color-mix(in srgb, var(--theme-bg-tertiary) 30%, transparent)',
    cursor: 'pointer',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    border: '1px solid var(--theme-border-secondary)',
    borderRadius: 999,
    background: cssVar('glass'),
    color: 'var(--theme-text-primary)',
    cursor: 'pointer',
    lineHeight: '20px',
    padding: 0,
    fontSize: 16,
  },
  textarea: {
    width: '100%',
    height: PLAYGROUND_COMPOSER_TEXTAREA_HEIGHT,
    minHeight: PLAYGROUND_COMPOSER_TEXTAREA_HEIGHT,
    maxHeight: PLAYGROUND_COMPOSER_TEXTAREA_HEIGHT,
    padding: '6px 4px 2px',
    border: 'none',
    background: 'transparent',
    color: 'var(--theme-text-primary)',
    fontSize: 16,
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    lineHeight: 1.5,
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  inputActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'var(--pg-input-actions-align)',
    gap: 'var(--pg-input-actions-gap)',
    padding: '2px 0 0',
    flexDirection: 'var(--pg-input-actions-direction)' as any,
    minWidth: 0,
  },
  inputButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--pg-input-btn-gap)',
    width: 'var(--pg-input-btn-group-width)' as any,
    minWidth: 0,
    justifyContent: 'var(--pg-input-btn-group-justify)' as any,
    flexShrink: 0,
  },
  fileInput: {
    display: 'none',
  },
  attachBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    height: 'var(--pg-composer-control-height)',
    padding: 'var(--pg-input-btn-padding)',
    border: '1px solid var(--field-border, var(--theme-border-secondary))',
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--pg-input-action-bg, var(--field-background, var(--theme-bg-input)))',
    color: 'var(--pg-input-action-color, var(--theme-icon-attach))',
    boxShadow: 'var(--field-shadow, none)',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'background-color 150ms ease, color 150ms ease, opacity 150ms ease',
    minWidth: 'var(--pg-input-btn-min-w)' as any,
    minHeight: 'var(--pg-input-btn-min-h)' as any,
    justifyContent: 'var(--pg-input-btn-justify)' as any,
  },
  thinkingToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    height: 'var(--pg-composer-control-height)',
    padding: 'var(--pg-input-btn-padding)',
    border: '1px solid var(--field-border, var(--theme-border-secondary))',
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--pg-input-action-bg, var(--field-background, var(--theme-bg-input)))',
    color: 'var(--pg-input-action-color, var(--theme-icon-settings))',
    boxShadow: 'var(--field-shadow, none)',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'background-color 150ms ease, color 150ms ease, opacity 150ms ease',
    minWidth: 'var(--pg-input-btn-min-w)' as any,
    minHeight: 'var(--pg-input-btn-min-h)' as any,
    justifyContent: 'var(--pg-input-btn-justify)' as any,
  },
  thinkingToggleBtnActive: {
    background: 'color-mix(in srgb, var(--theme-bg-accent) 10%, transparent)',
    borderColor: 'color-mix(in srgb, var(--theme-bg-accent) 24%, var(--field-border, var(--theme-border-secondary)))',
    color: 'var(--theme-text-link)',
  },
  sendBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    width: 'var(--pg-composer-control-height)',
    height: 'var(--pg-composer-control-height)',
    padding: 0,
    border: 'none',
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--pg-send-bg, var(--theme-bg-accent))',
    color: 'var(--theme-text-accent)',
    fontSize: 0,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'background-color 150ms ease, opacity 150ms ease, transform 150ms ease',
    minWidth: 'var(--pg-composer-control-height)',
    minHeight: 'var(--pg-composer-control-height)',
    flexShrink: 0,
  },
  stopBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    width: 'var(--pg-composer-control-height)',
    height: 'var(--pg-composer-control-height)',
    padding: 0,
    border: 'none',
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--pg-stop-bg, var(--theme-bg-danger))',
    color: 'var(--theme-icon-stop)',
    fontSize: 0,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    cursor: 'pointer',
    minWidth: 'var(--pg-composer-control-height)',
    minHeight: 'var(--pg-composer-control-height)',
    flexShrink: 0,
  },
};
