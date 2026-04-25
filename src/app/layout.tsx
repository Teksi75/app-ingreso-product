import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

/**
 * Teksi75 - Layout Principal
 * ==========================
 * Configuración base de la aplicación con:
 * - Fuentes optimizadas para legibilidad en jóvenes
 * - Metadata SEO-friendly para padres
 * - Viewport configurado para mobile-first
 * - Tema de color claro por defecto con soporte dark mode
 */

export const metadata: Metadata = {
  title: "Teksi75 - Preparación para Ingreso al Secundario",
  description: "Plataforma educativa gamificada para preparar el ingreso al secundario. Ejercicios interactivos, simulacros de examen y seguimiento de progreso para estudiantes de 11-13 años.",
  keywords: ["ingreso secundario", "preparación examen", "educación", "gamificación", "simulacros", "matemáticas", "lengua"],
  authors: [{ name: "Teksi75 Team" }],
  openGraph: {
    title: "Teksi75 - Preparación para Ingreso al Secundario",
    description: "Domina el ingreso al secundario con entrenamiento gamificado y seguimiento de progreso",
    type: "website",
    locale: "es_AR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        {/* Preconnect para fuentes de Google */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
