import { usePlayground } from './PlaygroundContext';
import styles from './Playground.module.css';

export function ConversationSidebar() {
  const {
    t,
    activeId,
    sidebarConversations,
    createConversation,
    openConversation,
    deleteConversation,
  } = usePlayground();

  return (
    <aside
      className={styles.conversationSidebar}
      aria-label={t('playground.conversations', { defaultValue: 'Conversations' })}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTopbar}>
          <button
            type="button"
            className={styles.newConversationButton}
            onClick={createConversation}
            title={t('playground.new_conversation')}
            aria-label={t('playground.new_conversation')}
          >
            <span className={styles.buttonIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M7 1v12M1 7h12" />
              </svg>
            </span>
            <span>{t('playground.new_conversation')}</span>
          </button>
        </div>
      </div>

      <div className={`${styles.conversationList} ${styles.scrollbar}`}>
        {sidebarConversations.map(conversation => {
          const isActive = conversation.id === activeId;
          return (
            <div
              key={conversation.id}
              className={`${styles.conversationItem} ${isActive ? styles.conversationItemActive : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <button
                type="button"
                className={styles.conversationOpenButton}
                onClick={() => openConversation(conversation.id)}
                title={conversation.title || t('playground.new_conversation')}
              >
                <span className={styles.conversationIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>
                </span>
                <span className={styles.conversationTitle}>
                  {conversation.title || t('playground.new_conversation')}
                </span>
              </button>
              <button
                type="button"
                className={styles.deleteConversationButton}
                onClick={(event) => { event.stopPropagation(); void deleteConversation(conversation.id); }}
                title={t('playground.delete_conversation')}
                aria-label={t('playground.delete_conversation')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                </svg>
              </button>
            </div>
          );
        })}

        {sidebarConversations.length === 0 && (
          <div className={styles.emptyConversations}><span>{t('playground.no_conversations')}</span></div>
        )}
      </div>
    </aside>
  );
}
