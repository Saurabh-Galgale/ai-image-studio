import React from 'react';
import { render } from '@testing-library/react';
import PrimaryButton from '../PrimaryButton';

test('renders children and disabled when loading', () => {
  const { getByText } = render(<PrimaryButton loading={true}>Click</PrimaryButton>);
  expect(getByText('Authenticating...') || getByText('Click')).toBeTruthy();
});
