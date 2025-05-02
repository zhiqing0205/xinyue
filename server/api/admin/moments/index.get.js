import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 获取所有朋友圈动态，按日期排序
    const moments = await prisma.moment.findMany({
      orderBy: { eventDate: 'desc' }
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