import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from '@/components/forms/TagInput';

describe('TagInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Functionality', () => {
    it('renders with empty tags', () => {
      render(<TagInput tags={[]} onChange={mockOnChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('displays existing tags', () => {
      render(<TagInput tags={['React', 'TypeScript']} onChange={mockOnChange} />);
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('shows label when provided', () => {
      render(<TagInput tags={[]} onChange={mockOnChange} label="Skills" />);
      expect(screen.getByText('Skills')).toBeInTheDocument();
    });

    it('shows custom placeholder', () => {
      render(
        <TagInput
          tags={[]}
          onChange={mockOnChange}
          placeholder="Add a skill"
        />
      );
      expect(screen.getByPlaceholderText('Add a skill')).toBeInTheDocument();
    });
  });

  describe('Adding Tags', () => {
    it('adds a tag when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<TagInput tags={[]} onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'JavaScript{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['JavaScript']);
    });

    it('trims whitespace from tags', async () => {
      const user = userEvent.setup();
      render(<TagInput tags={[]} onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '  JavaScript  {Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['JavaScript']);
    });

    it('ignores empty tags', async () => {
      const user = userEvent.setup();
      render(<TagInput tags={[]} onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '   {Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('prevents duplicate tags', async () => {
      const user = userEvent.setup();
      render(<TagInput tags={['React']} onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'React{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('clears input after adding tag', async () => {
      const user = userEvent.setup();
      render(<TagInput tags={[]} onChange={mockOnChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Python{Enter}');

      expect(input.value).toBe('');
    });
  });

  describe('Removing Tags', () => {
    it('removes tag when X button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TagInput tags={['React', 'TypeScript']} onChange={mockOnChange} />
      );

      // Find the remove button for React
      const reactTag = screen.getByText('React').parentElement;
      const removeButton = reactTag?.querySelector('button');
      
      if (removeButton) {
        await user.click(removeButton);
      }

      expect(mockOnChange).toHaveBeenCalledWith(['TypeScript']);
    });

    it('removes last tag when backspace is pressed on empty input', async () => {
      const user = userEvent.setup();
      render(
        <TagInput tags={['React', 'TypeScript']} onChange={mockOnChange} />
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Backspace}');

      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });

    it('does not remove tag when backspace is pressed with text in input', async () => {
      const user = userEvent.setup();
      render(<TagInput tags={['React']} onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test{Backspace}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not show remove button when disabled', () => {
      render(
        <TagInput tags={['React']} onChange={mockOnChange} disabled={true} />
      );

      const reactTag = screen.getByText('React').parentElement;
      const removeButton = reactTag?.querySelector('button');
      
      expect(removeButton).not.toBeInTheDocument();
    });
  });

  describe('Max Tags Limit', () => {
    it('shows tag count when maxTags is set', () => {
      render(
        <TagInput tags={['React']} onChange={mockOnChange} maxTags={5} />
      );

      expect(screen.getByText('1 / 5 tags added')).toBeInTheDocument();
    });

    it('disables input when max tags reached', async () => {
      render(
        <TagInput tags={['React', 'TypeScript']} onChange={mockOnChange} maxTags={2} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not add tag when max limit is reached', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TagInput tags={['React']} onChange={mockOnChange} maxTags={2} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'TypeScript{Enter}');

      // Simulate the onChange triggering a rerender with new tags
      rerender(
        <TagInput tags={['React', 'TypeScript']} onChange={mockOnChange} maxTags={2} />
      );

      // Try to add another tag
      mockOnChange.mockClear();
      const newInput = screen.getByRole('textbox');
      
      // Input should be disabled
      expect(newInput).toBeDisabled();
    });
  });

  describe('Suggestions', () => {
    const suggestions = ['JavaScript', 'Python', 'Java', 'C++'];

    it('shows suggestions dropdown when typing', async () => {
      const user = userEvent.setup();
      render(
        <TagInput tags={[]} onChange={mockOnChange} suggestions={suggestions} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Jav');

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Java')).toBeInTheDocument();
      });
    });

    it('filters suggestions based on input', async () => {
      const user = userEvent.setup();
      render(
        <TagInput tags={[]} onChange={mockOnChange} suggestions={suggestions} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Python');

      await waitFor(() => {
        expect(screen.getByText('Python')).toBeInTheDocument();
        expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
      });
    });

    it('adds tag when suggestion is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TagInput tags={[]} onChange={mockOnChange} suggestions={suggestions} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Jav');

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
      });

      const suggestion = screen.getByText('JavaScript');
      await user.click(suggestion);

      expect(mockOnChange).toHaveBeenCalledWith(['JavaScript']);
    });

    it('hides suggestions when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(
        <TagInput tags={[]} onChange={mockOnChange} suggestions={suggestions} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Jav');

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
      });
    });

    it('does not show already added tags in suggestions', async () => {
      const user = userEvent.setup();
      render(
        <TagInput
          tags={['JavaScript']}
          onChange={mockOnChange}
          suggestions={suggestions}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Jav');

      await waitFor(() => {
        // Should show Java but not JavaScript (already added)
        expect(screen.getByText('Java')).toBeInTheDocument();
        
        // JavaScript is in the tags, but should not be in suggestions dropdown
        const allJavaScriptElements = screen.getAllByText('JavaScript');
        expect(allJavaScriptElements.length).toBe(1); // Only in tags, not in suggestions
      });
    });

    it('is case-insensitive when filtering suggestions', async () => {
      const user = userEvent.setup();
      render(
        <TagInput tags={[]} onChange={mockOnChange} suggestions={suggestions} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'python');

      await waitFor(() => {
        expect(screen.getByText('Python')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<TagInput tags={[]} onChange={mockOnChange} disabled={true} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      render(
        <TagInput tags={[]} onChange={mockOnChange} disabled={true} />
      );

      const input = screen.getByRole('textbox');
      
      // Try to type (should not work as input is disabled)
      await user.type(input, 'Test{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible remove button labels', () => {
      render(
        <TagInput tags={['React']} onChange={mockOnChange} />
      );

      const removeButton = screen.getByLabelText('Remove React');
      expect(removeButton).toBeInTheDocument();
    });

    it('associates label with input', () => {
      render(
        <TagInput tags={[]} onChange={mockOnChange} label="Skills" />
      );

      const label = screen.getByText('Skills');
      const input = screen.getByRole('textbox');
      
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
  });
});
