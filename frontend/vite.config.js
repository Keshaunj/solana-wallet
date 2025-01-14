import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'stream': path.resolve(__dirname, 'node_modules/stream-browserify'),
      'crypto': path.resolve(__dirname, 'node_modules/crypto-browserify'),
      'http': path.resolve(__dirname, 'node_modules/stream-http'),
      'https': path.resolve(__dirname, 'node_modules/https-browserify'),
      'os': path.resolve(__dirname, 'node_modules/os-browserify'),
      'process': path.resolve(__dirname, 'node_modules/process/browser.js'),
      'util': path.resolve(__dirname, 'node_modules/util')
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          // Disable buffer here since we'll handle it in rollup
          process: true,
          buffer: false
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      plugins: [
        // Use rollup polyfills only
        rollupNodePolyFill({
          buffer: true
        })
      ],
      external: ['@solana/spl-token-registry']
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});