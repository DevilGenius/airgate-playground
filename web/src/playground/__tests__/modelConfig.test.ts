import { describe, expect, it } from 'vitest';
import { CHAT_MODEL_REGISTRY } from '../modelConfig';

describe('playground model config', () => {
  it('removes GPT-5.4 and GPT-5.4 Mini', () => {
    expect(CHAT_MODEL_REGISTRY.some(model => model.id === 'gpt-5.4')).toBe(false);
    expect(CHAT_MODEL_REGISTRY.some(model => model.id === 'gpt-5.4-mini')).toBe(false);
  });

  it.each([
    ['gpt-5.6-sol', 'GPT 5.6 Sol', 5, 30],
    ['gpt-5.6-terra', 'GPT 5.6 Terra', 2.5, 15],
    ['gpt-5.6-luna', 'GPT 5.6 Luna', 1, 6],
  ])('registers %s with current API metadata', (id, name, inputPrice, outputPrice) => {
    expect(CHAT_MODEL_REGISTRY.find(model => model.id === id)).toEqual({
      id,
      name,
      platform: 'openai',
      input_price: inputPrice,
      output_price: outputPrice,
      context_window: 1050000,
      max_output_tokens: 128000,
      capabilities: ['chat', 'reasoning'],
    });
  });
});
