import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const data = await readBody(event)
    
    // 创建新的媒体文件
    const media = await prisma.media.create({
      data: {
        momentId: data.moment_id ? parseInt(data.moment_id) : null,
        filePath: data.file_path,
        fileType: data.file_type || 'image',
        displayOrder: data.display_order || 0
      }
    })
    
    return media
  } catch (error) {
    console.error('创建媒体文件错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})