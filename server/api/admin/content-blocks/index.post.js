import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const data = await readBody(event)
    
    // 创建新的内容区块
    const block = await prisma.contentBlock.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        backgroundColor: data.background_color,
        textColor: data.text_color,
        imageUrl: data.image_url,
        imagePosition: data.image_position,
        displayOrder: data.display_order,
        animationType: data.animation_type || 'fade',
        isActive: data.is_active !== undefined ? data.is_active : true
      }
    })
    
    return block
  } catch (error) {
    console.error('创建内容区块错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})