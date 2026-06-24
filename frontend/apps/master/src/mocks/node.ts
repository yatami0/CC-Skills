import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Vitest（node）: setupServer で生成 handlers を起動（設計 §3.6）。
export const server = setupServer(...handlers);
