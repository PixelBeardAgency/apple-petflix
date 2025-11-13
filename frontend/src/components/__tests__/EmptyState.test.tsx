import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
import { VideoOff } from 'lucide-react';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        icon={VideoOff}
        title="No videos"
        description="Start by sharing your first video"
      />
    );

    expect(screen.getByText('No videos')).toBeInTheDocument();
    expect(screen.getByText('Start by sharing your first video')).toBeInTheDocument();
  });

  it('should render action button', () => {
    const mockAction = vi.fn();

    render(
      <EmptyState
        icon={VideoOff}
        title="No videos"
        description="Test description"
        action={{
          label: 'Add Video',
          onClick: mockAction,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Video' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should render secondary action button', () => {
    const mockPrimaryAction = vi.fn();
    const mockSecondaryAction = vi.fn();

    render(
      <EmptyState
        icon={VideoOff}
        title="No videos"
        description="Test description"
        action={{
          label: 'Primary Action',
          onClick: mockPrimaryAction,
        }}
        secondaryAction={{
          label: 'Secondary Action',
          onClick: mockSecondaryAction,
        }}
      />
    );

    const primaryButton = screen.getByRole('button', { name: 'Primary Action' });
    const secondaryButton = screen.getByRole('button', { name: 'Secondary Action' });

    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();

    fireEvent.click(secondaryButton);
    expect(mockSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('should render without actions', () => {
    render(
      <EmptyState
        icon={VideoOff}
        title="No videos"
        description="Test description"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render the icon', () => {
    const { container } = render(
      <EmptyState
        icon={VideoOff}
        title="No videos"
        description="Test description"
      />
    );

    // Check if SVG icon is rendered
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

