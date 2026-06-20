import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  GeneratedImageFrame,
  appendTrailingInlineAction,
  parseImageGroupImages,
  renderImageGallery,
  renderImageGroup,
  renderInlineMarkdown,
  renderMessageContent,
} from '../MessageRendering';

const pngDataUrl = 'data:image/png;base64,aGVsbG8=';

function renderNodes(nodes: React.ReactNode) {
  return render(<div>{nodes}</div>);
}

describe('MessageRendering', () => {
  it('renders generated images with dimensions and optional preview clicks', () => {
    const onImagePreview = vi.fn();
    render(
      <GeneratedImageFrame
        url={pngDataUrl}
        alt="generated"
        imageIndex={2}
        options={{ imagePreviewTitle: 'Preview this', onImagePreview }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Preview this' });
    const image = screen.getByRole('img', { name: 'generated' });
    Object.defineProperty(image, 'naturalWidth', { value: 640, configurable: true });
    Object.defineProperty(image, 'naturalHeight', { value: 480, configurable: true });
    fireEvent.load(image);
    expect(screen.getByText('640×480')).toBeInTheDocument();

    fireEvent.click(button);
    expect(onImagePreview).toHaveBeenCalledWith(pngDataUrl, 'generated', 2);
  });

  it('renders image frames without a preview button when no callback is provided', () => {
    const { container } = render(<GeneratedImageFrame url={pngDataUrl} alt="" imageIndex={-1} options={{ generatedImageAlt: 'Generated image' }} />);
    expect(container.querySelector('img')).toHaveAttribute('src', pngDataUrl);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('parses pure image groups and rejects mixed content', () => {
    const group = `![one](${pngDataUrl})\n![two](https://example.com/two.png)`;

    expect(parseImageGroupImages(group)).toEqual([
      { alt: 'one', url: pngDataUrl },
      { alt: 'two', url: 'https://example.com/two.png' },
    ]);
    expect(parseImageGroupImages(group)).toHaveLength(2);
    expect(parseImageGroupImages(`text\n${group}`)).toBeNull();
    expect(parseImageGroupImages('plain text')).toBeNull();
  });

  it('renders image groups and galleries with default alt text', () => {
    const { container, rerender } = renderNodes(renderImageGroup(`![](${pngDataUrl})`, 'group', {
      generatedImageAlt: 'Default generated',
    }));
    expect(screen.getByRole('img', { name: 'Default generated' })).toBeInTheDocument();

    rerender(<div>{renderImageGallery([{ alt: 'Gallery', url: pngDataUrl }], 'gallery')}</div>);
    expect(container.querySelectorAll('img')).toHaveLength(1);

    rerender(<div>{renderImageGroup('not only images', 'none')}</div>);
    expect(container.textContent).toBe('');
  });

  it('renders inline markdown syntax and preserves unsafe links or images as text', () => {
    const takeImageIndex = vi.fn()
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(11);
    const onImagePreview = vi.fn();
    const { container } = renderNodes(renderInlineMarkdown([
      'line one',
      '`code` **bold _em_** __strong__ *italic*',
      '[safe](https://example.com) [mail](mailto:user@example.com) [hash](#hash) [bad](javascript:alert(1))',
      `![safe](${pngDataUrl}) ![runtime](/assets-runtime/a.png) ![bad](javascript:alert(1))`,
      '\\(x+1\\) $y+2$',
    ].join('\n'), 'inline', {
      generatedImageAlt: 'Generated',
      imagePreviewTitle: 'Open image',
      onImagePreview,
      takeImageIndex,
    }));

    expect(container.querySelector('br')).toBeInTheDocument();
    expect(screen.getByText('code').tagName).toBe('CODE');
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('em').tagName).toBe('EM');
    expect(screen.getByText('italic').tagName).toBe('EM');
    expect(screen.getByRole('link', { name: 'safe' })).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByRole('link', { name: 'mail' })).toHaveAttribute('href', 'mailto:user@example.com');
    expect(screen.getByRole('link', { name: 'hash' })).toHaveAttribute('href', '#hash');
    expect(container.textContent).toContain('[bad](javascript:alert(1))');
    expect(screen.getAllByRole('button', { name: 'Open image' })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Open image' })[0]);
    expect(onImagePreview).toHaveBeenCalledWith(pngDataUrl, 'safe', 10);
  });

  it('returns raw text when no inline markdown is found', () => {
    expect(renderInlineMarkdown('plain', 'plain')).toEqual(['plain']);
  });

  it('renders block markdown structures and trailing inline actions', () => {
    const { container } = renderNodes(renderMessageContent([
      '# H1',
      '## H2',
      '### H3',
      '#### H4',
      '##### H5',
      '',
      '> quoted',
      '> text',
      '',
      '- one',
      '* two',
      '1. first',
      '2) second',
      '',
      '---',
      '',
      '```ts',
      'const x = 1;',
      '```',
      '',
      '$$a+b$$',
      '\\[c+d\\]',
      '$$inline$$ tail',
      '$$',
      'multi',
      '$$ tail',
      '',
      'paragraph',
    ].join('\n'), {
      trailingInlineAction: <button type="button">Copy</button>,
    }));

    expect(container.querySelectorAll('h1,h2,h3,h4')).toHaveLength(5);
    expect(container.querySelector('blockquote')?.textContent).toBe('quotedtext');
    expect(container.querySelector('blockquote br')).toBeInTheDocument();
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
    expect(container.querySelector('hr')).toBeInTheDocument();
    expect(container.querySelector('pre')?.textContent).toBe('const x = 1;');
    expect(container.textContent).toContain('a+b');
    expect(container.textContent).toContain('c+d');
    expect(container.textContent).toContain('inline');
    expect(container.textContent).toContain('multi');
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('flushes unclosed code and math blocks at end of content', () => {
    const { container, rerender } = renderNodes(renderMessageContent('```\nopen code'));
    expect(container.querySelector('pre')?.textContent).toBe('open code');

    rerender(<div>{renderMessageContent('\\[\nopen math')}</div>);
    expect(container.textContent).toContain('open math');
  });

  it('groups adjacent image-only paragraphs into a gallery and renders mixed images inline', () => {
    const { container } = renderNodes(renderMessageContent([
      `![one](${pngDataUrl})`,
      '',
      `![two](https://example.com/two.png)`,
      '',
      `caption ![inline](${pngDataUrl})`,
    ].join('\n'), { generatedImageAlt: 'Generated image' }));

    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(container.textContent).toContain('caption');
  });

  it('returns original content when there is nothing to render', () => {
    expect(renderMessageContent('')).toBe('');
  });

  it('appends trailing actions to supported nodes and nested lists only', () => {
    const action = <button type="button">Act</button>;
    const { rerender } = renderNodes(appendTrailingInlineAction([
      <div key="unsupported">Unsupported</div>,
      <p key="p">Paragraph</p>,
    ], action));
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
    expect(screen.getByText('Paragraph').textContent).toBe('ParagraphAct');

    rerender(<div>{appendTrailingInlineAction([
      <ul key="list"><li>Nested</li></ul>,
    ], action)}</div>);
    expect(screen.getByText('Nested').textContent).toBe('NestedAct');

    const unchanged = appendTrailingInlineAction([<div key="only">Only div</div>], action);
    rerender(<div>{unchanged}</div>);
    expect(screen.queryByRole('button', { name: 'Act' })).not.toBeInTheDocument();
  });

  it('leaves nodes untouched when no trailing action is supplied', () => {
    const nodes = [<p key="p">Paragraph</p>];
    expect(appendTrailingInlineAction(nodes)).toBe(nodes);
  });
});
