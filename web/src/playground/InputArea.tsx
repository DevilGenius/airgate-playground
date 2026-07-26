import { useEffect, useRef, useState } from 'react';
import type { ReasoningEffort, SelectOption } from './types';
import { usePlayground } from './PlaygroundContext';
import styles from './Playground.module.css';

const REASONING_OPTIONS: SelectOption[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'xhigh', label: 'XHigh' },
];

const GPT_5_6_REASONING_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'xhigh', label: 'XHigh' },
  { value: 'max', label: 'Max' },
];

function ComposerSelect({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find(option => option.value === value);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const select = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={`${styles.selectPicker} ${className || ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.selectTrigger}
        onClick={() => setOpen(value => !value)}
        onKeyDown={event => {
          if (event.key === 'Escape') setOpen(false);
        }}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={selected?.label || value}
      >
        <span>{selected?.label || value}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div ref={menuRef} className={styles.selectMenu} role="listbox" aria-label={ariaLabel}>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? styles.selectOptionActive : ''}
              onClick={() => select(option.value)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InputArea() {
  const {
    t,
    isActiveConversationStreaming,
    canSendMessage,
    input,
    setInput,
    handlePaste,
    handleKeyDown,
    pendingImages,
    removePendingImage,
    inputRef,
    fileInputRef,
    handleImageChange,
    selectedModel,
    modelOptions,
    setSelectedModel,
    selectedModelSupportsReasoning,
    reasoningEffort,
    setReasoningEffort,
    thinkingVisible,
    setThinkingVisible,
    triggerImagePicker,
    stopStreaming,
    sendMessage,
    selectedPlatform,
    selectedModelID,
  } = usePlayground();
  const reasoningOptions = selectedModelID.startsWith('gpt-5.6-')
    ? GPT_5_6_REASONING_OPTIONS
    : REASONING_OPTIONS;

  useEffect(() => {
    if (!selectedModelSupportsReasoning) return;
    if (reasoningOptions.some(option => option.value === reasoningEffort)) return;
    setReasoningEffort('medium');
  }, [reasoningEffort, reasoningOptions, selectedModelSupportsReasoning, setReasoningEffort]);

  return (
    <div className={styles.composerDock}>
      <div className={`${styles.composerRoot} ${isActiveConversationStreaming ? styles.composerRootStreaming : ''}`}>
        {pendingImages.length > 0 && (
          <div className={styles.pendingImageList}>
            {pendingImages.map(image => (
              <div
                key={image.id}
                className={`${styles.pendingImageItem} ${isActiveConversationStreaming ? styles.pendingImageItemDisabled : ''}`}
              >
                <img className={styles.pendingImage} src={image.url} alt={image.name} />
                <button
                  type="button"
                  className={styles.removeImageButton}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    removePendingImage(image.id);
                  }}
                  aria-label={`Remove ${image.name}`}
                  disabled={isActiveConversationStreaming}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={inputRef}
          className={styles.composerTextarea}
          value={input}
          onChange={event => setInput(event.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={t('playground.input_placeholder')}
          rows={5}
          disabled={isActiveConversationStreaming}
        />

        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          disabled={isActiveConversationStreaming}
        />

        <div className={styles.composerToolbar}>
          <div className={styles.composerToolbarLeft}>
            <div className={styles.selectGroup}>
              {selectedModelSupportsReasoning && (
                <ComposerSelect
                  className={styles.reasoningSelect}
                  value={reasoningEffort}
                  options={reasoningOptions}
                  onChange={value => setReasoningEffort(value as ReasoningEffort)}
                  ariaLabel="Reasoning effort"
                />
              )}

              <ComposerSelect
                className={styles.modelSelect}
                value={selectedModel}
                options={modelOptions}
                onChange={setSelectedModel}
                ariaLabel={t('playground.model')}
              />
            </div>
          </div>

          <div className={styles.composerToolbarRight}>
            <button
              type="button"
              className={`${styles.iconButton} ${thinkingVisible ? styles.iconButtonActive : ''}`}
              onMouseDown={event => event.preventDefault()}
              onClick={() => setThinkingVisible(value => !value)}
              title={thinkingVisible
                ? t('playground.hide_thinking', { defaultValue: 'Hide Thinking' })
                : t('playground.show_thinking', { defaultValue: 'Show Thinking' })}
              aria-label={thinkingVisible
                ? t('playground.hide_thinking', { defaultValue: 'Hide Thinking' })
                : t('playground.show_thinking', { defaultValue: 'Show Thinking' })}
              aria-pressed={thinkingVisible}
            >
              {thinkingVisible ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M8.5 14.5c-1.4-1.2-2.2-2.9-2.2-4.8a5.7 5.7 0 0 1 11.4 0c0 1.9-.8 3.6-2.2 4.8-.7.6-1.1 1.4-1.1 2.2H9.6c0-.8-.4-1.6-1.1-2.2Z" />
                  <path d="M12 1.8v1.8M4.6 4.6l1.3 1.3M19.4 4.6l-1.3 1.3M2 10h1.8M20.2 10H22" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M8.5 14.5c-1.4-1.2-2.2-2.9-2.2-4.8a5.7 5.7 0 0 1 9-4.6" />
                  <path d="M16.9 8.4c.5 2.2-.2 4.5-2.1 6.1-.7.6-1.1 1.4-1.1 2.2H9.6" />
                  <path d="M4 4l16 16" />
                </svg>
              )}
              <span className={styles.iconButtonLabel}>
                {t('playground.thinking_title', { defaultValue: 'Thinking' })}
              </span>
            </button>

            <button
              type="button"
              className={styles.iconButton}
              onMouseDown={event => event.preventDefault()}
              onClick={triggerImagePicker}
              disabled={isActiveConversationStreaming}
              title={t('playground.attach_images')}
              aria-label={t('playground.attach_images')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className={styles.iconButtonLabel}>
                {t('playground.image')}
              </span>
            </button>

            {isActiveConversationStreaming ? (
              <button
                type="button"
                className={styles.stopButton}
                onMouseDown={event => event.preventDefault()}
                onClick={stopStreaming}
                title={t('playground.stop')}
                aria-label={t('playground.stop')}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                  <rect x="2" y="2" width="8" height="8" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className={styles.sendButton}
                onMouseDown={event => event.preventDefault()}
                onClick={sendMessage}
                disabled={!canSendMessage}
                title={selectedPlatform && selectedModelID ? undefined : t('playground.select_model_first')}
                aria-label={t('playground.send')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
