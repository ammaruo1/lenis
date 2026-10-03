import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => {
  // The server workspace's development .env must not ship development React.
  if (command === 'build') process.env.NODE_ENV = 'production'
  return {
  envFile: command !== 'build',
  define: command === 'build' ? { 'process.env.NODE_ENV': JSON.stringify('production') } : {},
  plugins: [react()],
  server: {proxy:{'/api':{target:'http://127.0.0.1:3000',changeOrigin:false}}},
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['gsap', 'lenis'],
        },
      },
    },
  },
  }
})
