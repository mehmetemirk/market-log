import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Market Stok Log',
        short_name: 'StokLog',
        description: 'Depo ve Şube Stok Yönetimi',
        theme_color: '#0f0f0f',
        icons: [
          {
            src: 'pwa-192x192.png', // public klasöründe olmalı
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})