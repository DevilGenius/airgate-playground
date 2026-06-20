import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChatPage from '../PlaygroundPage';

const pageState = vi.hoisted(() => ({
  current: {
    t: (key: string, options?: Record<string, unknown>) => String(options?.defaultValue || key),
    previewImage: null as null | { images: Array<{ url: string; alt: string }>; index: number },
    setPreviewImage: vi.fn(),
    showNextPreviewImage: vi.fn(),
  },
}));

vi.mock('../playground/PlaygroundContext', () => ({
  PlaygroundProvider: ({ children }: { children: ReactNode }) => <div data-testid="provider">{children}</div>,
  usePlayground: () => pageState.current,
}));

vi.mock('../playground/ConversationSidebar', () => ({
  ConversationSidebar: () => <aside data-testid="sidebar" />,
}));

vi.mock('../playground/ConversationTabs', () => ({
  ConversationTabs: () => <nav data-testid="tabs" />,
}));

vi.mock('../playground/ChatView', () => ({
  ChatView: () => <main data-testid="chat" />,
}));

describe('PlaygroundPage', () => {
  it('renders the playground shell without an image preview', () => {
    pageState.current.previewImage = null;
    render(<ChatPage />);

    expect(screen.getByTestId('provider')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('chat')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders preview navigation and close actions for multi-image previews', () => {
    pageState.current.setPreviewImage = vi.fn();
    pageState.current.showNextPreviewImage = vi.fn();
    pageState.current.previewImage = {
      index: 1,
      images: [
        { url: 'https://example.com/one.png', alt: 'One' },
        { url: 'https://example.com/two.png', alt: 'Two' },
      ],
    };

    render(<ChatPage />);

    expect(screen.getByRole('dialog', { name: 'Two' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Two' })).toHaveAttribute('src', 'https://example.com/two.png');
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(pageState.current.showNextPreviewImage).toHaveBeenCalledWith(-1);
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(pageState.current.showNextPreviewImage).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: 'playground.close_image_preview' }));
    expect(pageState.current.setPreviewImage).toHaveBeenCalledWith(null);
  });

  it('closes on backdrop clicks but not modal clicks', () => {
    pageState.current.setPreviewImage = vi.fn();
    pageState.current.previewImage = {
      index: 0,
      images: [{ url: 'https://example.com/one.png', alt: '' }],
    };

    const { container } = render(<ChatPage />);

    expect(screen.queryByRole('button', { name: 'Previous image' })).not.toBeInTheDocument();
    fireEvent.click(container.querySelector('img') as HTMLImageElement);
    expect(pageState.current.setPreviewImage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog'));
    expect(pageState.current.setPreviewImage).toHaveBeenCalledWith(null);
  });

  it('renders nothing for empty preview image lists', () => {
    pageState.current.previewImage = { index: 0, images: [] };
    render(<ChatPage />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
