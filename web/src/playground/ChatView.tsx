import type { Message } from './types';
import { copyableMessageText, generatedImages, hasCopyableMessageText } from './utils';
import { usePlayground } from './PlaygroundContext';
import { renderMessageContent } from './MessageRendering';
import { InputArea } from './InputArea';
import styles from './Playground.module.css';

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

  const renderCopyButton = (content: string, label = 'Copy message', preventToggle = false) => (
    <button
      type="button"
      className={styles.copyButton}
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
      <div className={styles.messageContent}>
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
      <div className={styles.messageFooter}>
        <div className={`${styles.messageActions} ${alignLeft ? styles.messageActionsLeft : ''}`}>
          {showCopyButton && renderCopyButton(copyableMessageText(content))}
          {model && <span className={styles.metaBadge}>{model}</span>}
        </div>
      </div>
    );
  };

  const renderMessageBubble = (msg: Message) => {
    const isUser = msg.role === 'user';
    return (
      <div
        key={msg.id}
        className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}
      >
        <div className={`${styles.messageStack} ${isUser ? styles.messageStackUser : styles.messageStackAssistant}`}>
          <div className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBlock}`}>
            {!isUser && msg.reasoning && thinkingVisible && (
              <details className={styles.reasoningBox} open>
                <summary className={styles.reasoningSummary}>
                  <span>{t('playground.thinking_title', { defaultValue: 'Thinking' })}</span>
                  {renderCopyButton(msg.reasoning, t('playground.copy_thinking', { defaultValue: 'Copy thinking' }), true)}
                </summary>
                <div className={styles.reasoningContent}>
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
    <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
      <div className={`${styles.messageStack} ${styles.messageStackAssistant}`}>
        <div className={`${styles.messageBubble} ${styles.assistantBlock}`}>
          {streamReasoning && thinkingVisible && (
            <details className={styles.reasoningBox} open>
              <summary className={styles.reasoningSummary}>
                <span>{t('playground.thinking_title', { defaultValue: 'Thinking' })}</span>
                {renderCopyButton(streamReasoning, t('playground.copy_thinking', { defaultValue: 'Copy thinking' }), true)}
              </summary>
              <div className={styles.reasoningContent}>
                {renderMessageContent(streamReasoning, interactiveMessageOptions)}
              </div>
            </details>
          )}
          {streamContent ? (
            renderCopyableMessageContent(streamContent)
          ) : !streamReasoning || !thinkingVisible ? (
            <div className={styles.messageContent}>
              <span className={styles.thinkingText}>{t('playground.thinking')}</span>
            </div>
          ) : null}
        </div>
        {streamContent && (
          <div className={styles.messageFooter}>
            <div className={styles.streamingMeta}>
              <span className={styles.streamingDot} />
              <span>{t('playground.streaming')}</span>
            </div>
            <div className={`${styles.messageActions} ${styles.messageActionsLeft}`}>
              {renderCopyButton(copyableMessageText(streamContent))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.chatView}>
      <div ref={messagesAreaRef} className={`${styles.messagesArea} ${styles.scrollbar}`}>
        <main className={styles.messagesInner}>
          {!activeId && (
            <div className={styles.emptyState}>
              <div className={styles.emptyLogo}>AI</div>
              <div className={styles.emptyTitle}>{t('playground.empty_title')}</div>
              <div className={styles.emptyDescription}>{t('playground.empty_description')}</div>
              <button className={styles.emptyButton} onClick={createConversation}>
                {t('playground.new_conversation')}
              </button>
            </div>
          )}

          {activeId && messages.map(renderMessageBubble)}

          {isActiveConversationStreaming && renderStreamingMessage()}

          {hasRecoverableUserMessage && (
            <div className={`${styles.noticeBar} ${styles.recoverableBar}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <span className={styles.noticeText}>{t('playground.response_unfinished', { defaultValue: 'Response was interrupted before the assistant replied.' })}</span>
              <button
                type="button"
                className={styles.inlineActionButton}
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
            <div className={styles.noticeBar}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <span className={styles.noticeText}>{error}</span>
              {retryRequest && retryRequest.conversationID === activeId && !isStreaming && (
                <button
                  type="button"
                  className={styles.inlineActionButton}
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
            <div className={styles.interactionNotice}>{interactionNotice}</div>
          )}

          <div ref={messagesEndRef} />
        </main>
      </div>

      {activeId && <InputArea />}
    </div>
  );
}
