import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params.id)
    
    // 获取指定的朋友圈动态，包括其媒体文件
    const moment = await prisma.moment.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })
    
    if (!moment) {
      return createError({
        statusCode: 404,
        statusMessage: '未找到指定的朋友圈动态'
      })
    }
    
    return moment
  } catch (error) {
    console.error('获取朋友圈动态错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})