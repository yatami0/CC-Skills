import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';
import '../src/app/globals.css';

// API モックは全層で MSW に統一（§3.6）。Storybook も同じ生成 handlers を起動。
initialize({ onUnhandledRequest: 'bypass' });

const preview: Preview = {
  parameters: {
    msw: { handlers },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  loaders: [mswLoader],
};

export default preview;
