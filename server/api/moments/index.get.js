import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const orderBy = query.order === 'event_date' 
      ? { eventDate: 'desc' } 
      : { createdAt: 'desc' }
    
    // 获取所有朋友圈动态
    const moments = await prisma.moment.findMany({
      orderBy,
      include: {
        media: true
      }
    })
    
    return moments
  } catch (error) {
    console.error('获取朋友圈动态错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})