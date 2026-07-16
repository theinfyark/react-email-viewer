import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  esbuildOptions(options) {
    // Keep Next.js App Router compatibility without noisy bundle banners
    options.jsx = 'automatic';
  },
});
