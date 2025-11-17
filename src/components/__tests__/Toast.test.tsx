import React from 'react';
import { render } from '@testing-library/react';
import Toast from '../Toast';

jest.useFakeTimers();

test('renders success toast and auto closes', () => {
  const onClose = jest.fn();
  const { getByText } = render(<Toast message="ok" type="success" onClose={onClose} />);
  expect(getByText('ok')).toBeInTheDocument();
  jest.advanceTimersByTime(3000);
  expect(onClose).toHaveBeenCalled();
});
