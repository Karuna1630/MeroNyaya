import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Keep mocks isolated between tests.
afterEach(() => {
  vi.restoreAllMocks();
});
