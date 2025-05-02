import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  try {
    // 获取 cookie 中的 token
    const token = getCookie(event, 'auth_token')
    
    if (!token) {
      return { authenticated: false }
    }
    
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    return {
      authenticated: true,
      user: {
        id: decoded.id,
        username: decoded.username
      }
    }
  } catch (error) {
    console.error('验证 token 错误:', error)
    return { authenticated: false }
  }
})