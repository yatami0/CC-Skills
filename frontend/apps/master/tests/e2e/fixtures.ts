import { createNetworkFixture, type NetworkFixture } from '@msw/playwright';
import { test as testBase, expect } from '@playwright/test';
import { handlers } from '../../src/mocks/handlers';

// モック E2E（hermetic）: MSW を @msw/playwright（内部は page.route）で注入する（設計 §3.6）。
// アプリのビルドにモックを焼き込まない。ブラウザ横取りのため BFF proxy は通らない。
interface Fixtures {
  network: NetworkFixture;
}

export const test = testBase.extend<Fixtures>({
  network: createNetworkFixture({
    initialHandlers: handlers,
    onUnhandledRequest: 'bypass',
  }),
});

export { expect };
