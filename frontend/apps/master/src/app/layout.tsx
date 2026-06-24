import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from './providers';
import './globals.css';

// layout は Server のまま、providers を呼ぶだけ（設計 §3.3）。
export const metadata: Metadata = {
  title: 'Master',
  description: 'マスタデータ管理サイト',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
