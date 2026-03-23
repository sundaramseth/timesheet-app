import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/api/gas': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            '/api/gas',
            '/macros/s/AKfycbzQ7fHVzvAclAadfbi-DDvi2MF416wyvaSGrXFz8_JZ7lKtppQ77T0_nrEHd_Gapuir/exec'
          ),
      },
    },
  },
})