import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from '../TodoCard';
import { daysFromToday } from '../../__mocks__/dateHelpers';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    const { container } = render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const card = container.querySelector('.todo-card');
    expect(card).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  describe('overdue indicators', () => {
    const today = '2026-10-19';
    const overdueTodo = { ...mockTodo, dueDate: '2026-10-16' };

    it('should show the overdue label with the day count for an overdue todo', () => {
      render(<TodoCard todo={overdueTodo} today={today} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Overdue by 3 days')).toBeInTheDocument();
    });

    it('should use the singular day form for a todo overdue by one day', () => {
      const todo = { ...mockTodo, dueDate: '2026-10-18' };
      render(<TodoCard todo={todo} today={today} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Overdue by 1 day')).toBeInTheDocument();
    });

    it('should add overdue classes to the card and due date', () => {
      const { container } = render(
        <TodoCard todo={overdueTodo} today={today} {...mockHandlers} isLoading={false} />
      );

      expect(container.querySelector('.todo-card')).toHaveClass('overdue');
      expect(container.querySelector('.todo-due-date')).toHaveClass('overdue');
    });

    it('should hide the decorative icon from assistive technologies', () => {
      const { container } = render(
        <TodoCard todo={overdueTodo} today={today} {...mockHandlers} isLoading={false} />
      );

      expect(container.querySelector('.todo-overdue-label [aria-hidden="true"]')).toBeInTheDocument();
    });

    it('should not show indicators for a todo due today', () => {
      const todo = { ...mockTodo, dueDate: today };
      const { container } = render(
        <TodoCard todo={todo} today={today} {...mockHandlers} isLoading={false} />
      );

      expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
      expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    });

    it('should not show indicators for a future todo', () => {
      const todo = { ...mockTodo, dueDate: '2026-10-25' };
      render(<TodoCard todo={todo} today={today} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
    });

    it('should not show indicators for a todo without a due date', () => {
      const todo = { ...mockTodo, dueDate: null };
      render(<TodoCard todo={todo} today={today} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
    });

    it('should not show indicators for a completed todo with a past due date', () => {
      const todo = { ...overdueTodo, completed: 1 };
      const { container } = render(
        <TodoCard todo={todo} today={today} {...mockHandlers} isLoading={false} />
      );

      expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
      expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    });

    it('should default today to the current date when no today prop is provided', () => {
      render(<TodoCard todo={{ ...mockTodo, dueDate: '2000-01-01' }} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText(/^Overdue by \d+ days$/)).toBeInTheDocument();
    });

    it('should not flag a todo due today when no today prop is provided', () => {
      render(<TodoCard todo={{ ...mockTodo, dueDate: daysFromToday(0) }} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
    });

    it('should keep the title, checkbox, and actions available on an overdue todo', () => {
      render(<TodoCard todo={overdueTodo} today={today} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Test Todo')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByLabelText(/Edit/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Delete/)).toBeInTheDocument();
    });

    it('should show the label again when a completed todo is reopened', () => {
      const completed = { ...overdueTodo, completed: 1 };
      const { rerender } = render(
        <TodoCard todo={completed} today={today} {...mockHandlers} isLoading={false} />
      );
      expect(screen.queryByText(/^Overdue by/)).not.toBeInTheDocument();

      rerender(<TodoCard todo={{ ...completed, completed: 0 }} today={today} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Overdue by 3 days')).toBeInTheDocument();
    });

    it.each([
      ['today', '2026-10-19', null],
      ['a future date', '2026-10-25', null],
      ['no date', null, null]
    ])('should remove the label when the due date changes to %s', (_name, dueDate) => {
      const { rerender } = render(
        <TodoCard todo={overdueTodo} today={today} {...mockHandlers} isLoading={false} />
      );
      expect(screen.getByText('Overdue by 3 days')).toBeInTheDocument();

      rerender(<TodoCard todo={{ ...overdueTodo, dueDate }} today={today} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText(/^Overdue by/)).not.toBeInTheDocument();
    });

    it('should add the label when the due date changes from the future to the past', () => {
      const future = { ...mockTodo, dueDate: '2026-10-25' };
      const { rerender } = render(
        <TodoCard todo={future} today={today} {...mockHandlers} isLoading={false} />
      );
      expect(screen.queryByText(/^Overdue by/)).not.toBeInTheDocument();

      rerender(<TodoCard todo={{ ...future, dueDate: '2026-10-17' }} today={today} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Overdue by 2 days')).toBeInTheDocument();
    });
  });
});
