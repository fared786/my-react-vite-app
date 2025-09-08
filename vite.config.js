import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // IMPORTANT for XAMPP subfolder deployments
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        register: 'register.html',
        product: 'product.html',
        cart: 'cart.html',
        checkout: 'checkout.html',
        admin: 'admin.html',
        dashboard: 'dashboard.html',
        about: 'about.html'
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true
  }
})
