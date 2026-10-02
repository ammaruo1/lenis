import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { staticHome } from './scripts/static-home'

export default defineConfig(({ command }) => {
  // The server workspace's development .env must not ship development React.
  if (command === 'build') process.env.NODE_ENV = 'production'
  return {
  envFile: command !== 'build',
  define: command === 'build' ? { 'process.env.NODE_ENV': JSON.stringify('production') } : {},
  plugins: [react(), { name: 'static-home-fallback', closeBundle: staticHome }],
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
