import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 获取当前激活的祝福内容
    const greeting = await prisma.greeting.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    })
    
    return greeting
  } catch (error) {
    console.error('获取祝福内容错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})