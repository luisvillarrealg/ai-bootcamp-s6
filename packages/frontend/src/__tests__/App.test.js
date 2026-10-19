import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';
import { daysFromToday } from '../__mocks__/dateHelpers';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)' ? false : true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock server to intercept API requests
const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, title: 'Learn React', dueDate: '2025-12-15', completed: 0, createdAt: '2025-11-01T00:00:00Z' },
        { id: 2, title: 'Build TODO app', dueDate: null, completed: 0, createdAt: '2025-11-02T00:00:00Z' }
      ])
    );
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const { title, dueDate } = req.body;
    
    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Todo title is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title,
        dueDate: dueDate || null,
        completed: 0,
        createdAt: new Date().toISOString()
      })
    );
  }),

  rest.put('/api/todos/:id', (req, res, ctx) => {
    const { title, dueDate } = req.body;
    
    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Todo title is required' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(req.params.id),
        title,
        dueDate: dueDate || null,
        completed: 0,
        createdAt: '2025-11-01T00:00:00Z'
      })
    );
  }),

  rest.patch('/api/todos/:id/toggle', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(req.params.id),
        title: 'Test Todo',
        dueDate: null,
        completed: 1,
        createdAt: '2025-11-01T00:00:00Z'
      })
    );
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Todo deleted successfully', id: parseInt(req.params.id) })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorageMock.clear();
});
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the app header with title', async () => {
    render(<App />);
    expect(screen.getByText('My Todos')).toBeInTheDocument();
    expect(screen.getByText('🎃')).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    render(<App />);

    expect(screen.getByText('Loading your todos...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Learn React')).toBeInTheDocument();
      expect(screen.getByText('Build TODO app')).toBeInTheDocument();
    });
  });

  test('creates a new todo', async () => {
    render(<App />);

    // Wait for the initial loading to complete and todos to load
    await waitFor(() => {
      expect(screen.queryByText('Loading your todos...')).not.toBeInTheDocument();
    });

    // Wait for the input to be enabled (no longer disabled during initial load)
    const titleInput = await screen.findByPlaceholderText('Add a new todo...');
    
    // Verify the button shows "Add Todo" (not "Adding...")
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add Todo/ });
      expect(addButton).not.toBeDisabled();
    });

    // Now fill in and submit the form
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });

    const addButton = screen.getByRole('button', { name: /Add Todo/ });
    fireEvent.click(addButton);

    // Wait for the new todo to appear in the list
    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument();
    });
  });

  test('toggles todo completion status', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Learn React')).toBeInTheDocument();
    });

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  test('handles API error when fetching todos', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load todos/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no todos', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/No todos yet. Add one to get started!/)).toBeInTheDocument();
    });
  });

  test('toggles theme between light and dark', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
    });

    const themeToggle = screen.getByRole('button', { name: /Switch to dark mode/ });
    fireEvent.click(themeToggle);

    expect(localStorage.getItem('todoAppTheme')).toBe('dark');

    const themToggleAfter = screen.getByRole('button', { name: /Switch to light mode/ });
    fireEvent.click(themToggleAfter);
    expect(localStorage.getItem('todoAppTheme')).toBe('light');
  });
});

describe('App overdue indicators', () => {
  const buildTodos = () => [
    { id: 1, title: 'Late task', dueDate: daysFromToday(-3), completed: 0, createdAt: '2025-11-01T00:00:00Z' },
    { id: 2, title: 'Later task', dueDate: daysFromToday(-1), completed: 0, createdAt: '2025-11-02T00:00:00Z' },
    { id: 3, title: 'Today task', dueDate: daysFromToday(0), completed: 0, createdAt: '2025-11-03T00:00:00Z' },
    { id: 4, title: 'Future task', dueDate: daysFromToday(5), completed: 0, createdAt: '2025-11-04T00:00:00Z' },
    { id: 5, title: 'Done task', dueDate: daysFromToday(-10), completed: 1, createdAt: '2025-11-05T00:00:00Z' }
  ];

  const useTodos = (todos) => {
    server.use(rest.get('/api/todos', (req, res, ctx) => res(ctx.status(200), ctx.json(todos))));
  };

  test('shows indicators only on overdue todos', async () => {
    useTodos(buildTodos());
    render(<App />);

    expect(await screen.findByText('Overdue by 3 days')).toBeInTheDocument();
    expect(screen.getByText('Overdue by 1 day')).toBeInTheDocument();
    expect(screen.getAllByText(/^Overdue by/)).toHaveLength(2);
  });

  test('shows the global overdue counter in the header', async () => {
    useTodos(buildTodos());
    render(<App />);

    expect(await screen.findByRole('status')).toHaveTextContent('2 overdue');
  });

  test('hides the counter when nothing is overdue', async () => {
    useTodos([buildTodos()[2], buildTodos()[3], buildTodos()[4]]);
    render(<App />);

    await screen.findByText('Today task');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('updates the counter and indicators when an overdue todo is completed', async () => {
    useTodos(buildTodos());
    server.use(
      rest.patch('/api/todos/:id/toggle', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ ...buildTodos()[0], completed: 1 }))
      )
    );
    render(<App />);

    await screen.findByText('Overdue by 3 days');
    fireEvent.click(screen.getByLabelText('Mark "Late task" as complete'));

    await waitFor(() => {
      expect(screen.queryByText('Overdue by 3 days')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('status')).toHaveTextContent('1 overdue');
  });

  test('shows indicators for a newly created todo with a past due date', async () => {
    useTodos([]);
    server.use(
      rest.post('/api/todos', (req, res, ctx) =>
        res(
          ctx.status(201),
          ctx.json({ id: 9, title: 'Backdated', dueDate: daysFromToday(-2), completed: 0, createdAt: '2025-11-06T00:00:00Z' })
        )
      )
    );
    render(<App />);

    const titleInput = await screen.findByPlaceholderText('Add a new todo...');
    await waitFor(() => expect(screen.getByRole('button', { name: /Add Todo/ })).not.toBeDisabled());
    fireEvent.change(titleInput, { target: { value: 'Backdated' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Todo/ }));

    expect(await screen.findByText('Overdue by 2 days')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 overdue');
  });

  test('restores the indicator when a completed overdue todo is reopened', async () => {
    useTodos([{ ...buildTodos()[4] }]);
    server.use(
      rest.patch('/api/todos/:id/toggle', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ ...buildTodos()[4], completed: 0 }))
      )
    );
    render(<App />);

    await screen.findByText('Done task');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Mark "Done task" as incomplete'));

    expect(await screen.findByText('Overdue by 10 days')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 overdue');
  });

  const editDueDate = async (title, dueDate) => {
    fireEvent.click(screen.getByLabelText(`Edit "${title}"`));
    fireEvent.change(screen.getByLabelText('Edit due date'), { target: { value: dueDate } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  };

  const mockEdit = (todo, dueDate) => {
    server.use(
      rest.put('/api/todos/:id', (req, res, ctx) => res(ctx.status(200), ctx.json({ ...todo, dueDate })))
    );
  };

  test('removes the indicator and decrements the counter when the due date moves to the future', async () => {
    const [late, later] = buildTodos();
    useTodos([late, later]);
    mockEdit(late, daysFromToday(4));
    render(<App />);

    await screen.findByText('Overdue by 3 days');
    await editDueDate('Late task', daysFromToday(4));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 overdue'));
    expect(screen.queryByText('Overdue by 3 days')).not.toBeInTheDocument();
  });

  test('removes the indicator and hides the counter when the due date is cleared', async () => {
    const [late] = buildTodos();
    useTodos([late]);
    mockEdit(late, null);
    render(<App />);

    await screen.findByText('Overdue by 3 days');
    await editDueDate('Late task', '');

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText('Overdue by 3 days')).not.toBeInTheDocument();
  });

  test('adds the indicator and increments the counter when the due date moves to the past', async () => {
    const future = buildTodos()[3];
    useTodos([future]);
    mockEdit(future, daysFromToday(-2));
    render(<App />);

    await screen.findByText('Future task');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await editDueDate('Future task', daysFromToday(-2));

    expect(await screen.findByText('Overdue by 2 days')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 overdue');
  });

  test('updates the counter when an overdue todo is deleted', async () => {
    const [late, later] = buildTodos();
    useTodos([late, later]);
    render(<App />);

    await screen.findByText('Overdue by 3 days');
    expect(screen.getByRole('status')).toHaveTextContent('2 overdue');
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByLabelText('Delete "Late task"'));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 overdue'));
    expect(screen.queryByText('Overdue by 3 days')).not.toBeInTheDocument();
    window.confirm.mockRestore();
  });

  test('refreshes overdue status when the tab regains focus on a new day', async () => {
    const RealDate = Date;
    const oneDayLater = RealDate.now() + 24 * 60 * 60 * 1000;
    useTodos([
      { id: 1, title: 'Due today', dueDate: daysFromToday(0), completed: 0, createdAt: '2025-11-01T00:00:00Z' }
    ]);
    render(<App />);

    await screen.findByText('Due today');
    expect(screen.queryByText(/^Overdue by/)).not.toBeInTheDocument();

    // Simulate the clock moving forward one day while the tab was in the background
    global.Date = class extends RealDate {
      constructor(...args) {
        super(...(args.length ? args : [oneDayLater]));
      }
    };

    try {
      fireEvent.focus(window);
      expect(await screen.findByText('Overdue by 1 day')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('1 overdue');
    } finally {
      global.Date = RealDate;
    }
  });
});