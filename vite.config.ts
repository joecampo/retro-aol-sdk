import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const config = {
  retro: {
    // eslint-disable-next-line no-undef
    entry: resolve(__dirname, 'src/index.ts'),
    name: 'retro-aol-sdk',
    fileName: (format) => `retro-aol-sdk.${format}.js`,
  },
  'retro-native': {
    // eslint-disable-next-line no-undef
    entry: resolve(__dirname, 'src/react-native.ts'),
    name: 'retro-aol-sdk-native',
    fileName: (format) => `retro-aol-sdk-native.${format}.js`,
  },
};

// eslint-disable-next-line no-undef
const currentConfig = config[process.env?.LIB];

if (currentConfig === undefined) {
  throw new Error('LIB is not defined or is not valid');
}

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      ...currentConfig,
    },
    emptyOutDir: false,
    rollupOptions: {
      external: ['vue'],
    },
  },
});
