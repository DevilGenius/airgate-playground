import type { CSSProperties } from 'react';
import type { Message } from './types';
import { copyableMessageText, generatedImages, hasCopyableMessageText } from './utils';
import { usePlayground } from './PlaygroundContext';
import { renderMessageContent } from './MessageRendering';
import { styles } from './styles';
import { InputArea } from './InputArea';

export function ChatView() {
  const {
    t,
    activeId,
    messages,
    isStreaming,
    isActiveConversationStreaming,
    streamContent,
    streamReasoning,
    error,
    retryRequest,
    hasRecoverableUserMessage,
    interactionNotice,
    thinkingVisible,
    messagesAreaRef,
    messagesEndRef,
    createConversation,
    regenerateLastResponse,
    regenerateUnfinishedResponse,
    handleMessageCopy,
    showImagePreview,
    interactiveMessageOptions,
  } = usePlayground();

  const renderCopyButton = (content: string, label = 'Copy message', preventToggle = false, buttonStyle: CSSProperties = {}) => (
    <button
      type="button"
      style={{ ...styles.messageCopyBtn, ...buttonStyle }}
      title={label}
      aria-label={label}
      onClick={(event) => {
        if (preventToggle) {
          event.preventDefault();
          event.stopPropagation();
        }
        handleMessageCopy(content);
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );

  const renderCopyableMessageContent = (content: string) => {
    const images = generatedImages(content);

    return (
      <div style={styles.messageContent}>
        {renderMessageContent(content, {
          ...interactiveMessageOptions,
          onImagePreview: images.length > 0 ? (_url, _alt, imageIndex) => showImagePreview(images, imageIndex) : undefined,
        })}
      </div>
    );
  };

  const renderMessageFooter = (content: string, model?: string, alignLeft = false) => {
    const showCopyButton = hasCopyableMessageText(content);
    if (!model && !showCopyButton) return null;

    return (
      <div style={styles.messageFooterRow}>
        <div style={{
          ...styles.messageActionRow,
          ...(alignLeft ? styles.messageActionRowLeft : null),
        }}>
          {showCopyButton && renderCopyButton(copyableMessageText(content), 'Copy message', false, styles.messageCopyUnderBubbleBtn)}
          {model && <span style={styles.metaBadge}>{model}</span>}
        </div>
      </div>
    );
  };

  const renderMessageBubble = (msg: Message) => {
    const isUser = msg.role === 'user';
    return (
      <div
        key={msg.id}
        style={{
          ...styles.messageRow,
          ...(isUser ? styles.messageRowUser : styles.messageRowAssistant),
        }}
      >
        <div
          style={{
            ...styles.messageStack,
            ...(isUser ? styles.messageStackUser : styles.messageStackAssistant),
          }}
        >
          <div style={{
            ...styles.messageBubble,
            ...(isUser ? styles.userBubble : styles.assistantBlock),
          }}>
            {!isUser && msg.reasoning && thinkingVisible && (
              <details style={styles.reasoningBox} open>
                <summary style={styles.reasoningSummary}>
                  <span>{t('playground.thinking_title', { defaultValue: 'Thinking' })}</span>
                  {renderCopyButton(msg.reasoning, t('playground.copy_thinking', { defaultValue: 'Copy thinking' }), true)}
                </summary>
                <div style={styles.reasoningContent}>
                  {renderMessageContent(msg.reasoning, interactiveMessageOptions)}
                </div>
              </details>
            )}
            {renderCopyableMessageContent(msg.content)}
          </div>

          {renderMessageFooter(msg.content, !isUser ? msg.model : undefined, !isUser)}
        </div>
      </div>
    );
  };

  const renderStreamingMessage = () => (
    <div style={{
      ...styles.messageRow,
      ...styles.messageRowAssistant,
    }}>
      <div style={{ ...styles.messageStack, ...styles.messageStackAssistant }}>
        <div style={{ ...styles.messageBubble, ...styles.assistantBlock }}>
          {streamReasoning && thinkingVisible && (
            <details style={styles.reasoningBox} open>
              <summary style={styles.reasoningSummary}>
                <span>{t('playground.thinking_title', { defaultValue: 'Thinking' })}</span>
                {renderCopyButton(streamReasoning, t('playground.copy_thinking', { defaultValue: 'Copy thinking' }), true)}
              </summary>
              <div style={styles.reasoningContent}>
                {renderMessageContent(streamReasoning, interactiveMessageOptions)}
              </div>
            </details>
          )}
          {streamContent ? (
            renderCopyableMessageContent(streamContent)
          ) : !streamReasoning || !thinkingVisible ? (
            <div style={{ ...styles.messageContent, opacity: 0.5 }}>
              <span style={styles.thinkingDots}>{t('playground.thinking')}</span>
            </div>
          ) : null}
        </div>
        {streamContent && (
          <div style={styles.messageFooterRow}>
            <div style={styles.messageMeta}>
              <span style={styles.streamingDot} />
              <span>{t('playground.streaming')}</span>
            </div>
            <div style={{ ...styles.messageActionRow, ...styles.messageActionRowLeft }}>
              {renderCopyButton(copyableMessageText(streamContent), 'Copy message', false, styles.messageCopyUnderBubbleBtn)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.chatView}>
      <div ref={messagesAreaRef} style={styles.messagesArea} className="pg-scrollbar">
        <main style={styles.messagesInner}>
          {!activeId && (
            <div style={styles.emptyState}>
              <div style={styles.emptyLogo}>AI</div>
              <div style={styles.emptyTitle}>{t('playground.empty_title')}</div>
              <div style={styles.emptyDesc}>{t('playground.empty_description')}</div>
              <button style={styles.emptyBtn} onClick={createConversation}>
                {t('playground.new_conversation')}
              </button>
            </div>
          )}

          {activeId && messages.map(renderMessageBubble)}

          {isActiveConversationStreaming && renderStreamingMessage()}

          {hasRecoverableUserMessage && (
            <div style={{ ...styles.errorBar, ...styles.recoverableBar }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <span style={styles.errorMessage}>{t('playground.response_unfinished', { defaultValue: 'Response was interrupted before the assistant replied.' })}</span>
              <button
                type="button"
                style={styles.recoverableRetryBtn}
                onClick={regenerateUnfinishedResponse}
                title={t('playground.regenerate')}
                aria-label={t('playground.regenerate')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 1-15.6 6" />
                  <path d="M3 12a9 9 0 0 1 15.6-6" />
                  <path d="M19 2v4h-4" />
                  <path d="M5 22v-4h4" />
                </svg>
                {t('playground.regenerate')}
              </button>
            </div>
          )}

          {error && (
            <div style={styles.errorBar}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <span style={styles.errorMessage}>{error}</span>
              {retryRequest && retryRequest.conversationID === activeId && !isStreaming && (
                <button
                  type="button"
                  style={styles.errorRetryBtn}
                  onClick={regenerateLastResponse}
                  title={t('playground.regenerate')}
                  aria-label={t('playground.regenerate')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 1-15.6 6" />
                    <path d="M3 12a9 9 0 0 1 15.6-6" />
                    <path d="M19 2v4h-4" />
                    <path d="M5 22v-4h4" />
                  </svg>
                  {t('playground.regenerate')}
                </button>
              )}
            </div>
          )}

          {interactionNotice && (
            <div style={styles.interactionNotice}>{interactionNotice}</div>
          )}

          <div ref={messagesEndRef} />
        </main>
      </div>

      {activeId && <InputArea />}
    </div>
  );
}
