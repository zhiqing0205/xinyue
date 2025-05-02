import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // 排除不需要认证的路由
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/check'
  ]
  
  const path = event.path || event.req.url
  
  // 如果是公开路由，直接放行
  if (publicRoutes.includes(path) || !path.startsWith('/api/admin')) {
    return
  }
  
  try {
    // 获取 cookie 中的 token
    const token = getCookie(event, 'auth_token')
    
    if (!token) {
      return createError({
        statusCode: 401,
        statusMessage: '未授权，请先登录'
      })
    }
    
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 将用户信息添加到事件上下文
    event.context.user = {
      id: decoded.id,
      username: decoded.username
    }
  } catch (error) {
    console.error('认证中间件错误:', error)
    return createError({
      statusCode: 401,
      statusMessage: '未授权，请先登录'
    })
  }
})