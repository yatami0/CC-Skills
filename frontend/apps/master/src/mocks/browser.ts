import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// ローカル手動開発（ブラウザ）: setupWorker（public/mockServiceWorker.js）を
// NEXT_PUBLIC_API_MOCKING で env ゲートして起動する（設計 §3.6）。
export const worker = setupWorker(...handlers);

export async function startWorker(): Promise<void> {
  await worker.start({ onUnhandledRequest: 'bypass' });
}
