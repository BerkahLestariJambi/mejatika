import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Presentasi',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return {
    /* Head tag untuk mengizinkan blob pada halaman ini */
  } && (
    <>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:; media-src 'self' blob: data:; worker-src 'self' blob:;"
        />
      </head>
      {children}
    </>
  );
}
