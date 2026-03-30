import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')
const indexPath = resolve(distDir, 'index.html')
const fallbackPath = resolve(distDir, '404.html')

if (!existsSync(indexPath)) {
  console.error('index.html not found in dist. Run build first.')
  process.exit(1)
}

copyFileSync(indexPath, fallbackPath)
console.log('Created GitHub Pages SPA fallback: dist/404.html')
