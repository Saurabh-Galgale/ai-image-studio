import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AuthInput from '../AuthInput';
import { Mail } from 'lucide-react';

test('renders label and responds to change', () => {
  const handleChange = jest.fn();
  const { getByPlaceholderText } = render(
    <AuthInput icon={Mail} label="Email" value="" onChange={handleChange} />
  );
  const input = getByPlaceholderText('Email') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'a@b.com' } });
  expect(handleChange).toHaveBeenCalled();
});

test('password toggle shows eye button', () => {
  const handleChange = jest.fn();
  const { getByRole } = render(
    <AuthInput icon={Mail} label="Password" type="password" value="secret" onChange={handleChange} />
  );
  // button exists
  expect(getByRole('button')).toBeInTheDocument();
});
