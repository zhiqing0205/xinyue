import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const momentId = query.moment_id ? parseInt(query.moment_id) : undefined
    
    // 获取指定动态的媒体文件
    const media = await prisma.media.findMany({
      where: momentId ? { momentId } : undefined,
      orderBy: { displayOrder: 'asc' }
    })
    
    return media
  } catch (error) {
    console.error('获取媒体文件错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})