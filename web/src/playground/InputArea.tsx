import type { ReasoningEffort } from './types';
import { usePlayground } from './PlaygroundContext';
import { styles } from './styles';

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
    renderNativeSelect,
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

  return (
    <div style={styles.inputArea}>
      <div style={{
        ...styles.inputWrapper,
        ...(isActiveConversationStreaming ? styles.inputWrapperStreaming : null),
      }} className="pg-input-wrapper">
        {pendingImages.length > 0 && (
          <div style={styles.imagePreviewList}>
            {pendingImages.map(image => (
              <div
                key={image.id}
                style={{
                  ...styles.imagePreviewItem,
                  ...(isActiveConversationStreaming ? { cursor: 'default', opacity: 0.6 } : null),
                }}
              >
                <img src={image.url} alt={image.name} style={styles.imagePreview} />
                <button
                  type="button"
                  style={styles.removeImageBtn}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    removePendingImage(image.id);
                  }}
                  aria-label={`Remove ${image.name}`}
                  disabled={isActiveConversationStreaming}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={inputRef}
          style={styles.textarea}
          value={input}
          onChange={event => setInput(event.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={t('playground.input_placeholder')}
          rows={4}
          disabled={isActiveConversationStreaming}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={styles.fileInput}
          onChange={handleImageChange}
          disabled={isActiveConversationStreaming}
        />

        <div style={styles.inputActions}>
          <div className="pg-selectors" style={styles.selectors}>
            {renderNativeSelect({
              id: 'model',
              value: selectedModel,
              options: modelOptions,
              onChange: setSelectedModel,
              ariaLabel: t('playground.model'),
            })}

            {selectedModelSupportsReasoning && renderNativeSelect({
              id: 'reasoning-effort',
              value: reasoningEffort,
              options: [
                { value: 'minimal', label: 'Minimal' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'xhigh', label: 'XHigh' },
              ],
              onChange: value => setReasoningEffort(value as ReasoningEffort),
              ariaLabel: 'Reasoning effort',
            })}
          </div>

          <div style={styles.inputButtonGroup}>
            <button
              type="button"
              className="pg-input-action"
              style={{
                ...styles.thinkingToggleBtn,
                ...(thinkingVisible ? styles.thinkingToggleBtnActive : null),
              }}
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
              <span className="pg-input-action-label">
                {t('playground.thinking_title', { defaultValue: 'Thinking' })}
              </span>
            </button>

            <button
              type="button"
              className="pg-input-action"
              style={styles.attachBtn}
              onMouseDown={event => event.preventDefault()}
              onClick={triggerImagePicker}
              disabled={isActiveConversationStreaming}
              title={t('playground.attach_images')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="pg-input-action-label">
                {t('playground.image')}
              </span>
            </button>

            {isActiveConversationStreaming ? (
              <button
                type="button"
                className="pg-send-action pg-stop-action"
                style={styles.stopBtn}
                onMouseDown={event => event.preventDefault()}
                onClick={stopStreaming}
                title={t('playground.stop')}
                aria-label={t('playground.stop')}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="2" y="2" width="8" height="8" rx="1" />
                </svg>
                <span className="pg-stop-label">{t('playground.stop')}</span>
              </button>
            ) : (
              <button
                type="button"
                className="pg-send-action"
                style={{
                  ...styles.sendBtn,
                  opacity: canSendMessage ? 1 : 0.4,
                }}
                onMouseDown={event => event.preventDefault()}
                onClick={sendMessage}
                disabled={!canSendMessage}
                title={selectedPlatform && selectedModelID ? undefined : t('playground.select_model_first')}
                aria-label={t('playground.send')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <span className="pg-send-label">{t('playground.send')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
