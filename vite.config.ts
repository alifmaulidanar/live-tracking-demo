import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),  // React plugin
    VitePWA({ // PWA plugin
      strategies: 'injectManifest', // Inject manifest and register service worker
      srcDir: 'src',  // Directory where the assets are located
      filename: 'sw.js',  // Service worker filename
      registerType: 'autoUpdate',  // Service worker is updated on page reload
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'], // Assets to be included in the manifest
      manifest: { // Manifest options
        name: 'Trackify - Location Tracking App', // App name
        short_name: 'Trackify', // Short name
        description: 'Real-time location tracking app', // App description
        theme_color: '#ffffff', // Theme color
        icons: [  // App icons
          {
            "src": "public/logo/icons/manifest-icon-192.maskable.png",  // Icon source
            "sizes": "192x192", // Icon size
            "type": "image/png",  // Icon type
            "purpose": "any"  // Icon purpose
          },
          {
            "src": "public/logo/icons/manifest-icon-192.maskable.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "public/logo/icons/manifest-icon-512.maskable.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "public/logo/icons/manifest-icon-512.maskable.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ]
      },
      workbox: {  // Workbox options
        runtimeCaching: [ // Runtime caching options
          {
            handler: 'NetworkOnly', // Network only strategy
            urlPattern: /\/api\/.*\/*.json/,  // URL pattern to match
            method: 'POST', // HTTP method
            options: {
              // Enable Background Sync
              backgroundSync: {
                name: 'location-sync-queue',  // Queue name for background sync
                options: {  // Background sync options
                  maxRetentionTime: 24 * 60,  // Retry for max of 24 hours (specified in minutes)
                },
              },
            },
          },
        ],
      },
    })
  ],
  resolve: {  // Resolve options
    alias: {  // Alias options
      "@": path.resolve(__dirname, "./src"),  // Alias for src directory
    },
  },
  server: {
    // Enable HTTPS on development
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './ssl/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './ssl/localhost.pem')),
    },
  },
})
