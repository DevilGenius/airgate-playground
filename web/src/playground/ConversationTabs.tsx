import { usePlayground } from './PlaygroundContext';
import styles from './Playground.module.css';

export function ConversationTabs() {
  const {
    t,
    activeId,
    conversations,
    createConversation,
    openConversation,
    deleteConversation,
  } = usePlayground();

  return (
    <div
      className={styles.conversationTabs}
      aria-label={t('playground.conversations', { defaultValue: 'Conversations' })}
    >
      <button
        type="button"
        className={styles.tabNewButton}
        onClick={createConversation}
        aria-label={t('playground.new_conversation')}
        title={t('playground.new_conversation')}
      >
        <svg width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M7 1v12M1 7h12" />
        </svg>
      </button>

      <div className={styles.tabList} role="tablist">
        {conversations.map(conversation => {
          const isActive = conversation.id === activeId;
          return (
            <div
              key={conversation.id}
              role="presentation"
              className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                className={styles.tabOpenButton}
                onClick={() => openConversation(conversation.id)}
                title={conversation.title || t('playground.new_conversation')}
              >
                {conversation.title || t('playground.new_conversation')}
              </button>
              <button
                type="button"
                className={styles.tabCloseButton}
                onClick={() => { void deleteConversation(conversation.id); }}
                aria-label={t('playground.delete_conversation')}
                title={t('playground.delete_conversation')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div className={styles.emptyTabs}>{t('playground.no_conversations')}</div>
        )}
      </div>
    </div>
  );
}
