import { execSync } from 'child_process'
import { existsSync, copyFileSync } from 'fs'
import { join } from 'path'

// 检查 .env 文件是否存在
if (!existsSync('.env')) {
  console.log('创建 .env 文件...')
  const envContent = 'DATABASE_URL="file:./prisma/dev.db"\n' +
    'JWT_SECRET="your-secret-key-change-this-in-production"\n' +
    'IMAGE_UPLOAD_TOKEN="1c17b11693cb5ec63859b091c5b9c1b2"\n' +
    'IMAGE_UPLOAD_API="https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg"'
  
  require('fs').writeFileSync('.env', envContent)
}

// 运行 Prisma 迁移
console.log('运行 Prisma 迁移...')
execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })

// 运行种子脚本
console.log('运行种子脚本...')
execSync('node prisma/seed.js', { stdio: 'inherit' })

console.log('数据库初始化完成！')