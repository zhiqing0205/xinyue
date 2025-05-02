export const useApi = () => {
  // 祝福内容 API
  const getActiveGreeting = async () => {
    try {
      const response = await fetch('/api/admin/greetings/active')
      return await response.json()
    } catch (error) {
      console.error('获取祝福内容失败:', error)
      return null
    }
  }
  
  // 内容区块 API
  const getContentBlocks = async () => {
    try {
      const response = await fetch('/api/admin/content-blocks')
      return await response.json()
    } catch (error) {
      console.error('获取内容区块失败:', error)
      return []
    }
  }
  
  // 朋友圈动态 API
  const getMoments = async () => {
    try {
      const response = await fetch('/api/admin/moments')
      const moments = await response.json()
      
      // 获取每个动态的媒体文件
      for (const moment of moments) {
        const mediaResponse = await fetch(`/api/admin/media?moment_id=${moment.id}`)
        moment.media = await mediaResponse.json()
      }
      
      return moments
    } catch (error) {
      console.error('获取朋友圈动态失败:', error)
      return []
    }
  }
  
  // 上传图片 API
  const uploadImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      
      return await response.json()
    } catch (error) {
      console.error('上传图片失败:', error)
      throw error
    }
  }
  
  return {
    getActiveGreeting,
    getContentBlocks,
    getMoments,
    uploadImage
  }
}