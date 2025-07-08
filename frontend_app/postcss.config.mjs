/** @type {import('postcss-load-config').Config} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;