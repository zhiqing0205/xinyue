// prisma/seed.js
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据...')

  // 创建默认管理员
  const adminCount = await prisma.admin.count()
  if (adminCount === 0) {
    console.log('创建默认管理员账户')
    
    // 生成密码哈希
    const saltRounds = 10
    const passwordHash = await bcrypt.hash('password', saltRounds)
    
    await prisma.admin.create({
      data: {
        username: 'admin',
        passwordHash: passwordHash
      }
    })
    
    console.log('默认管理员已创建，用户名: admin, 密码: password')
  }

  // 创建示例祝福内容
  const greetingCount = await prisma.greeting.count()
  if (greetingCount === 0) {
    console.log('添加示例祝福内容')
    
    await prisma.greeting.create({
      data: {
        title: '生日快乐!',
        content: '亲爱的，祝你生日快乐！这个特别的日子里，我想对你说...',
        backgroundVideo: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.mp4', // 使用视频URL
        profileImage: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg', // 使用头像图片URL
        isActive: true
      }
    })
  }

  // 创建示例内容区块
  const blockCount = await prisma.contentBlock.count()
  if (blockCount === 0) {
    console.log('添加示例内容区块')
    
    await prisma.contentBlock.createMany({
      data: [
        {
          title: '我们的第一年',
          subtitle: '2020年的美好回忆',
          content: '那一年，我们一起去了...',
          imageUrl: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg', // 使用图床URL
          displayOrder: 1
        },
        {
          title: '特别的旅行',
          subtitle: '难忘的时光',
          content: '记得那次我们去...',
          imageUrl: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg', // 使用图床URL
          displayOrder: 2
        },
        {
          title: '你最爱的瞬间',
          subtitle: '每一刻都珍贵',
          content: '你总是喜欢...',
          imageUrl: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg', // 使用图床URL
          displayOrder: 3
        }
      ]
    })
  }

  // 创建示例朋友圈动态
  const momentCount = await prisma.moment.count()
  if (momentCount === 0) {
    console.log('添加示例朋友圈动态')
    
    // 创建第一条动态
    const moment1 = await prisma.moment.create({
      data: {
        content: '今天是我们相识的第一天，你穿着蓝色的裙子，笑容如阳光般灿烂...',
        eventDate: new Date('2020-05-01T12:30:00'),
        location: '星巴克咖啡厅',
        mood: '心动'
      }
    })
    
    // 创建第二条动态
    const moment2 = await prisma.moment.create({
      data: {
        content: '一周年纪念日，我们去了你最想去的餐厅...',
        eventDate: new Date('2021-05-01T19:00:00'),
        location: '法式餐厅',
        mood: '幸福'
      }
    })
    
    // 创建第三条动态
    const moment3 = await prisma.moment.create({
      data: {
        content: '今天是你的生日，我送了你最喜欢的礼物...',
        eventDate: new Date('2022-05-02T00:00:00'),
        location: '家里',
        mood: '感动'
      }
    })
    
    // 为动态添加媒体文件
    await prisma.media.createMany({
      data: [
        {
          momentId: moment1.id,
          filePath: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg', // 使用图床URL
          fileType: 'image',
          displayOrder: 1
        },
        {
          momentId: moment1.id,
          filePath: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg', // 使用图床URL
          fileType: 'image',
          displayOrder: 2
        },
        {
          momentId: moment2.id,
          filePath: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg', // 使用图床URL
          fileType: 'image',
          displayOrder: 1
        },
        {
          momentId: moment3.id,
          filePath: 'https://img.ziuch.top/i/2025/05/02/rdi9hb.jpg', // 使用图床URL
          fileType: 'image',
          displayOrder: 1
        }
      ]
    })
  }

  console.log('数据初始化完成!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('数据初始化失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })