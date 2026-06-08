import { cssVar } from '@devilgenius/airgate-theme';
import { usePlayground } from './PlaygroundContext';
import { styles } from './styles';

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
      style={styles.sidebar}
      className="pg-sidebar"
      aria-label={t('playground.conversations', { defaultValue: 'Conversations' })}
    >
      <div style={styles.sidebarHeader}>
        <div style={styles.sidebarTopbar}>
          <button
            type="button"
            style={styles.newBtn}
            className="pg-sidebar-action"
            onClick={createConversation}
            title={t('playground.new_conversation')}
            aria-label={t('playground.new_conversation')}
          >
            <span style={styles.newBtnIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M7 1v12M1 7h12" />
              </svg>
            </span>
            <span>{t('playground.new_conversation')}</span>
          </button>
        </div>
      </div>

      <div style={styles.convList} className="pg-scrollbar">
        {sidebarConversations.map(conversation => {
          const isActive = conversation.id === activeId;
          return (
            <div
              key={conversation.id}
              className={`pg-conv-item${isActive ? ' is-active' : ''}`}
              style={styles.convItem}
            >
              <button
                type="button"
                className="pg-conv-open"
                style={styles.convOpenBtn}
                onClick={() => openConversation(conversation.id)}
                title={conversation.title || t('playground.new_conversation')}
              >
                <span style={{ ...styles.convIcon, color: isActive ? cssVar('text') : cssVar('textTertiary') }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>
                </span>
                <span style={{ ...styles.convTitle, color: isActive ? cssVar('text') : cssVar('textSecondary'), fontWeight: isActive ? 500 : 400 }}>
                  {conversation.title || t('playground.new_conversation')}
                </span>
              </button>
              <button
                type="button"
                className="pg-conv-delete"
                style={styles.deleteBtn}
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
          <div style={styles.emptyConvList}><span>{t('playground.no_conversations')}</span></div>
        )}
      </div>
    </aside>
  );
}
