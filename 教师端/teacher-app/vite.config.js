import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Electron 走 file:// 需相对路径；web/部署保持子路径
  base: mode === 'electron' ? './' : '/bubu-prototype-design/',
  server: { port: 5173, host: '127.0.0.1' }
}))
