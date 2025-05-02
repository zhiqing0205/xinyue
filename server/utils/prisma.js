import { PrismaClient } from '@prisma/client'

// 创建 Prisma 客户端单例
const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma