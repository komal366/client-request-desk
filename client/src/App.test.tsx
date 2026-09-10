import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('login experience', () => {
  it('shows both isolated demo workspaces before any API action', () => {
    localStorage.clear();
    window.history.pushState({}, '', '/login');
    render(<BrowserRouter><App /></BrowserRouter>);
    expect(screen.getByText('Demo Business A')).toBeInTheDocument();
    expect(screen.getByText('Demo Business B')).toBeInTheDocument();
    expect(screen.getByText('Choose a demo workspace to continue.')).toBeInTheDocument();
  });
});
