import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event)
    
    // 验证输入
    if (!username || !password) {
      return createError({
        statusCode: 400,
        statusMessage: '用户名和密码不能为空'
      })
    }
    
    // 查找用户
    const admin = await prisma.admin.findUnique({
      where: { username }
    })
    
    if (!admin) {
      return createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误'
      })
    }
    
    // 验证密码
    const passwordValid = await bcrypt.compare(password, admin.passwordHash)
    
    if (!passwordValid) {
      return createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误'
      })
    }
    
    // 生成 JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    // 设置 cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24小时
      sameSite: 'strict'
    })
    
    return { success: true }
  } catch (error) {
    console.error('登录错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '服务器错误'
    })
  }
})