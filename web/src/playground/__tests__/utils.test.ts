import { describe, expect, it, vi } from 'vitest';
import type { ModelInfo, PendingImage } from '../types';
import {
  copyText,
  copyableMessageText,
  dataUrlToBlob,
  defaultModelOptionValue,
  escapeMarkdownAlt,
  generatedImages,
  getStoredActiveConversationId,
  getStoredSelectedModel,
  hasCopyableMessageText,
  imagesFromFiles,
  isSafeImageUrl,
  isSafeLinkUrl,
  messageContentWithImages,
  modelOptionValue,
  normalizeModelName,
  readLocalStorageValue,
  replaceBase64WithBlobUrls,
  replaceBlobUrlsWithBase64,
  revokeBlobRegistry,
  stripImageMarkdown,
  supportsReasoning,
  titleFromMessageContent,
  toChatMessageContent,
  writeLocalStorageValue,
} from '../utils';
import {
  ACTIVE_CONVERSATION_STORAGE_KEY,
  MAX_IMAGE_BYTES,
  SELECTED_MODEL_STORAGE_KEY,
} from '../constants';

const pngDataUrl = 'data:image/png;base64,aGVsbG8=';
const jpegDataUrl = 'data:image/jpeg;base64,d29ybGQ=';

function model(overrides: Partial<ModelInfo>): ModelInfo {
  return {
    id: 'gpt-5.5',
    name: 'GPT 5.5',
    platform: 'openai',
    input_price: 1,
    output_price: 2,
    context_window: 1000,
    max_output_tokens: 100,
    capabilities: ['chat'],
    ...overrides,
  };
}

describe('playground utils', () => {
  it('converts valid data URLs to typed blobs and rejects invalid base64', async () => {
    const blob = dataUrlToBlob(pngDataUrl);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('image/png');
    expect(await blob?.text()).toBe('hello');

    const defaultTypeBlob = dataUrlToBlob('data:;base64,aGk=');
    expect(defaultTypeBlob?.type).toBe('application/octet-stream');
    expect(dataUrlToBlob('not-a-data-url')).toBeNull();
    expect(dataUrlToBlob('data:image/png;base64,%')).toBeNull();
  });

  it('replaces base64 images with blob URLs and restores them from the registry', () => {
    const registry = new Map<string, string>();
    const createObjectURL = vi.fn()
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    expect(replaceBase64WithBlobUrls('plain text', registry)).toBe('plain text');

    const converted = replaceBase64WithBlobUrls(`${pngDataUrl} ${jpegDataUrl}`, registry);
    expect(converted).toBe('blob:first blob:second');
    expect(registry.get('blob:first')).toBe(pngDataUrl);
    expect(registry.get('blob:second')).toBe(jpegDataUrl);

    expect(replaceBlobUrlsWithBase64(converted, registry)).toBe(`${pngDataUrl} ${jpegDataUrl}`);
    expect(replaceBlobUrlsWithBase64('blob:missing', registry)).toBe('blob:missing');
    expect(replaceBlobUrlsWithBase64('no blob here', registry)).toBe('no blob here');

    revokeBlobRegistry(registry);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second');
    expect(registry.size).toBe(0);
  });

  it('builds user content with image markdown and safe alt text', () => {
    const images: PendingImage[] = [
      { id: '1', name: 'a]b\\c.png', url: 'data:image/png;base64,abc' },
      { id: '2', name: 'second.png', url: 'blob:second' },
    ];

    expect(escapeMarkdownAlt('a]b\\c')).toBe('abc');
    expect(messageContentWithImages(' hello ', images)).toBe([
      'hello',
      '![abc.png](data:image/png;base64,abc)',
      '![second.png](blob:second)',
    ].join('\n\n').replace('\n\n![second', '\n![second'));
    expect(messageContentWithImages('', images)).toBe([
      '![abc.png](data:image/png;base64,abc)',
      '![second.png](blob:second)',
    ].join('\n'));
    expect(messageContentWithImages('hello', [])).toBe('hello');
  });

  it('reads image files, ignores non-images, and rejects oversized images', async () => {
    const image = new File(['hello'], 'pic.png', { type: 'image/png', lastModified: 123 });
    const text = new File(['ignored'], 'note.txt', { type: 'text/plain', lastModified: 456 });

    await expect(imagesFromFiles([new File(['x'.repeat(8)], 'huge.png', {
      type: 'image/png',
      lastModified: 1,
    })])).resolves.toHaveLength(1);

    const result = await imagesFromFiles([text, image]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'pic.png-123-5',
      name: 'pic.png',
      file: image,
    });
    expect(result[0].url).toMatch(/^data:image\/png;base64,/);

    const tooLarge = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'too-large.png', {
      type: 'image/png',
    });
    await expect(imagesFromFiles([tooLarge])).rejects.toThrow('Images must be 10MB or smaller');
  });

  it('extracts, strips, copies, and titles image-heavy markdown content', () => {
    const content = [
      'Intro',
      `![first](${pngDataUrl})`,
      `![second](https://example.com/image.png)`,
    ].join('\n');

    expect(generatedImages(content)).toEqual([
      { alt: 'first', url: pngDataUrl },
      { alt: 'second', url: 'https://example.com/image.png' },
    ]);
    expect(generatedImages(content)).toHaveLength(2);
    expect(stripImageMarkdown(content)).toBe('Intro\n[Image]\n[Image]');
    expect(copyableMessageText(`  ${pngDataUrl}  `)).toBe(pngDataUrl);
    expect(copyableMessageText(`![only](${pngDataUrl})`)).toBe('[Image]');
    expect(hasCopyableMessageText(`![only](${pngDataUrl})`)).toBe(false);
    expect(hasCopyableMessageText(`text ![img](${pngDataUrl})`)).toBe(true);
    expect(titleFromMessageContent('1234567890123456789012345678901')).toBe('123456789012345678901234567890...');
    expect(titleFromMessageContent(`![only](${pngDataUrl})`)).toBe('[Image]');
  });

  it('converts markdown images to chat message content only for user messages', () => {
    const content = `before ![alt](${pngDataUrl}) after`;

    expect(toChatMessageContent('assistant', content)).toBe('before [Image] after');
    expect(toChatMessageContent('user', content)).toEqual([
      { type: 'text', text: 'before' },
      { type: 'image_url', image_url: { url: pngDataUrl } },
      { type: 'text', text: 'after' },
    ]);
    expect(toChatMessageContent('user', `![alt](${pngDataUrl})`)).toEqual([
      { type: 'image_url', image_url: { url: pngDataUrl } },
    ]);
    expect(toChatMessageContent('user', 'plain')).toEqual([
      { type: 'text', text: 'plain' },
    ]);
  });

  it('evaluates model reasoning support and option defaults', () => {
    const reasoning = model({ id: 'r', capabilities: ['reasoning'] });
    const thinking = model({ id: 't', capabilities: ['thinking'] });
    const noCapabilities = model({ id: 'empty', capabilities: [] });
    const chatOnly = model({ id: 'chat', capabilities: ['chat'] });

    expect(supportsReasoning(undefined)).toBe(false);
    expect(supportsReasoning(reasoning)).toBe(true);
    expect(supportsReasoning(thinking)).toBe(true);
    expect(supportsReasoning(noCapabilities)).toBe(true);
    expect(supportsReasoning(chatOnly)).toBe(false);
    expect(modelOptionValue(model({ platform: 'open ai', id: 'gpt/5' }))).toBe('open%20ai:gpt%2F5');
    expect(normalizeModelName('GPT-5_5 Mini')).toBe('gpt55mini');
    expect(defaultModelOptionValue([
      model({ id: 'other', name: 'Other' }),
      model({ id: 'gpt-5.5', name: 'Preferred' }),
    ])).toBe('openai:gpt-5.5');
    expect(defaultModelOptionValue([model({ id: 'first', name: 'First' })])).toBe('openai:first');
    expect(defaultModelOptionValue([])).toBe('');
  });

  it('reads and writes local storage with validation and storage failure fallbacks', () => {
    expect(readLocalStorageValue('missing')).toBe('');

    writeLocalStorageValue(SELECTED_MODEL_STORAGE_KEY, 'model');
    expect(getStoredSelectedModel()).toBe('model');

    writeLocalStorageValue(SELECTED_MODEL_STORAGE_KEY, null);
    expect(getStoredSelectedModel()).toBe('');

    window.localStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, '42');
    expect(getStoredActiveConversationId()).toBe(42);
    window.localStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, '0');
    expect(getStoredActiveConversationId()).toBeNull();
    window.localStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, '1.5');
    expect(getStoredActiveConversationId()).toBeNull();

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('locked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('locked');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('locked');
    });
    expect(readLocalStorageValue('x')).toBe('');
    expect(() => writeLocalStorageValue('x', 'y')).not.toThrow();
    expect(() => writeLocalStorageValue('x', null)).not.toThrow();
  });

  it('accepts only safe link and image URL schemes', () => {
    expect(isSafeLinkUrl('https://example.com')).toBe(true);
    expect(isSafeLinkUrl('HTTP://example.com')).toBe(true);
    expect(isSafeLinkUrl('mailto:user@example.com')).toBe(true);
    expect(isSafeLinkUrl('#section')).toBe(true);
    expect(isSafeLinkUrl('javascript:alert(1)')).toBe(false);

    expect(isSafeImageUrl(pngDataUrl)).toBe(true);
    expect(isSafeImageUrl('https://example.com/a.png')).toBe(true);
    expect(isSafeImageUrl('blob:item')).toBe(true);
    expect(isSafeImageUrl('/assets-runtime/a.png')).toBe(true);
    expect(isSafeImageUrl('/api/v1/ext-user/airgate-playground/assets/a.png')).toBe(true);
    expect(isSafeImageUrl('data:text/html;base64,abc')).toBe(false);
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
  });

  it('copies text through secure clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    await copyText('hello');
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('throws when clipboard copy is unavailable', async () => {
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

    await expect(copyText('nope')).rejects.toThrow('copy failed');
  });
});
