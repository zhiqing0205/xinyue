import { createReadStream } from 'fs'
import { randomUUID } from 'crypto'
import { FormData, File } from 'formdata-node'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { Readable } from 'stream'

export default defineEventHandler(async (event) => {
  try {
    // 解析上传的文件
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      return createError({
        statusCode: 400,
        statusMessage: '未找到上传的文件'
      })
    }
    
    const file = formData[0]
    
    // 创建一个新的 FormData 对象用于发送到图床
    const imageFormData = new FormData()
    
    // 将文件添加到 FormData
    const fileStream = Readable.from(file.data)
    const fileObject = new File([fileStream], file.filename || `${randomUUID()}.jpg`, {
      type: file.type || 'image/jpeg'
    })
    
    imageFormData.append('file', fileObject)
    imageFormData.append('token', process.env.IMAGE_UPLOAD_TOKEN)
    
    // 发送到图床
    const response = await fetch(process.env.IMAGE_UPLOAD_API, {
      method: 'POST',
      body: imageFormData
    })
    
    if (!response.ok) {
      throw new Error(`图床上传失败: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // 返回图床 URL
    return {
      success: true,
      filePath: result.url || result.data?.url || process.env.IMAGE_UPLOAD_API
    }
  } catch (error) {
    console.error('文件上传错误:', error)
    return createError({
      statusCode: 500,
      statusMessage: '文件上传失败'
    })
  }
})