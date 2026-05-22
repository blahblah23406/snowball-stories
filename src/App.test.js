import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Snowball Stories title', async () => {
  render(<App />);
  const titleElement = await screen.findByText(/Snowball Stories!/i);
  expect(titleElement).toBeInTheDocument();
});


