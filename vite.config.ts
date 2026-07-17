import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const isReplit = process.env.REPL_ID !== undefined;

// في بيئة Replit يُستخدم PORT وBASE_PATH — خارجها نضع قيم افتراضية
const port   = Number(process.env.PORT   ?? 3000);
const base   = process.env.BASE_PATH     ?? '/';

export default defineConfig(async () => {
  const plugins = [
    react(),
    tailwindcss(),
  ];

  // إضافات Replit فقط في وضع التطوير داخل Replit
  if (isReplit && process.env.NODE_ENV !== 'production') {
    const [{ default: runtimeErrorOverlay }, { cartographer }, { devBanner }] =
      await Promise.all([
        import('@replit/vite-plugin-runtime-error-modal'),
        import('@replit/vite-plugin-cartographer'),
        import('@replit/vite-plugin-dev-banner'),
      ]);
    plugins.push(
      runtimeErrorOverlay(),
      cartographer({ root: path.resolve(import.meta.dirname, '..') }),
      devBanner(),
    );
  }

  return {
    base,
    define: {
      __SUPABASE_URL__: JSON.stringify(
        process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
      ),
      __SUPABASE_ANON_KEY__: JSON.stringify(
        process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''
      ),
    },
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist'),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
