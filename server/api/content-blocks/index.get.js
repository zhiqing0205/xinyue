import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    // 默认按照 displayOrder 排序，除非明确指定其他排序方式
    const orderBy = query.order === 'created_at' 
      ? { createdAt: 'desc' } 
      : { displayOrder: 'asc' }
    
    // 获取所有内容区块
    const blocks = await prisma.contentBlock.findMany({
      orderBy
    })
    
    return blocks
  } catch (error) {
    console.error('获取内容区块错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})