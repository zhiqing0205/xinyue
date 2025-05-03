import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const data = await readBody(event)
    
    // 创建新的祝福内容
    const greeting = await prisma.greeting.create({
      data: {
        title: data.title,
        content: data.content,
        backgroundVideo: data.background_video,
        profileImage: data.profile_image,
        textColor: data.text_color,
        isActive: data.is_active !== undefined ? data.is_active : true
      }
    })
    
    return greeting
  } catch (error) {
    console.error('创建祝福内容错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})