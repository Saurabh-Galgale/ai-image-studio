import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

function wrapper({ children }: any) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

test('useTheme toggles and provides isDark', () => {
  const { result } = renderHook(() => useTheme(), { wrapper });
  const initial = result.current.isDark;
  act(() => {
    result.current.toggleTheme();
  });
  expect(result.current.isDark).toBe(!initial);
});
