import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

const treatJsFilesAsJsx = {
  name: 'treat-js-files-as-jsx',
  enforce: 'pre',
  async transform(code, id) {
    if (!/\/src\/.*\.js$/.test(id)) {
      return null;
    }

    return transformWithEsbuild(code, id, {
      loader: 'jsx',
      jsx: 'automatic'
    });
  }
};

export default defineConfig({
  plugins: [treatJsFilesAsJsx, react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('recharts')) {
            return 'charts';
          }

          if (id.includes('sweetalert2')) {
            return 'alerts';
          }

          if (id.includes('papaparse') || id.includes('file-saver')) {
            return 'exports';
          }

          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) {
            return 'react-core';
          }

          if (id.includes('axios')) {
            return 'network';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
});
