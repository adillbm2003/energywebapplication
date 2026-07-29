import fs from 'fs'

const indexPath = 'dist/index.html'
const fallbackPath = 'dist/404.html'

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found — run vite build first')
  process.exit(1)
}

fs.copyFileSync(indexPath, fallbackPath)
console.log('Copied dist/index.html -> dist/404.html for SPA routing')
