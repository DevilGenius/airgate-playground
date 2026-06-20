import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadMathRenderer() {
  vi.resetModules();
  return (await import('../MathRenderer')).default;
}

describe('MathRenderer', () => {
  beforeEach(() => {
    delete window.katex;
  });

  it('renders immediately when a KaTeX runtime is already available', async () => {
    const renderToString = vi.fn().mockReturnValue('<span data-testid="math-html">rendered</span>');
    window.katex = { renderToString };
    const MathRenderer = await loadMathRenderer();

    render(<MathRenderer displayMode={false} style={{ color: 'red' }} tex="x+1" />);

    expect(await screen.findByTestId('math-html')).toHaveTextContent('rendered');
    expect(renderToString).toHaveBeenCalledWith('x+1', {
      displayMode: false,
      throwOnError: false,
      strict: 'ignore',
      trust: false,
    });
    expect(document.head.querySelectorAll('link#airgate-playground-katex-css')).toHaveLength(1);
  });

  it('loads KaTeX assets once and renders after the script load event', async () => {
    const MathRenderer = await loadMathRenderer();
    const renderToString = vi.fn().mockReturnValue('<strong data-testid="loaded-math">loaded</strong>');

    render(<MathRenderer displayMode style={{ display: 'block' }} tex="y" />);
    expect(screen.getByText('y').tagName).toBe('DIV');

    const script = document.head.querySelector('script#airgate-playground-katex-js') as HTMLScriptElement;
    expect(script).toBeInTheDocument();
    expect(script.src).toContain('/plugins/airgate-playground/assets/katex/katex.min.js');
    expect(document.head.querySelector('link#airgate-playground-katex-css')).toBeInTheDocument();

    window.katex = { renderToString };
    fireEvent.load(script);

    expect(await screen.findByTestId('loaded-math')).toHaveTextContent('loaded');

    render(<MathRenderer displayMode={false} style={{}} tex="z" />);
    expect(document.head.querySelectorAll('link#airgate-playground-katex-css')).toHaveLength(1);
    expect(document.head.querySelectorAll('script#airgate-playground-katex-js')).toHaveLength(1);
  });

  it('keeps fallback text and removes the script when loading fails', async () => {
    const MathRenderer = await loadMathRenderer();

    render(<MathRenderer displayMode={false} style={{}} tex="bad" />);
    const script = document.head.querySelector('script#airgate-playground-katex-js') as HTMLScriptElement;
    fireEvent.error(script);

    await waitFor(() => {
      expect(screen.getByText('bad')).toBeInTheDocument();
      expect(document.head.querySelector('script#airgate-playground-katex-js')).not.toBeInTheDocument();
    });
  });

  it('does not update state after unmounting before KaTeX resolves', async () => {
    const MathRenderer = await loadMathRenderer();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(<MathRenderer displayMode={false} style={{}} tex="gone" />);
    const script = document.head.querySelector('script#airgate-playground-katex-js') as HTMLScriptElement;
    unmount();
    window.katex = { renderToString: vi.fn().mockReturnValue('<span>late</span>') };
    fireEvent.load(script);

    await Promise.resolve();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('recovers when a script loads without initializing KaTeX', async () => {
    const MathRenderer = await loadMathRenderer();

    render(<MathRenderer displayMode={false} style={{}} tex="missing" />);
    const script = document.head.querySelector('script#airgate-playground-katex-js') as HTMLScriptElement;
    fireEvent.load(script);

    await waitFor(() => {
      expect(screen.getByText('missing')).toBeInTheDocument();
    });
  });
});
