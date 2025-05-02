import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params.id)
    const data = await readBody(event)
    
    // 更新内容区块
    const block = await prisma.contentBlock.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        backgroundColor: data.background_color,
        textColor: data.text_color,
        imageUrl: data.image_url,
        imagePosition: data.image_position,
        displayOrder: data.display_order,
        animationType: data.animation_type,
        isActive: data.is_active !== undefined ? data.is_active : true
      }
    })
    
    return block
  } catch (error) {
    console.error('更新内容区块错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})