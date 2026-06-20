import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import plugin from '../index';

describe('plugin entry', () => {
  it('exports playground and chat routes backed by the same lazy component', () => {
    expect(plugin.routes?.map(route => route.path)).toEqual(['/playground', '/chat']);
    expect(plugin.routes?.[0].component).toBe(plugin.routes?.[1].component);
  });

  it('lazy-loads the route component', async () => {
    vi.resetModules();
    vi.doMock('../PlaygroundPage', () => ({
      ChatPage: () => <div>Mock chat page</div>,
    }));
    const freshPlugin = (await import('../index')).default;
    const Route = freshPlugin.routes?.[0].component;
    expect(Route).toBeTruthy();

    render(
      <Suspense fallback={<div>Loading</div>}>
        {Route ? <Route /> : null}
      </Suspense>,
    );

    expect(await screen.findByText('Mock chat page')).toBeInTheDocument();
    vi.doUnmock('../PlaygroundPage');
  });
});
