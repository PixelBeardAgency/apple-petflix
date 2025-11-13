import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('should not render when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        description="Are you sure?"
      />
    );

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Video"
        description="This action cannot be undone"
      />
    );

    expect(screen.getByText('Delete Video')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    const mockConfirm = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={mockConfirm}
        title="Delete"
        description="Are you sure?"
        confirmText="Delete"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', () => {
    const mockClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockClose}
        onConfirm={vi.fn()}
        title="Delete"
        description="Are you sure?"
        cancelText="Cancel"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        description="Are you sure?"
        loading={true}
      />
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Buttons should be disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should show destructive variant', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        description="Are you sure?"
        variant="destructive"
      />
    );

    // Check for alert icon
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  it('should use custom button text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        description="Are you sure?"
        confirmText="Yes, delete it"
        cancelText="No, keep it"
      />
    );

    expect(screen.getByRole('button', { name: 'Yes, delete it' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, keep it' })).toBeInTheDocument();
  });
});

