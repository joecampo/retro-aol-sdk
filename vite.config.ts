import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      // eslint-disable-next-line no-undef
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'retro-aol-sdk',
      fileName: (format) => `retro-aol-sdk.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
});
