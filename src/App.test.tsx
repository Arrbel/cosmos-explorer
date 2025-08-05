import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App'
import { ThemeProvider } from './contexts';

describe('App', () => {
  it('renders the main title', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );

    const title = screen.getByRole('heading', { level: 1 });
    expect(title.textContent).toBe('宇宙探索者');
  });

  it('renders the subtitle', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );

    const subtitle = screen.getByRole('heading', { level: 2 });
    expect(subtitle.textContent).toBe('Cosmos Explorer');
  });

  it('shows the loading message', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );

    const loadingText = screen.getByText(/交互式3D宇宙可视化平台正在构建中/);
    expect(loadingText).toBeTruthy();
  });
});
