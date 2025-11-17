import React from 'react';
import { render } from '@testing-library/react';
import SecondaryButton from '../SecondaryButton';

test('renders children', () => {
  const { getByText } = render(<SecondaryButton>More</SecondaryButton>);
  expect(getByText('More')).toBeInTheDocument();
});
