import React from 'react';
import { render } from '@testing-library/react';
import FloatingParticles from '../FloatingParticles';

test('renders particles container', () => {
  const { container } = render(<FloatingParticles />);
  expect(container.firstChild).toBeTruthy();
});
