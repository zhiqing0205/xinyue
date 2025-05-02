import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const data = await readBody(event)
    
    // 创建新的朋友圈动态
    const moment = await prisma.moment.create({
      data: {
        content: data.content,
        eventDate: new Date(data.event_date),
        location: data.location,
        mood: data.mood,
        isActive: data.is_active !== undefined ? data.is_active : true
      }
    })
    
    return moment
  } catch (error) {
    console.error('创建朋友圈动态错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})