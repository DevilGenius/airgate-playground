import type { CSSProperties } from 'react';
import { cssVar } from '@devilgenius/airgate-theme';

const PLAYGROUND_COMPOSER_TEXTAREA_HEIGHT = 88;

export const keyframes = `
/* ── Playground layout / responsive variables ── */
[data-pg-aesthetic] {
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
  --pg-core-button-radius: var(--ag-field-radius, 0.5rem);
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

@keyframes pg-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes pg-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pg-spin { to { transform: rotate(360deg); } }

[data-pg-aesthetic] {
  font-feature-settings: 'cv11' on, 'ss01' on;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

[data-pg-aesthetic] * { box-sizing: border-box; }

[data-pg-aesthetic] ::selection {
  background: var(--ag-primary-subtle);
  color: var(--ag-text);
}

[data-pg-aesthetic] textarea::placeholder {
  color: var(--ag-field-placeholder);
}

.pg-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--ag-scrollbar) transparent;
}
.pg-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.pg-scrollbar::-webkit-scrollbar-track { background: transparent; }
.pg-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--ag-scrollbar);
  border-radius: 10px;
}
.pg-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in oklab, var(--ag-scrollbar) 76%, var(--ag-text) 24%);
}

.pg-conv-delete {
  opacity: 0;
  color: var(--ag-text-tertiary);
  transition: opacity 120ms ease, background 120ms ease, color 120ms ease;
}
.pg-conv-item:hover .pg-conv-delete,
.pg-conv-item:focus-within .pg-conv-delete { opacity: 1; }
.pg-conv-delete:hover {
  background: color-mix(in oklab, var(--ag-danger) 10%, transparent);
  color: var(--ag-danger);
}
.pg-conv-delete:focus-visible {
  opacity: 1;
  outline: 1.5px solid var(--ag-border-focus);
  outline-offset: 1px;
}

.pg-conv-item { position: relative; background: var(--pg-conv-bg, transparent); }
.pg-conv-item:hover,
.pg-sidebar-action:hover {
  --pg-conv-bg: var(--ag-bg-hover);
  --pg-sidebar-action-bg: var(--ag-bg-hover);
  --pg-sidebar-action-color: var(--ag-text);
}
.pg-conv-item.is-active { --pg-conv-bg: var(--ag-bg-active); }
.pg-sidebar-action:focus-visible {
  outline: 1.5px solid var(--ag-border-focus);
  outline-offset: 2px;
}
.pg-conv-open:focus-visible {
  outline: 1.5px solid var(--ag-border-focus);
  outline-offset: 2px;
  border-radius: var(--ag-field-radius, 0.5rem);
}
.pg-conversation-tabs [role="tablist"]::-webkit-scrollbar { display: none; }
.pg-conversation-tab:hover {
  background: var(--ag-bg-hover);
  color: var(--ag-text);
}
.pg-conversation-tabs button:focus-visible {
  outline: 1.5px solid var(--ag-border-focus);
  outline-offset: 2px;
}

[data-pg-aesthetic] :focus-visible {
  outline: 1.5px solid var(--ag-border-focus);
  outline-offset: 2px;
}

.pg-input-wrapper:focus-within {
  border-color: var(--ag-border-focus);
  box-shadow:
    var(--ag-shadow-sm, 0 0 0 0 transparent),
    0 0 0 1px color-mix(in oklab, var(--ag-primary) 18%, transparent);
}

.pg-composer-select { color-scheme: light; }
[data-theme="dark"] .pg-composer-select, .dark .pg-composer-select { color-scheme: dark; }
.pg-composer-select:hover {
  --pg-select-bg: color-mix(in oklab, var(--ag-field-background) 86%, var(--ag-surface) 14%);
  --pg-select-border: color-mix(in oklab, var(--ag-border) 92%, var(--ag-text) 8%);
  --pg-select-color: var(--ag-field-foreground);
}
.pg-composer-select:focus { outline: none; }
.pg-composer-select:focus-visible {
  --pg-select-bg: color-mix(in oklab, var(--ag-field-background) 72%, var(--ag-surface) 28%);
  --pg-select-border: var(--ag-border-focus);
  box-shadow: var(--ag-shadow-sm, 0 0 0 0 transparent), 0 0 0 1px var(--ag-border-focus);
}
.pg-composer-select option {
  background: var(--ag-field-background);
  color: var(--ag-text);
}

.pg-selectors::-webkit-scrollbar { display: none; }

.pg-input-action:hover {
  --pg-input-action-bg: var(--ag-bg-hover);
  --pg-input-action-color: var(--ag-text);
}

.pg-input-action:focus-visible,
.pg-send-action:focus-visible {
  outline: 1.5px solid var(--ag-border-focus);
  outline-offset: 2px;
}

.pg-send-action:hover { --pg-send-bg: var(--ag-primary-hover); }
.pg-stop-action:hover { --pg-stop-bg: color-mix(in oklab, var(--ag-danger) 88%, var(--ag-bg) 12%); }

.pg-send-label, .pg-stop-label { display: none; }

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
  .pg-input-action-label { display: none; }
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
    background: cssVar('bg'),
    fontFamily: cssVar('fontSans'),
    color: cssVar('text'),
    overflow: 'hidden',
  },
  // ── Sidebar ──
  sidebar: {
    width: 'var(--pg-sidebar-width)',
    minWidth: 'var(--pg-sidebar-width)',
    maxWidth: 'var(--pg-sidebar-width)',
    display: 'var(--pg-sidebar-display)' as CSSProperties['display'],
    flexDirection: 'column',
    minHeight: 0,
    background: cssVar('bg'),
    borderRight: `1px solid color-mix(in oklab, ${cssVar('border')} 28%, transparent)`,
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
    borderRadius: cssVar('fieldRadius'),
    background: 'var(--pg-sidebar-action-bg, transparent)',
    color: 'var(--pg-sidebar-action-color, var(--ag-text))',
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
    borderRadius: cssVar('fieldRadius'),
    background: 'var(--pg-conv-bg, transparent)',
    transition: cssVar('transition'),
    margin: '2px 0',
    color: cssVar('text'),
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
    color: cssVar('textTertiary'),
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
    background: cssVar('bg'),
  },
  chatView: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    background: cssVar('bg'),
  },
  conversationTabs: {
    display: 'var(--pg-conversation-tabs-display)' as CSSProperties['display'],
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    padding: '7px 10px',
    borderBottom: `1px solid color-mix(in oklab, ${cssVar('border')} 28%, transparent)`,
    background: cssVar('bg'),
    flexShrink: 0,
  },
  tabsNewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    border: `1px solid ${cssVar('border')}`,
    borderRadius: cssVar('fieldRadius'),
    background: cssVar('fieldBackground'),
    color: cssVar('text'),
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
    scrollbarWidth: 'none' as CSSProperties['scrollbarWidth'],
  },
  conversationTabItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    maxWidth: 180,
    minWidth: 92,
   height: 34,
   padding: '0 4px 0 11px',
    border: '1px solid transparent',
   borderRadius: cssVar('fieldRadius'),
    background: 'transparent',
    color: cssVar('textSecondary'),
   flex: '0 0 auto',
 },
 conversationTabItemActive: {
    background: cssVar('bgHover'),
    color: cssVar('text'),
    borderColor: cssVar('border'),
  },
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
    width: 22,
    height: 22,
    border: 'none',
    borderRadius: 999,
    background: 'transparent',
    color: cssVar('textTertiary'),
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    transition: cssVar('transition'),
  },
  emptyTabs: {
    color: cssVar('textTertiary'),
    fontSize: 12,
    padding: '0 8px',
    whiteSpace: 'nowrap',
  },
  // ── Messages ──
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
    paddingTop: 'var(--pg-msg-area-padding-top)',
    background: cssVar('bg'),
    scrollbarWidth: 'thin' as CSSProperties['scrollbarWidth'],
    scrollbarColor: `${cssVar('scrollbar')} transparent`,
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
    border: `1px solid ${cssVar('border')}`,
    background: cssVar('fieldBackground'),
    color: cssVar('text'),
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0,
  },
  emptyTitle: {
    fontSize: 34,
    fontWeight: 500,
    color: cssVar('text'),
    lineHeight: 1.18,
    letterSpacing: 0,
    margin: 0,
  },
  emptyDesc: {
    fontSize: 14,
    color: cssVar('textTertiary'),
    lineHeight: 1.55,
    margin: 0,
  },
  emptyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 18px',
    border: 'none',
    borderRadius: 999,
    background: cssVar('primary'),
    color: cssVar('primaryForeground'),
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: cssVar('transition'),
    marginTop: 12,
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    maxWidth: 'var(--pg-msg-row-max-w)',
    margin: '0 auto',
    padding: 'var(--pg-msg-row-padding)',
  },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAssistant: { justifyContent: 'flex-start' },
  messageStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
    maxWidth: 'var(--pg-msg-bubble-max-w)',
  },
  messageStackUser: { alignItems: 'flex-end' },
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
    background: cssVar('primary'),
    color: cssVar('primaryForeground'),
    borderColor: 'transparent',
    boxShadow: cssVar('shadowSm'),
  },
  assistantBlock: {
    width: '100%',
    padding: '6px 2px',
    background: 'transparent',
    color: cssVar('text'),
    borderColor: 'transparent',
  },
  messageCopyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    border: 'none',
    borderRadius: cssVar('fieldRadius'),
    background: 'transparent',
    color: cssVar('textTertiary'),
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
  messageActionRowLeft: { justifyContent: 'flex-start', marginLeft: 0, marginRight: 'auto' },
  messageCopyUnderBubbleBtn: {
    width: 28,
    height: 28,
    borderRadius: cssVar('fieldRadius'),
    background: 'transparent',
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 1.8,
    wordBreak: 'break-word',
    color: 'inherit',
  },
  markdownParagraph: { margin: '0 0 11px' },
  markdownH1: { margin: '4px 0 14px', fontSize: 22, fontWeight: 600, lineHeight: 1.25, letterSpacing: 0, color: cssVar('text') },
  markdownH2: { margin: '18px 0 10px', fontSize: 18, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0, color: cssVar('text') },
  markdownH3: { margin: '16px 0 8px', fontSize: 15, fontWeight: 600, lineHeight: 1.35, color: cssVar('text') },
  markdownH4: { margin: '14px 0 8px', fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: cssVar('text') },
  markdownList: { margin: '0 0 12px', paddingLeft: 20, color: cssVar('text') },
  markdownListItem: { margin: '4px 0' },
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
    borderRadius: cssVar('fieldRadius'),
    background: cssVar('bgElevated'),
    border: `1px solid ${cssVar('border')}`,
    color: cssVar('text'),
    fontFamily: cssVar('fontMono'),
    fontSize: 12.5,
    lineHeight: 1.72,
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  markdownInlineCode: {
    padding: '1px 5px 2px',
    borderRadius: 6,
    background: cssVar('bgHover'),
    border: `1px solid ${cssVar('borderSubtle')}`,
    color: cssVar('text'),
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
    borderRadius: cssVar('fieldRadius'),
    background: cssVar('fieldBackground'),
    border: `1px solid ${cssVar('border')}`,
    color: cssVar('text'),
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  markdownLink: {
    color: cssVar('info'),
    textDecoration: 'underline',
    textDecorationColor: 'currentColor',
    textUnderlineOffset: 3,
  },
  markdownDivider: {
    height: 1,
    border: 0,
    background: cssVar('borderSubtle'),
    margin: '16px 0',
  },
  reasoningBox: {
    marginBottom: 10,
    padding: '10px 12px',
    borderRadius: cssVar('fieldRadius'),
    background: `color-mix(in oklab, ${cssVar('bgHover')} 24%, transparent)`,
    border: `1px solid ${cssVar('borderSubtle')}`,
  },
  reasoningSummary: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    color: cssVar('textSecondary'),
    userSelect: 'none',
  },
  reasoningContent: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.6,
    wordBreak: 'break-word',
    color: cssVar('textSecondary'),
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
    flex: 'var(--pg-image-frame-flex)' as CSSProperties['flex'],
    maxWidth: 'var(--pg-image-frame-max-w)' as CSSProperties['maxWidth'],
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
    fontFamily: cssVar('fontMono'),
    color: cssVar('textTertiary'),
    textAlign: 'center' as const,
  },
  generatedImage: {
    display: 'block',
    maxHeight: 420,
    width: '100%',
    height: 'auto',
    borderRadius: cssVar('fieldRadius'),
    border: `1px solid ${cssVar('border')}`,
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
    borderRadius: cssVar('fieldRadius'),
    border: `1px solid ${cssVar('border')}`,
    background: cssVar('bgElevated'),
    boxShadow: cssVar('shadowMd'),
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
    border: `1px solid ${cssVar('border')}`,
    borderRadius: 999,
    background: cssVar('glass'),
    color: cssVar('text'),
    fontSize: 34,
    lineHeight: 1,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    boxShadow: cssVar('shadowSm'),
  },
  imagePreviewCounter: {
    position: 'absolute',
    left: '50%',
    bottom: 12,
    transform: 'translateX(-50%)',
    padding: '5px 10px',
    borderRadius: 999,
    border: `1px solid ${cssVar('border')}`,
    background: cssVar('glass'),
    color: cssVar('textSecondary'),
    fontSize: 12,
    backdropFilter: 'blur(10px)',
    boxShadow: cssVar('shadowSm'),
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
    border: `1px solid ${cssVar('border')}`,
    borderRadius: 999,
    background: cssVar('glass'),
    color: cssVar('text'),
    fontSize: 22,
    lineHeight: 1,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    boxShadow: cssVar('shadowSm'),
  },
  imagePreviewLarge: {
    display: 'block',
    maxWidth: 'min(94vw, 1120px)',
    maxHeight: '90vh',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    background: cssVar('bgElevated'),
  },
  interactionNotice: {
    position: 'sticky',
    bottom: 12,
    alignSelf: 'center',
    zIndex: 4,
    padding: '7px 12px',
    borderRadius: 999,
    background: cssVar('bgElevated'),
    border: `1px solid ${cssVar('border')}`,
    color: cssVar('textSecondary'),
    fontSize: 12,
    boxShadow: cssVar('shadowSm'),
  },
  messageMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 0,
    fontSize: 11,
    color: cssVar('textTertiary'),
  },
  metaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 28,
    minHeight: 28,
    padding: '0 8px',
    borderRadius: cssVar('fieldRadius'),
    background: cssVar('fieldBackground'),
    border: `1px solid ${cssVar('borderSubtle')}`,
    fontSize: 11,
    fontFamily: cssVar('fontMono'),
    lineHeight: '26px',
    color: cssVar('textSecondary'),
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: cssVar('primary'),
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
    borderRadius: cssVar('fieldRadius'),
    background: cssVar('dangerSubtle'),
    color: cssVar('danger'),
    fontSize: 13,
    border: `1px solid color-mix(in oklab, ${cssVar('danger')} 28%, transparent)`,
  },
  errorMessage: { flex: 1, minWidth: 0 },
  recoverableBar: {
    background: cssVar('infoSubtle'),
    color: cssVar('info'),
    borderColor: `color-mix(in oklab, ${cssVar('info')} 22%, transparent)`,
  },
  errorRetryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    borderRadius: 999,
    border: `1px solid color-mix(in oklab, ${cssVar('danger')} 28%, transparent)`,
    background: `color-mix(in oklab, ${cssVar('danger')} 10%, transparent)`,
    color: cssVar('danger'),
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
    borderRadius: 999,
    border: `1px solid color-mix(in oklab, ${cssVar('info')} 24%, transparent)`,
    background: cssVar('infoSubtle'),
    color: cssVar('info'),
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
    border: `1px solid ${cssVar('border')}`,
    borderRadius: 26,
    background: cssVar('fieldBackground'),
    padding: 'var(--pg-input-wrapper-padding)',
    boxShadow: cssVar('shadowSm'),
    transition: 'box-shadow 200ms ease, border-color 150ms ease, background-color 150ms ease',
    width: '100%',
    maxWidth: 'var(--pg-input-wrapper-max-w)',
    margin: '0 auto',
  },
  inputWrapperStreaming: { borderColor: cssVar('border') },
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
    borderRadius: cssVar('fieldRadius'),
    overflow: 'hidden',
    border: `1px solid ${cssVar('borderSubtle')}`,
    background: `color-mix(in oklab, ${cssVar('bgHover')} 30%, transparent)`,
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
    border: `1px solid ${cssVar('borderSubtle')}`,
    borderRadius: 999,
    background: cssVar('glass'),
    color: cssVar('text'),
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
    color: cssVar('text'),
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
    alignItems: 'var(--pg-input-actions-align)' as CSSProperties['alignItems'],
    gap: 'var(--pg-input-actions-gap)',
    padding: '2px 0 0',
    flexDirection: 'var(--pg-input-actions-direction)' as CSSProperties['flexDirection'],
    minWidth: 0,
  },
  inputButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--pg-input-btn-gap)',
    width: 'var(--pg-input-btn-group-width)' as CSSProperties['width'],
    minWidth: 0,
    justifyContent: 'var(--pg-input-btn-group-justify)' as CSSProperties['justifyContent'],
    flexShrink: 0,
  },
  fileInput: { display: 'none' },
  attachBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    height: 'var(--pg-composer-control-height)',
    padding: 'var(--pg-input-btn-padding)',
    border: `1px solid ${cssVar('border')}`,
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--pg-input-action-bg, var(--ag-field-background))',
    color: 'var(--pg-input-action-color, var(--ag-text-secondary))',
    boxShadow: cssVar('shadowSm'),
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'background-color 80ms ease, border-color 80ms ease, color 80ms ease',
    minWidth: 'var(--pg-input-btn-min-w)' as CSSProperties['minWidth'],
    minHeight: 'var(--pg-input-btn-min-h)' as CSSProperties['minHeight'],
    justifyContent: 'var(--pg-input-btn-justify)' as CSSProperties['justifyContent'],
  },
  thinkingToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    height: 'var(--pg-composer-control-height)',
    padding: 'var(--pg-input-btn-padding)',
    border: `1px solid ${cssVar('border')}`,
    borderRadius: 'var(--pg-core-button-radius)',
    background: 'var(--pg-input-action-bg, var(--ag-field-background))',
    color: 'var(--pg-input-action-color, var(--ag-text-secondary))',
    boxShadow: cssVar('shadowSm'),
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'background-color 80ms ease, border-color 80ms ease, color 80ms ease',
    minWidth: 'var(--pg-input-btn-min-w)' as CSSProperties['minWidth'],
    minHeight: 'var(--pg-input-btn-min-h)' as CSSProperties['minHeight'],
    justifyContent: 'var(--pg-input-btn-justify)' as CSSProperties['justifyContent'],
  },
  thinkingToggleBtnActive: {
    background: cssVar('primarySubtle'),
    borderColor: `color-mix(in oklab, ${cssVar('primary')} 24%, ${cssVar('border')})`,
    color: cssVar('primary'),
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
    background: 'var(--pg-send-bg, var(--ag-primary))',
    color: cssVar('primaryForeground'),
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
    background: 'var(--pg-stop-bg, var(--ag-danger))',
    color: cssVar('dangerForeground'),
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
  selectors: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'var(--pg-selectors-wrap)' as CSSProperties['flexWrap'],
    gap: 'var(--pg-selectors-gap)',
    width: 'var(--pg-selectors-width)' as CSSProperties['width'],
    minWidth: 0,
  },
  selectTrigger: {
    display: 'block',
    width: 'auto',
    maxWidth: '100%',
    height: 'var(--pg-composer-control-height)',
    minHeight: 'var(--pg-composer-control-height)',
    padding: '0 12px',
    border: `1px solid var(--pg-select-border, ${cssVar('border')})`,
    borderRadius: cssVar('fieldRadius'),
    backgroundColor: 'var(--pg-select-bg, var(--ag-field-background))',
    backgroundClip: 'padding-box',
    color: 'var(--pg-select-color, var(--ag-field-foreground))',
    boxShadow: cssVar('shadowSm'),
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
    boxSizing: 'border-box',
    flexShrink: 1,
  },
};
