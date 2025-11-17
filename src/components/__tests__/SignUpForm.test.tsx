import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from '../SignUpForm';
import axios from 'axios';
jest.mock("axios");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));


jest.mock('axios');
const mocked = axios as jest.Mocked<typeof axios>;

test('shows validation errors on submit', async () => {
  const setIsLogin = jest.fn();
  const onSwitch = jest.fn();
  const onGuest = jest.fn();
  const { getByText } = render(<SignupForm setIsLogin={setIsLogin} onSwitchToLogin={onSwitch} onGuestLogin={onGuest} />);
  fireEvent.click(getByText('Create Account'));
  await waitFor(() => expect(getByText(/Name is required|Email is required|Password is required/)).toBeTruthy());
});

test('successful signup stores token', async () => {
  const setIsLogin = jest.fn();
  const onSwitch = jest.fn();
  const onGuest = jest.fn();
  mocked.post.mockResolvedValue({ status: 201, data: { token: 't', user: { id: 1 } } });
  const { getByPlaceholderText, getByText } = render(<SignupForm setIsLogin={setIsLogin} onSwitchToLogin={onSwitch} onGuestLogin={onGuest} />);
  fireEvent.change(getByPlaceholderText('Full Name'), { target: { value: 'Ajay' } });
  fireEvent.change(getByPlaceholderText('Email Address'), { target: { value: 'a@b.com' } });
  fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'password123' } });
  fireEvent.click(getByText('Create Account'));
  await waitFor(() => expect(localStorage.getItem('token')).toBe('t'));
});
