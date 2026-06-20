import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaygroundProvider, usePlayground, type PlaygroundContextValue } from '../PlaygroundContext';
import type { Conversation, Message, UserInfo } from '../types';

const mocks = vi.hoisted(() => ({
  api: {
    listConversations: vi.fn(),
    createConversation: vi.fn(),
    deleteConversation: vi.fn(),
    listMessages: vi.fn(),
    persistMessage: vi.fn(),
    getUserInfo: vi.fn(),
  },
  chatCompletionsStream: vi.fn(),
}));

vi.mock('../../api', () => ({
  api: mocks.api,
  chatCompletionsStream: mocks.chatCompletionsStream,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => String(options?.defaultValue || ({
      'playground.copied': 'Copied',
      'playground.copy_failed': 'Copy failed',
      'playground.delete_conversation': 'Delete conversation',
      'playground.delete_conversation_confirm': 'Delete?',
      'playground.no_response': 'No response',
      'playground.select_model_first': 'Select a model first',
    } as Record<string, string>)[key] || key),
  }),
}));

let latest: PlaygroundContextValue;
let lastSelectValue = '';

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 1,
    user_id: 2,
    title: 'First chat',
    group_id: 3,
    platform: 'openai',
    model: 'gpt-5.5',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function message(overrides: Partial<Message> = {}): Message {
  return {
    id: 1,
    conversation_id: 1,
    role: 'user',
    content: 'Hello',
    reasoning: '',
    reasoning_effort: 'medium',
    platform: 'openai',
    model: 'gpt-5.5',
    group_id: 3,
    input_tokens: 0,
    output_tokens: 0,
    cost: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function userInfo(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    role: 'user',
    balance: 12.5,
    status: 'active',
    ...overrides,
  };
}

function Harness() {
  const ctx = usePlayground();
  latest = ctx;

  return (
    <div>
      <div data-testid="active">{ctx.activeId ?? 'none'}</div>
      <div data-testid="messages">{ctx.messages.map(item => `${item.role}:${item.content}`).join('|')}</div>
      <div data-testid="conversations">{ctx.conversations.map(item => `${item.id}:${item.title}`).join('|')}</div>
      <div data-testid="sidebar">{ctx.sidebarConversations.map(item => item.id).join(',')}</div>
      <div data-testid="stream">{`${ctx.isStreaming}|${ctx.streamConversationId ?? ''}|${ctx.streamContent}|${ctx.streamReasoning}`}</div>
      <div data-testid="error">{ctx.error}</div>
      <div data-testid="retry">{ctx.retryRequest ? `${ctx.retryRequest.conversationID}:${ctx.retryRequest.model}` : ''}</div>
      <div data-testid="input">{ctx.input}</div>
      <div data-testid="pending">{ctx.pendingImages.map(item => item.name).join(',')}</div>
      <div data-testid="can-send">{String(ctx.canSendMessage)}</div>
      <div data-testid="selected">{`${ctx.selectedModel}|${ctx.selectedModelID}|${ctx.selectedPlatform}|${ctx.selectedModelSupportsReasoning}`}</div>
      <div data-testid="thinking-visible">{String(ctx.thinkingVisible)}</div>
      <div data-testid="notice">{ctx.interactionNotice}</div>
      <div data-testid="preview">{ctx.previewImage ? `${ctx.previewImage.index}:${ctx.previewImage.images.map(item => item.alt).join(',')}` : ''}</div>
      <div data-testid="mobile">{String(ctx.isMobile)}</div>
      <div data-testid="user">{ctx.userInfo?.balance ?? ''}</div>
      <div data-testid="recoverable">{String(ctx.hasRecoverableUserMessage)}</div>
      <div data-testid="hovered">{ctx.hoveredCopyTarget ?? ''}</div>
      <div ref={ctx.messagesAreaRef} data-testid="scroll-target" />
      <input ref={ctx.fileInputRef} data-testid="file-input" onChange={event => { void ctx.handleImageChange(event); }} />
      <textarea
        ref={ctx.inputRef}
        data-testid="composer"
        value={ctx.input}
        onChange={event => ctx.setInput(event.target.value)}
        onPaste={ctx.handlePaste}
        onKeyDown={ctx.handleKeyDown}
      />
      {ctx.renderNativeSelect({
        id: 'native',
        value: 'a',
        options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
        onChange: value => {
          lastSelectValue = value;
        },
        ariaLabel: 'Native select',
      })}
      <button type="button" onClick={ctx.createConversation}>create</button>
      <button type="button" onClick={() => ctx.openConversation(1)}>open-one</button>
      <button type="button" onClick={() => { void ctx.deleteConversation(ctx.activeId ?? 1); }}>delete-active</button>
      <button type="button" onClick={ctx.sendMessage}>send</button>
      <button type="button" onClick={ctx.stopStreaming}>stop</button>
      <button type="button" onClick={ctx.regenerateLastResponse}>retry-last</button>
      <button type="button" onClick={ctx.regenerateUnfinishedResponse}>retry-unfinished</button>
      <button type="button" onClick={() => ctx.handleMessageCopy('copy me')}>copy</button>
      <button type="button" onClick={() => ctx.showImagePreview([{ url: 'one', alt: 'one' }, { url: 'two', alt: 'two' }], 99)}>preview</button>
      <button type="button" onClick={() => ctx.showNextPreviewImage(1)}>preview-next</button>
      <button type="button" onClick={() => ctx.removePendingImage(ctx.pendingImages[0]?.id || 'missing')}>remove-image</button>
      <button type="button" onClick={ctx.triggerImagePicker}>pick-image</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <PlaygroundProvider>
      <Harness />
    </PlaygroundProvider>,
  );
}

function installMatchMedia(matches = false) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: '(max-width: 960px)',
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_event: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
    addListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
    removeListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
    dispatchEvent: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => mql));
  return {
    mql,
    dispatch(nextMatches: boolean) {
      mql.matches = nextMatches;
      for (const listener of listeners) listener({ matches: nextMatches } as MediaQueryListEvent);
    },
  };
}

async function waitForBoot() {
  await waitFor(() => expect(mocks.api.listConversations).toHaveBeenCalled());
}

describe('PlaygroundContext', () => {
  beforeEach(() => {
    lastSelectValue = '';
    vi.useRealTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      value: vi.fn(),
      configurable: true,
    });
    installMatchMedia(false);
    mocks.api.listConversations.mockResolvedValue([]);
    mocks.api.createConversation.mockResolvedValue(conversation({ id: 10, title: '' }));
    mocks.api.deleteConversation.mockResolvedValue({ status: 'ok' });
    mocks.api.listMessages.mockResolvedValue([]);
    mocks.api.persistMessage.mockImplementation(async (data: Partial<Message>) => message({
      id: data.role === 'assistant' ? 20 : 10,
      conversation_id: data.conversation_id ?? 1,
      role: data.role ?? 'user',
      content: data.content ?? '',
      reasoning: data.reasoning,
      model: data.model ?? 'gpt-5.5',
      platform: data.platform ?? 'openai',
      group_id: data.group_id ?? 3,
      input_tokens: data.input_tokens ?? 0,
      output_tokens: data.output_tokens ?? 0,
      cost: data.cost ?? 0,
    }));
    mocks.api.getUserInfo.mockResolvedValue(userInfo());
    mocks.chatCompletionsStream.mockImplementation(async (_platform, _body, callbacks) => {
      await new Promise(resolve => window.setTimeout(resolve, 0));
      callbacks.onReasoning('thinking');
      callbacks.onData('assistant answer');
      await callbacks.onDone({
        input_tokens: 3,
        output_tokens: 4,
        model: 'served-model',
        cost: 0.25,
      });
    });
  });

  it('throws when usePlayground is called outside the provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Outside() {
      usePlayground();
      return null;
    }

    expect(() => render(<Outside />)).toThrow('usePlayground must be used within PlaygroundProvider');
    consoleError.mockRestore();
  });

  it('loads conversations, selected storage, messages, user info, and viewport state', async () => {
    const media = installMatchMedia(true);
    window.localStorage.setItem('airgate.playground.activeConversationId', '1');
    window.localStorage.setItem('airgate.playground.selectedModel', 'openai:gpt-5.4');
    window.localStorage.setItem('airgate.playground.thinkingVisible', '0');
    mocks.api.listConversations.mockResolvedValue([conversation({ id: 1 })]);
    mocks.api.listMessages.mockResolvedValue([message({ id: 30, content: 'Stored message' })]);
    const balanceListener = vi.fn();
    window.addEventListener('airgate:user-balance-updated', balanceListener);

    renderProvider();

    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('1'));
    await waitFor(() => expect(screen.getByTestId('messages')).toHaveTextContent('Stored message'));
    expect(screen.getByTestId('selected')).toHaveTextContent('openai:gpt-5.4|gpt-5.4|openai|true');
    expect(screen.getByTestId('thinking-visible')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('12.5');
    expect(balanceListener).toHaveBeenCalledWith(expect.objectContaining({ detail: { balance: 12.5 } }));
    expect(screen.getByTestId('mobile')).toHaveTextContent('true');

    act(() => media.dispatch(false));
    expect(screen.getByTestId('mobile')).toHaveTextContent('false');

    fireEvent.change(screen.getByLabelText('Native select'), { target: { value: 'b' } });
    expect(lastSelectValue).toBe('b');
  });

  it('clears invalid stored active conversations and tolerates boot failures', async () => {
    window.localStorage.setItem('airgate.playground.activeConversationId', '999');
    mocks.api.listConversations.mockResolvedValue([conversation({ id: 1 })]);
    mocks.api.getUserInfo.mockRejectedValue(new Error('offline'));

    renderProvider();

    await waitForBoot();
    await waitFor(() => expect(window.localStorage.getItem('airgate.playground.activeConversationId')).toBeNull());
    expect(screen.getByTestId('active')).toHaveTextContent('none');

    mocks.api.listConversations.mockRejectedValueOnce(new Error('down'));
    renderProvider();
    await waitFor(() => expect(mocks.api.listConversations).toHaveBeenCalledTimes(2));
  });

  it('creates, opens, and deletes draft or persisted conversations', async () => {
    window.airgate = { confirm: vi.fn().mockResolvedValue(true) };
    mocks.api.listConversations.mockResolvedValue([conversation({ id: 1, title: 'One' })]);
    renderProvider();
    await waitForBoot();

    fireEvent.click(screen.getByText('create'));
    expect(screen.getByTestId('active')).toHaveTextContent('-1');
    expect(screen.getByTestId('conversations')).toHaveTextContent('-1:');
    expect(screen.getByTestId('sidebar')).not.toHaveTextContent('-1');

    fireEvent.click(screen.getByText('delete-active'));
    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('none'));
    expect(mocks.api.deleteConversation).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('open-one'));
    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('1'));

    fireEvent.click(screen.getByText('delete-active'));
    await waitFor(() => expect(mocks.api.deleteConversation).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('none'));

    (window.airgate.confirm as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    fireEvent.click(screen.getByText('open-one'));
    fireEvent.click(screen.getByText('delete-active'));
    expect(mocks.api.deleteConversation).toHaveBeenCalledTimes(1);
  });

  it('sends a draft message, creates the conversation, streams and persists the assistant response', async () => {
    renderProvider();
    await waitForBoot();

    fireEvent.click(screen.getByText('create'));
    fireEvent.change(screen.getByTestId('composer'), { target: { value: 'Hello model' } });
    expect(screen.getByTestId('can-send')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('send'));

    await waitFor(() => expect(mocks.api.createConversation).toHaveBeenCalledWith({
      title: '',
      group_id: 0,
      platform: 'openai',
      model: 'gpt-5.5',
    }));
    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('10'));
    expect(mocks.chatCompletionsStream).toHaveBeenCalledWith(
      'openai',
      expect.objectContaining({
        model: 'gpt-5.5',
        reasoning_effort: 'medium',
        stream: true,
      }),
      expect.any(Object),
      expect.any(AbortSignal),
    );
    await waitFor(() => expect(mocks.api.persistMessage).toHaveBeenCalledWith(expect.objectContaining({
      conversation_id: 10,
      role: 'assistant',
      content: 'assistant answer',
      reasoning: 'thinking',
      model: 'served-model',
      input_tokens: 3,
      output_tokens: 4,
      cost: 0.25,
    })));
    expect(screen.getByTestId('stream')).toHaveTextContent('false|||');
    expect(screen.getByTestId('input')).toHaveTextContent('');
    expect(mocks.api.listMessages).not.toHaveBeenCalledWith(10);
  });

  it('restores optimistic state when persisting the user message fails', async () => {
    window.localStorage.setItem('airgate.playground.activeConversationId', '1');
    mocks.api.listConversations.mockResolvedValue([conversation({ id: 1 })]);
    mocks.api.listMessages.mockResolvedValue([message({ id: 1, content: 'Previous' })]);
    mocks.api.persistMessage.mockRejectedValueOnce(new Error('persist failed'));
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('messages')).toHaveTextContent('Previous'));

    fireEvent.change(screen.getByTestId('composer'), { target: { value: 'Will fail' } });
    fireEvent.click(screen.getByText('send'));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('persist failed'));
    expect(screen.getByTestId('input')).toHaveTextContent('Will fail');
    expect(screen.getByTestId('messages')).toHaveTextContent('Previous');
  });

  it('stores retry requests on stream errors and regenerates the last response', async () => {
    window.localStorage.setItem('airgate.playground.activeConversationId', '1');
    mocks.api.listConversations.mockResolvedValue([conversation({ id: 1 })]);
    mocks.api.listMessages.mockResolvedValue([message({ id: 1, content: 'Question' })]);
    mocks.chatCompletionsStream.mockImplementationOnce(async (_platform, _body, callbacks) => {
      callbacks.onError('stream broke');
    });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('messages')).toHaveTextContent('Question'));

    fireEvent.change(screen.getByTestId('composer'), { target: { value: 'Again' } });
    fireEvent.click(screen.getByText('send'));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('stream broke'));
    expect(screen.getByTestId('retry')).toHaveTextContent('1:gpt-5.5');

    fireEvent.click(screen.getByText('retry-last'));
    await waitFor(() => expect(mocks.chatCompletionsStream).toHaveBeenCalledTimes(2));
  });

  it('reports thrown stream failures', async () => {
    window.localStorage.setItem('airgate.playground.activeConversationId', '1');
    mocks.api.listConversations.mockResolvedValue([conversation({ id: 1 })]);
    mocks.api.listMessages.mockResolvedValue([message({ id: 1, content: 'Question' })]);
    mocks.chatCompletionsStream.mockRejectedValueOnce(new Error('thrown stream'));
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('messages')).toHaveTextContent('Question'));

    fireEvent.change(screen.getByTestId('composer'), { target: { value: 'Throw' } });
    fireEvent.click(screen.getByText('send'));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('thrown stream'));
    expect(screen.getByTestId('retry')).toHaveTextContent('1:gpt-5.5');
  });

  it('marks empty stream completions as failures and can stop an active stream', async () => {
    window.localStorage.setItem('airgate.playground.activeConversationId', '1');
    mocks.api.listConversations.mockResolvedValue([conversation({ id: 1 })]);
    mocks.api.listMessages.mockResolvedValue([message({ id: 1, content: 'Question' })]);
    mocks.chatCompletionsStream.mockImplementationOnce(async (_platform, _body, callbacks) => {
      await callbacks.onDone({ input_tokens: 0, output_tokens: 0, model: 'gpt-5.5', cost: 0 });
    });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('messages')).toHaveTextContent('Question'));

    fireEvent.change(screen.getByTestId('composer'), { target: { value: 'Empty' } });
    fireEvent.click(screen.getByText('send'));
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('No response'));

    let capturedSignal: AbortSignal | undefined;
    mocks.chatCompletionsStream.mockImplementationOnce((_platform, _body, _callbacks, signal) => {
      capturedSignal = signal;
      return new Promise(() => {});
    });
    fireEvent.change(screen.getByTestId('composer'), { target: { value: 'Stop me' } });
    fireEvent.click(screen.getByText('send'));
    await waitFor(() => expect(screen.getByTestId('stream')).toHaveTextContent('true|1'));
    fireEvent.click(screen.getByText('stop'));
    expect(capturedSignal?.aborted).toBe(true);
    await waitFor(() => expect(screen.getByTestId('stream')).toHaveTextContent('false|||'));
  });

  it('handles image selection, paste, removal, and picker clicks', async () => {
    renderProvider();
    await waitForBoot();
    const clickFile = vi.spyOn(screen.getByTestId('file-input'), 'click').mockImplementation(() => {});

    const file = new File(['hello'], 'image.png', { type: 'image/png', lastModified: 1 });
    await act(async () => {
      await latest.handleImageChange({
        target: { files: [file], value: 'image.png' },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });
    await waitFor(() => expect(screen.getByTestId('pending')).toHaveTextContent('image.png'));

    fireEvent.click(screen.getByText('remove-image'));
    expect(screen.getByTestId('pending')).toBeEmptyDOMElement();

    const preventDefault = vi.fn();
    await act(async () => {
      latest.handlePaste({
        clipboardData: { files: [file] },
        preventDefault,
      } as unknown as React.ClipboardEvent<HTMLTextAreaElement>);
    });
    await waitFor(() => expect(screen.getByTestId('pending')).toHaveTextContent('image.png'));
    expect(preventDefault).toHaveBeenCalled();

    fireEvent.click(screen.getByText('pick-image'));
    expect(clickFile).toHaveBeenCalled();

    const tooLarge = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'too-large.png', { type: 'image/png' });
    await act(async () => {
      await latest.handleImageChange({
        target: { files: [tooLarge], value: 'too-large.png' },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Images must be 10MB or smaller'));

    await act(async () => {
      latest.handlePaste({
        clipboardData: { files: [tooLarge] },
        preventDefault: vi.fn(),
      } as unknown as React.ClipboardEvent<HTMLTextAreaElement>);
    });
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Images must be 10MB or smaller'));
  });

  it('handles keyboard submission guards and Enter sends', async () => {
    renderProvider();
    await waitForBoot();

    fireEvent.click(screen.getByText('create'));
    fireEvent.change(screen.getByTestId('composer'), { target: { value: 'Keyboard' } });
    fireEvent.keyDown(screen.getByTestId('composer'), { key: 'a' });
    fireEvent.keyDown(screen.getByTestId('composer'), { key: 'Enter', shiftKey: true });
    expect(mocks.api.persistMessage).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByTestId('composer'), { key: 'Enter' });
    await waitFor(() => expect(mocks.api.persistMessage).toHaveBeenCalledWith(expect.objectContaining({
      role: 'user',
      content: 'Keyboard',
    })));
  });

  it('copies messages, clears notices on timers, and handles copy failure', async () => {
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderProvider();
    await waitForBoot();
    fireEvent.click(screen.getByText('copy'));
    await waitFor(() => expect(screen.getByTestId('notice')).toHaveTextContent('Copied'));

    writeText.mockRejectedValueOnce(new Error('denied'));
    fireEvent.click(screen.getByText('copy'));
    await waitFor(() => expect(screen.getByTestId('notice')).toHaveTextContent('Copy failed'));
  });

  it('clamps image preview indexes and cycles through preview images', async () => {
    renderProvider();
    await waitForBoot();

    fireEvent.click(screen.getByText('preview'));
    expect(screen.getByTestId('preview')).toHaveTextContent('1:one,two');
    fireEvent.click(screen.getByText('preview-next'));
    expect(screen.getByTestId('preview')).toHaveTextContent('0:one,two');
    fireEvent.click(screen.getByText('preview-next'));
    expect(screen.getByTestId('preview')).toHaveTextContent('1:one,two');

    act(() => latest.showImagePreview([], 0));
    expect(screen.getByTestId('preview')).toHaveTextContent('1:one,two');
  });

  it('regenerates unfinished responses and reports missing model selection', async () => {
    window.localStorage.setItem('airgate.playground.activeConversationId', '1');
    mocks.api.listConversations.mockResolvedValue([conversation({ id: 1 })]);
    mocks.api.listMessages.mockResolvedValue([message({ id: 1, content: 'Question', model: '', platform: '' })]);
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('recoverable')).toHaveTextContent('true'));

    act(() => latest.setSelectedModel('invalid'));
    fireEvent.click(screen.getByText('retry-unfinished'));
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Select a model first'));

    act(() => latest.setSelectedModel('openai:gpt-5.5'));
    fireEvent.click(screen.getByText('retry-unfinished'));
    await waitFor(() => expect(mocks.chatCompletionsStream).toHaveBeenCalled());
  });

  it('updates hover state and reasoning visibility storage', async () => {
    renderProvider();
    await waitForBoot();

    act(() => latest.setHoveredCopyTarget('message-1'));
    expect(screen.getByTestId('hovered')).toHaveTextContent('message-1');

    act(() => latest.setThinkingVisible(false));
    await waitFor(() => expect(window.localStorage.getItem('airgate.playground.thinkingVisible')).toBe('0'));

    act(() => latest.setThinkingVisible(true));
    await waitFor(() => expect(window.localStorage.getItem('airgate.playground.thinkingVisible')).toBeNull());
  });
});
