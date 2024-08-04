import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

function copyPlugin(): Plugin {
  return {
    name: 'vite-plugin-copy',
    apply: 'build',
    closeBundle() {
      const src = path.resolve(__dirname, 'dist/index.html');
      const destDir = path.resolve(__dirname, 'dist/explore');
      const dest = path.join(destDir, 'index.html');

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.copyFileSync(src, dest);
      console.log(`Copied ${src} to ${dest}`);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyPlugin(),
  ],

  define: {
    'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'PORT': JSON.stringify(process.env.PORT),
  },

  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        dir: 'dist'
      },
    },
  },

  server: {
    port: 5555,
  },
  
})
