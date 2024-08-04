import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv'

dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'PORT': JSON.stringify(process.env.PORT),
  },

  build: {
    sourcemap: true,
  },

  server: {
    port: 5555,
  },
})
