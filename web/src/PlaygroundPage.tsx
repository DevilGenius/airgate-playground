import { PlaygroundProvider, usePlayground } from './playground/PlaygroundContext';
import { ChatView } from './playground/ChatView';
import { ConversationSidebar } from './playground/ConversationSidebar';
import { ConversationTabs } from './playground/ConversationTabs';
import { styles, keyframes } from './playground/styles';

export function ChatPage() {
  return (
    <PlaygroundProvider>
      <PlaygroundShell />
    </PlaygroundProvider>
  );
}

export default ChatPage;

function PlaygroundShell() {
  return (
    <div data-full-bleed data-pg-aesthetic style={styles.layout} className="pg-layout">
      <ImagePreviewOverlay />

      <ConversationSidebar />

      <div style={styles.main}>
        <ConversationTabs />
        <ChatView />
      </div>

      <style>{keyframes}</style>
    </div>
  );
}

function ImagePreviewOverlay() {
  const { t, previewImage, setPreviewImage, showNextPreviewImage } = usePlayground();

  if (!previewImage) return null;
  const current = previewImage.images[previewImage.index] || previewImage.images[0];
  if (!current) return null;
  const hasNav = previewImage.images.length > 1;

  return (
    <div style={styles.imagePreviewOverlay} role="dialog" aria-modal="true" aria-label={current.alt || t('playground.image_preview')} onClick={() => setPreviewImage(null)}>
      <div style={styles.imagePreviewModal} onClick={event => event.stopPropagation()}>
        <img src={current.url} alt={current.alt} style={styles.imagePreviewLarge} />
        {hasNav && (
          <>
            <button type="button" style={{ ...styles.imagePreviewNavBtn, left: 12 }} onClick={() => showNextPreviewImage(-1)} aria-label={t('playground.previous_image', { defaultValue: 'Previous image' })}>‹</button>
            <button type="button" style={{ ...styles.imagePreviewNavBtn, right: 12 }} onClick={() => showNextPreviewImage(1)} aria-label={t('playground.next_image', { defaultValue: 'Next image' })}>›</button>
            <div style={styles.imagePreviewCounter}>{previewImage.index + 1} / {previewImage.images.length}</div>
          </>
        )}
        <button type="button" style={styles.imagePreviewCloseBtn} onClick={() => setPreviewImage(null)} aria-label={t('playground.close_image_preview')}>×</button>
      </div>
    </div>
  );
}
