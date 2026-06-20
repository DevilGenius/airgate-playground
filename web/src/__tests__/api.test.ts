import { describe, expect, it, vi } from 'vitest';
import { api, chatCompletionsStream } from '../api';

const base = '/api/v1/ext-user/airgate-playground';

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function streamResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  }), {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

function callbacks() {
  return {
    onData: vi.fn(),
    onReasoning: vi.fn(),
    onDone: vi.fn(),
    onError: vi.fn(),
  };
}

describe('api request helpers', () => {
  it('sends authenticated CRUD requests with parsed JSON responses', async () => {
    window.sessionStorage.setItem('ag:web:auth:token', 'session-token');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([{ id: 1, title: 'one' }]))
      .mockResolvedValueOnce(jsonResponse({ id: 2, title: 'new' }))
      .mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
      .mockResolvedValueOnce(jsonResponse([{ id: 3, content: 'hello' }]))
      .mockResolvedValueOnce(jsonResponse({ id: 4, content: 'saved' }))
      .mockResolvedValueOnce(jsonResponse({ id: 5, balance: 9 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.listConversations()).resolves.toEqual([{ id: 1, title: 'one' }]);
    await expect(api.createConversation({ title: 'new', group_id: 7, platform: 'openai', model: 'gpt' }))
      .resolves.toEqual({ id: 2, title: 'new' });
    await expect(api.deleteConversation(2)).resolves.toEqual({ status: 'ok' });
    await expect(api.listMessages(2)).resolves.toEqual([{ id: 3, content: 'hello' }]);
    await expect(api.persistMessage({ conversation_id: 2, role: 'user', content: 'hello' }))
      .resolves.toEqual({ id: 4, content: 'saved' });
    await expect(api.getUserInfo()).resolves.toEqual({ id: 5, balance: 9 });

    expect(fetchMock).toHaveBeenNthCalledWith(1, `${base}/conversations`, {
      method: 'GET',
      headers: { Authorization: 'Bearer session-token' },
      body: undefined,
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${base}/conversations`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer session-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'new', group_id: 7, platform: 'openai', model: 'gpt' }),
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${base}/conversations/2`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer session-token' },
      body: undefined,
    });
    expect(fetchMock).toHaveBeenNthCalledWith(4, `${base}/messages/2`, expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(5, `${base}/messages`, expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(6, `${base}/user/info`, expect.any(Object));
  });

  it('falls back to local storage tokens and empty responses', async () => {
    window.localStorage.setItem('ag:web:auth:token', 'local-token');
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.deleteConversation(9)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(`${base}/conversations/9`, expect.objectContaining({
      headers: { Authorization: 'Bearer local-token' },
    }));
  });

  it('ignores unavailable browser storage', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await api.listConversations();
    expect(fetchMock).toHaveBeenCalledWith(`${base}/conversations`, expect.objectContaining({
      headers: {},
    }));
  });

  it('throws parsed API errors and falls back to status text', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'bad request' }, { status: 400 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'denied' }, { status: 403 }))
      .mockResolvedValueOnce(new Response('nope', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.listConversations()).rejects.toThrow('bad request');
    await expect(api.listConversations()).rejects.toThrow('denied');
    await expect(api.listConversations()).rejects.toThrow('HTTP 500');
  });
});

describe('chatCompletionsStream', () => {
  it('streams content, reasoning, usage, and done callbacks from SSE chunks', async () => {
    window.sessionStorage.setItem('ag:web:auth:token', 'token');
    const fetchMock = vi.fn().mockResolvedValue(streamResponse([
      'event: message\n',
      'data: {"choices":[{"delta":{"reasoning_content":"think ","content":"hel"}}],"usage":{"prompt_tokens":3,"completion_tokens":4,"cost":0.5},"model":"served"}\n',
      'data: not-json\n',
      'data: {"choices":[{"delta":{"content":"lo"}}],"usage":{"input_tokens":8,"output_tokens":9},"model":"ignored"}\n',
      'data: [DONE]\n',
    ]));
    vi.stubGlobal('fetch', fetchMock);
    const cb = callbacks();

    await chatCompletionsStream('openai', {
      model: 'requested',
      messages: [{ role: 'user', content: 'hello' }],
      stream: true,
      stream_options: { include_usage: false },
    }, cb);

    expect(fetchMock).toHaveBeenCalledWith(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'X-Airgate-Platform': 'openai',
      },
      body: JSON.stringify({
        model: 'requested',
        messages: [{ role: 'user', content: 'hello' }],
        stream: true,
        stream_options: { include_usage: false },
      }),
      signal: undefined,
    });
    expect(cb.onReasoning).toHaveBeenCalledWith('think ');
    expect(cb.onData).toHaveBeenNthCalledWith(1, 'hel');
    expect(cb.onData).toHaveBeenNthCalledWith(2, 'lo');
    expect(cb.onDone).toHaveBeenCalledWith({
      input_tokens: 8,
      output_tokens: 9,
      model: 'ignored',
      cost: 0,
    });
    expect(cb.onError).not.toHaveBeenCalled();
  });

  it('includes usage by default and finishes when the reader ends without DONE', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(streamResponse([
      'data: {"choices":[{"delta":{"content":"done"}}]}\n',
    ])));
    const cb = callbacks();

    await chatCompletionsStream('openai', {
      model: 'requested',
      messages: [],
      stream: true,
    }, cb);

    expect(fetch).toHaveBeenCalledWith(`${base}/chat/completions`, expect.objectContaining({
      body: JSON.stringify({
        model: 'requested',
        messages: [],
        stream: true,
        stream_options: { include_usage: true },
      }),
    }));
    expect(cb.onData).toHaveBeenCalledWith('done');
    expect(cb.onDone).toHaveBeenCalledWith({
      input_tokens: 0,
      output_tokens: 0,
      model: 'requested',
      cost: 0,
    });
  });

  it('reports JSON stream errors and stops reading', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(streamResponse([
      'data: {"error":{"message":"model unavailable"}}\n',
      'data: {"choices":[{"delta":{"content":"ignored"}}]}\n',
    ])));
    const cb = callbacks();

    await chatCompletionsStream('openai', { model: 'm', messages: [], stream: true }, cb);
    expect(cb.onError).toHaveBeenCalledWith('model unavailable');
    expect(cb.onData).not.toHaveBeenCalled();
    expect(cb.onDone).not.toHaveBeenCalled();
  });

  it('reports string stream errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(streamResponse([
      'data: {"error":"plain error"}\n',
    ])));
    const cb = callbacks();

    await chatCompletionsStream('openai', { model: 'm', messages: [], stream: true }, cb);
    expect(cb.onError).toHaveBeenCalledWith('plain error');
  });

  it('reports HTTP errors with nested JSON and plain fallback messages', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'nested' } }, { status: 429 }))
      .mockResolvedValueOnce(new Response('oops', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    const cb = callbacks();

    await chatCompletionsStream('openai', { model: 'm', messages: [], stream: true }, cb);
    expect(cb.onError).toHaveBeenCalledWith('nested');

    await chatCompletionsStream('openai', { model: 'm', messages: [], stream: true }, cb);
    expect(cb.onError).toHaveBeenLastCalledWith('HTTP 503');
  });

  it('reports reader failures unless the request was aborted', async () => {
    const reader = { read: vi.fn().mockRejectedValue(new Error('reader failed')) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
      text: vi.fn(),
    }));
    const cb = callbacks();

    await chatCompletionsStream('openai', { model: 'm', messages: [], stream: true }, cb);
    expect(cb.onError).toHaveBeenCalledWith('reader failed');

    const aborted = new AbortController();
    aborted.abort();
    const abortedCallbacks = callbacks();
    await chatCompletionsStream('openai', { model: 'm', messages: [], stream: true }, abortedCallbacks, aborted.signal);
    expect(abortedCallbacks.onError).not.toHaveBeenCalled();
  });

  it('reports non-Error reader failures as stream failed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => ({ read: vi.fn().mockRejectedValue('bad') }) },
      text: vi.fn(),
    }));
    const cb = callbacks();

    await chatCompletionsStream('openai', { model: 'm', messages: [], stream: true }, cb);
    expect(cb.onError).toHaveBeenCalledWith('stream failed');
  });
});
