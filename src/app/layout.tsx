import type { ReactNode } from "react";

export const metadata = {
  title: "Ingreso Product",
  description: "Dashboard de progreso",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
