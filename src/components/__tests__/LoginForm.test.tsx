import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../LoginForm';
import axios from 'axios';
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));


jest.mock('axios');
const mocked = axios as jest.Mocked<typeof axios>;

test('shows validation errors', async () => {
  const onSwitch = jest.fn();
  const onGuest = jest.fn();
  const { getByText, getByPlaceholderText } = render(<LoginForm onSwitchToSignup={onSwitch} onGuestLogin={onGuest} />);
  const submit = getByText(/Sign In/i);
  fireEvent.click(submit);
  await waitFor(() => expect(getByText(/Email is required|Password is required/)).toBeTruthy());
});

test('successful login stores token', async () => {
  const onSwitch = jest.fn();
  const onGuest = jest.fn();
  mocked.post.mockResolvedValue({ status: 200, data: { token: 't', user: { id: 1 } } });
  const { getByPlaceholderText, getByText } = render(<LoginForm onSwitchToSignup={onSwitch} onGuestLogin={onGuest} />);
  fireEvent.change(getByPlaceholderText('Email Address'), { target: { value: 'a@b.com' } });
  fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'password123' } });
  fireEvent.click(getByText('Sign In'));
  await waitFor(() => expect(localStorage.getItem('token')).toBe('t'));
});
