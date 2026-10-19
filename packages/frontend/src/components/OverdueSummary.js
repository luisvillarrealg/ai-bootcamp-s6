import React from 'react';

function OverdueSummary({ count }) {
  if (!count || count < 1) {
    return null;
  }

  return (
    <span className="overdue-summary" role="status">
      {count} overdue
    </span>
  );
}

export default OverdueSummary;
