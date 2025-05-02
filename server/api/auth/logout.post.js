export default defineEventHandler((event) => {
  // 清除认证 cookie
  deleteCookie(event, 'auth_token', {
    path: '/',
    httpOnly: true
  })
  
  return { success: true }
})