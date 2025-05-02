import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 获取所有内容区块，按显示顺序排序
    const blocks = await prisma.contentBlock.findMany({
      orderBy: { displayOrder: 'asc' }
    })
    
    return blocks
  } catch (error) {
    console.error('获取内容区块错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})