import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params.id)
    const data = await readBody(event)
    
    // 更新祝福内容
    const greeting = await prisma.greeting.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        backgroundImage: data.background_image,
        textColor: data.text_color,
        isActive: data.is_active !== undefined ? data.is_active : true
      }
    })
    
    return greeting
  } catch (error) {
    console.error('更新祝福内容错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})