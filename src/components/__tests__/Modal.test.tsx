import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

test('does not render when closed', () => {
  const { queryByText } = render(<Modal isOpen={false} onClose={() => {}} onRetry={() => {}} retryCount={0} />);
  expect(queryByText('Model Overloaded')).toBeNull();
});

test('renders and retry button works', () => {
  const onRetry = jest.fn();
  const onClose = jest.fn();
  const { getByText } = render(<Modal isOpen={true} onClose={onClose} onRetry={onRetry} retryCount={0} />);
  const btn = getByText('Try Again');
  fireEvent.click(btn);
  expect(onRetry).toHaveBeenCalled();
});
