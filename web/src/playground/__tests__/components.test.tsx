import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { PlaygroundContextValue } from '../PlaygroundContext';
import type { Conversation, Message, SelectOption } from '../types';
import { ChatView } from '../ChatView';
import { ConversationSidebar } from '../ConversationSidebar';
import { ConversationTabs } from '../ConversationTabs';
import { InputArea } from '../InputArea';

const contextState = vi.hoisted(() => ({
  current: null as PlaygroundContextValue | null,
}));

vi.mock('../PlaygroundContext', () => ({
  usePlayground: () => {
    if (!contextState.current) throw new Error('missing test context');
    return contextState.current;
  },
}));

const translations: Record<string, string> = {
  'playground.attach_images': 'Attach images',
  'playground.close_image_preview': 'Close preview',
  'playground.conversations': 'Conversations',
  'playground.copy_thinking': 'Copy thinking',
  'playground.delete_conversation': 'Delete conversation',
  'playground.empty_description': 'Start a conversation',
  'playground.empty_title': 'No active conversation',
  'playground.generated_image': 'Generated image',
  'playground.hide_thinking': 'Hide Thinking',
  'playground.image': 'Image',
  'playground.input_placeholder': 'Ask anything',
  'playground.model': 'Model',
  'playground.new_conversation': 'New conversation',
  'playground.no_conversations': 'No conversations',
  'playground.preview_image': 'Preview image',
  'playground.regenerate': 'Regenerate',
  'playground.response_unfinished': 'Response was interrupted before the assistant replied.',
  'playground.select_model_first': 'Select a model first',
  'playground.send': 'Send',
  'playground.show_thinking': 'Show Thinking',
  'playground.stop': 'Stop',
  'playground.streaming': 'Streaming',
  'playground.thinking': 'Thinking',
  'playground.thinking_title': 'Thinking',
};

function t(key: string, options?: Record<string, unknown>) {
  return translations[key] || String(options?.defaultValue || key);
}

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
    role: 'assistant',
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

function makeContext(overrides: Partial<PlaygroundContextValue> = {}): PlaygroundContextValue {
  const options: SelectOption[] = [
    { value: 'openai:gpt-5.5', label: 'GPT 5.5 › openai' },
    { value: 'openai:gpt-5.4', label: 'GPT 5.4 › openai' },
  ];
  const base: PlaygroundContextValue = {
    t,
    conversations: [],
    sidebarConversations: [],
    activeId: null,
    messages: [],
    isStreaming: false,
    streamContent: '',
    streamReasoning: '',
    streamConversationId: null,
    isActiveConversationStreaming: false,
    hasRecoverableUserMessage: false,
    selectedModel: options[0].value,
    setSelectedModel: vi.fn(),
    selectedModelInfo: undefined,
    selectedModelID: 'gpt-5.5',
    selectedPlatform: 'openai',
    selectedModelSupportsReasoning: true,
    modelOptions: options,
    input: '',
    setInput: vi.fn(),
    pendingImages: [],
    canSendMessage: false,
    error: '',
    retryRequest: null,
    interactionNotice: '',
    previewImage: null,
    setPreviewImage: vi.fn(),
    userInfo: null,
    reasoningEffort: 'medium',
    setReasoningEffort: vi.fn(),
    thinkingVisible: true,
    setThinkingVisible: vi.fn(),
    isMobile: false,
    hoveredCopyTarget: null,
    setHoveredCopyTarget: vi.fn(),
    inputRef: { current: null },
    fileInputRef: { current: null },
    messagesAreaRef: { current: null },
    messagesEndRef: { current: null },
    createConversation: vi.fn(),
    openConversation: vi.fn(),
    deleteConversation: vi.fn().mockResolvedValue(undefined),
    sendMessage: vi.fn(),
    stopStreaming: vi.fn(),
    regenerateLastResponse: vi.fn(),
    regenerateUnfinishedResponse: vi.fn(),
    handleMessageCopy: vi.fn(),
    showImagePreview: vi.fn(),
    showNextPreviewImage: vi.fn(),
    removePendingImage: vi.fn(),
    triggerImagePicker: vi.fn(),
    handleImageChange: vi.fn().mockResolvedValue(undefined),
    handlePaste: vi.fn(),
    handleKeyDown: vi.fn(),
    interactiveMessageOptions: {
      imagePreviewTitle: 'Preview image',
      generatedImageAlt: 'Generated image',
      isMobile: false,
    },
  };
  return { ...base, ...overrides };
}

function withContext(overrides: Partial<PlaygroundContextValue>, ui: ReactNode) {
  contextState.current = makeContext(overrides);
  return {
    context: contextState.current,
    ...render(<>{ui}</>),
  };
}

describe('ConversationSidebar', () => {
  it('renders empty state and starts a new conversation', () => {
    const { context } = withContext({}, <ConversationSidebar />);

    expect(screen.getByText('No conversations')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'New conversation' }));
    expect(context.createConversation).toHaveBeenCalled();
  });

  it('opens and deletes sidebar conversations', () => {
    const conv = conversation({ id: 7, title: '' });
    const { context } = withContext({
      activeId: 7,
      sidebarConversations: [conv, conversation({ id: 8, title: 'Second chat' })],
    }, <ConversationSidebar />);

    fireEvent.click(screen.getAllByTitle('New conversation')[1]);
    expect(context.openConversation).toHaveBeenCalledWith(7);
    fireEvent.click(screen.getByTitle('Second chat'));
    expect(context.openConversation).toHaveBeenCalledWith(8);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete conversation' })[0]);
    expect(context.deleteConversation).toHaveBeenCalledWith(7);
  });
});

describe('ConversationTabs', () => {
  it('renders empty tabs and starts a new conversation', () => {
    const { context } = withContext({}, <ConversationTabs />);

    expect(screen.getByText('No conversations')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'New conversation' }));
    expect(context.createConversation).toHaveBeenCalled();
  });

  it('marks active tabs and dispatches tab actions', () => {
    const convs = [
      conversation({ id: 1, title: 'One' }),
      conversation({ id: 2, title: '' }),
    ];
    const { context } = withContext({
      activeId: 2,
      conversations: convs,
    }, <ConversationTabs />);

    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'New conversation' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'One' }));
    expect(context.openConversation).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete conversation' })[0]);
    expect(context.deleteConversation).toHaveBeenCalledWith(1);
  });
});

describe('InputArea', () => {
  it('renders composer controls and dispatches input actions', () => {
    const { context } = withContext({
      input: 'hello',
      canSendMessage: true,
    }, <InputArea />);

    const textarea = screen.getByPlaceholderText('Ask anything');
    expect(textarea).toHaveValue('hello');

    fireEvent.change(textarea, { target: { value: 'next prompt' } });
    expect(context.setInput).toHaveBeenCalledWith('next prompt');

    fireEvent.click(screen.getByRole('button', { name: 'Model' }));
    fireEvent.click(screen.getByRole('option', { name: 'GPT 5.4 › openai' }));
    expect(context.setSelectedModel).toHaveBeenCalledWith('openai:gpt-5.4');

    fireEvent.click(screen.getByRole('button', { name: 'Reasoning effort' }));
    fireEvent.click(screen.getByRole('option', { name: 'High' }));
    expect(context.setReasoningEffort).toHaveBeenCalledWith('high');

    fireEvent.click(screen.getByRole('button', { name: 'Attach images' }));
    expect(context.triggerImagePicker).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Hide Thinking' }));
    expect(context.setThinkingVisible).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(context.sendMessage).toHaveBeenCalled();
  });

  it('renders pending images and stop action while streaming', () => {
    const { context } = withContext({
      isActiveConversationStreaming: true,
      pendingImages: [{ id: 'image-1', name: 'sample.png', url: 'blob:sample' }],
    }, <InputArea />);

    expect(screen.getByAltText('sample.png')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask anything')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove sample.png' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(context.stopStreaming).toHaveBeenCalled();
  });
});

describe('ChatView', () => {
  it('renders the empty state and creates a conversation', () => {
    const { context } = withContext({}, <ChatView />);

    expect(screen.getByText('No active conversation')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'New conversation' }));
    expect(context.createConversation).toHaveBeenCalled();
  });

  it('renders messages, reasoning, model metadata, copy actions, and image previews', () => {
    const assistant = message({
      id: 10,
      role: 'assistant',
      content: `Assistant text ![img](data:image/png;base64,aGVsbG8=)`,
      reasoning: 'internal notes',
      model: 'gpt-5.5',
    });
    const user = message({
      id: 11,
      role: 'user',
      content: 'User text',
      model: 'gpt-5.5',
    });
    const { context } = withContext({
      activeId: 1,
      messages: [user, assistant],
    }, <ChatView />);

    expect(screen.getByText('User text')).toBeInTheDocument();
    expect(screen.getByText('Assistant text')).toBeInTheDocument();
    expect(screen.getByText('internal notes')).toBeInTheDocument();
    expect(screen.getByText('gpt-5.5')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Copy message' })[0]);
    expect(context.handleMessageCopy).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Copy thinking' }));
    expect(context.handleMessageCopy).toHaveBeenCalledWith('internal notes');

    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    expect(context.showImagePreview).toHaveBeenCalledWith([
      { alt: 'img', url: 'data:image/png;base64,aGVsbG8=' },
    ], 0);
  });

  it('hides reasoning when thinking is not visible', () => {
    withContext({
      activeId: 1,
      thinkingVisible: false,
      messages: [message({ reasoning: 'hidden notes' })],
    }, <ChatView />);

    expect(screen.queryByText('hidden notes')).not.toBeInTheDocument();
  });

  it('renders streaming content with reasoning and a copy action', () => {
    const { context } = withContext({
      activeId: 1,
      isStreaming: true,
      isActiveConversationStreaming: true,
      streamReasoning: 'stream thinking',
      streamContent: 'stream answer',
    }, <ChatView />);

    expect(screen.getByText('stream thinking')).toBeInTheDocument();
    expect(screen.getByText('stream answer')).toBeInTheDocument();
    expect(screen.getByText('Streaming')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy thinking' }));
    expect(context.handleMessageCopy).toHaveBeenCalledWith('stream thinking');
  });

  it('renders streaming placeholder when no visible stream content exists', () => {
    withContext({
      activeId: 1,
      isStreaming: true,
      isActiveConversationStreaming: true,
      streamReasoning: '',
      streamContent: '',
    }, <ChatView />);

    expect(screen.getAllByText('Thinking').length).toBeGreaterThan(0);
  });

  it('renders recoverable, retryable, and notice states', () => {
    const { context } = withContext({
      activeId: 1,
      messages: [message({ role: 'user', content: 'last user' })],
      hasRecoverableUserMessage: true,
      error: 'failed',
      retryRequest: {
        conversationID: 1,
        requestMessages: [],
        model: 'gpt-5.5',
        groupID: 1,
        platform: 'openai',
      },
      interactionNotice: 'Copied',
    }, <ChatView />);

    expect(screen.getByText('Response was interrupted before the assistant replied.')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(screen.getByText('Copied')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Regenerate' })[0]);
    expect(context.regenerateUnfinishedResponse).toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: 'Regenerate' })[1]);
    expect(context.regenerateLastResponse).toHaveBeenCalled();
  });

  it('omits retry button when the retry request belongs to another conversation', () => {
    withContext({
      activeId: 1,
      error: 'failed',
      retryRequest: {
        conversationID: 2,
        requestMessages: [],
        model: 'gpt-5.5',
        groupID: 1,
        platform: 'openai',
      },
    }, <ChatView />);

    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Regenerate' })).not.toBeInTheDocument();
  });
});
