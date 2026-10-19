import React from 'react';
import { render, screen } from '@testing-library/react';
import OverdueSummary from '../OverdueSummary';

describe('OverdueSummary Component', () => {
  it('should render nothing when the count is 0', () => {
    const { container } = render(<OverdueSummary count={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should show the count with the overdue text when greater than 0', () => {
    render(<OverdueSummary count={3} />);

    expect(screen.getByRole('status')).toHaveTextContent('3 overdue');
  });

  it('should show the count for a single overdue todo', () => {
    render(<OverdueSummary count={1} />);

    expect(screen.getByRole('status')).toHaveTextContent('1 overdue');
  });
});
