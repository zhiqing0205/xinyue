<!-- pages/admin/index.vue -->
<template>
    <div class="admin-container">
      <!-- 登录页面 -->
      <div v-if="!isLoggedIn" class="login-container">
        <div class="login-card">
          <h1 class="login-title">管理员登录</h1>
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="username">用户名</label>
              <input 
                type="text" 
                id="username" 
                v-model="loginForm.username" 
                required 
                placeholder="请输入用户名"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="password">密码</label>
              <input 
                type="password" 
                id="password" 
                v-model="loginForm.password" 
                required 
                placeholder="请输入密码"
                class="form-input"
              />
            </div>
            
            <div v-if="loginError" class="error-message">
              {{ loginError }}
            </div>
            
            <button type="submit" class="btn-login" :disabled="isLoading">
              {{ isLoading ? '登录中...' : '登录' }}
            </button>
          </form>
        </div>
      </div>
      
      <!-- 管理后台 -->
      <div v-else class="dashboard-container">
        <header class="dashboard-header">
          <h1>生日庆祝页面管理后台</h1>
          <button @click="handleLogout" class="btn-logout">退出登录</button>
        </header>
        
        <div class="dashboard-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
          >
            {{ tab.name }}
          </button>
        </div>
        
        <div class="dashboard-content">
          <!-- 首屏祝福管理 -->
          <div v-if="activeTab === 'greeting'" class="tab-content">
            <h2>首屏祝福管理</h2>
            
            <form @submit.prevent="saveGreeting" class="content-form">
              <div class="form-group">
                <label for="greeting-title">标题</label>
                <input 
                  type="text" 
                  id="greeting-title" 
                  v-model="greetingForm.title" 
                  required 
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="greeting-content">内容</label>
                <textarea 
                  id="greeting-content" 
                  v-model="greetingForm.content" 
                  required 
                  rows="4"
                  class="form-textarea"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label for="greeting-bg-color">背景颜色</label>
                <input 
                  type="color" 
                  id="greeting-bg-color" 
                  v-model="greetingForm.background_color" 
                />
              </div>
              
              <div class="form-group">
                <label for="greeting-text-color">文字颜色</label>
                <input 
                  type="color" 
                  id="greeting-text-color" 
                  v-model="greetingForm.text_color" 
                />
              </div>
              
              <div class="form-group">
                <label>背景图片</label>
                <div class="image-upload-container">
                  <div 
                    v-if="greetingForm.background_image" 
                    class="image-preview"
                  >
                    <img :src="greetingForm.background_image" alt="背景预览" />
                    <button 
                      type="button" 
                      @click="greetingForm.background_image = ''"
                      class="btn-remove-image"
                    >
                      删除图片
                    </button>
                  </div>
                  
                  <label v-else class="image-upload-label">
                    <input 
                      type="file" 
                      @change="handleGreetingImageUpload" 
                      accept="image/*"
                      class="image-upload-input"
                    />
                    <span>点击上传图片</span>
                  </label>
                </div>
              </div>
              
              <div class="form-group form-actions">
                <button type="submit" class="btn-save" :disabled="isLoading">
                  {{ isLoading ? '保存中...' : '保存修改' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- 内容区块管理 -->
          <div v-if="activeTab === 'blocks'" class="tab-content">
            <h2>内容区块管理</h2>
            
            <div class="blocks-list">
              <div 
                v-for="(block, index) in contentBlocks" 
                :key="block.id"
                class="block-item"
              >
                <div class="block-header">
                  <h3>{{ block.title || `区块 ${index + 1}` }}</h3>
                  <div class="block-actions">
                    <button 
                      @click="toggleBlockExpand(block.id)"
                      class="btn-toggle"
                    >
                      {{ expandedBlocks[block.id] ? '收起' : '展开' }}
                    </button>
                    <button 
                      @click="removeBlock(block.id)"
                      class="btn-remove"
                    >
                      删除
                    </button>
                  </div>
                </div>
                
                <div v-if="expandedBlocks[block.id]" class="block-form">
                  <div class="form-group">
                    <label :for="`block-title-${block.id}`">标题</label>
                    <input 
                      type="text" 
                      :id="`block-title-${block.id}`" 
                      v-model="block.title" 
                      class="form-input"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label :for="`block-subtitle-${block.id}`">副标题</label>
                    <input 
                      type="text" 
                      :id="`block-subtitle-${block.id}`" 
                      v-model="block.subtitle" 
                      class="form-input"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label :for="`block-content-${block.id}`">内容</label>
                    <textarea 
                      :id="`block-content-${block.id}`" 
                      v-model="block.content" 
                      rows="3"
                      class="form-textarea"
                    ></textarea>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group form-group-half">
                      <label :for="`block-bg-color-${block.id}`">背景颜色</label>
                      <input 
                        type="color" 
                        :id="`block-bg-color-${block.id}`" 
                        v-model="block.background_color" 
                      />
                    </div>
                    
                    <div class="form-group form-group-half">
                      <label :for="`block-text-color-${block.id}`">文字颜色</label>
                      <input 
                        type="color" 
                        :id="`block-text-color-${block.id}`" 
                        v-model="block.text_color" 
                      />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>图片位置</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          v-model="block.image_position" 
                          value="left" 
                        />
                        左侧
                      </label>
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          v-model="block.image_position" 
                          value="right" 
                        />
                        右侧
                      </label>
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          v-model="block.image_position" 
                          value="center" 
                        />
                        居中
                      </label>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>图片</label>
                    <div class="image-upload-container">
                      <div 
                        v-if="block.image_url" 
                        class="image-preview"
                      >
                        <img :src="block.image_url" alt="图片预览" />
                        <button 
                          type="button" 
                          @click="block.image_url = ''"
                          class="btn-remove-image"
                        >
                          删除图片
                        </button>
                      </div>
                      
                      <label v-else class="image-upload-label">
                        <input 
                          type="file" 
                          @change="(e) => handleBlockImageUpload(e, block.id)" 
                          accept="image/*"
                          class="image-upload-input"
                        />
                        <span>点击上传图片</span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="form-group form-actions">
                    <button 
                      @click="saveBlock(block)" 
                      class="btn-save"
                      :disabled="isLoading"
                    >
                      {{ isLoading ? '保存中...' : '保存修改' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <button @click="addNewBlock" class="btn-add">添加新区块</button>
          </div>
          
          <!-- 朋友圈动态管理 -->
          <div v-if="activeTab === 'moments'" class="tab-content">
            <h2>朋友圈动态管理</h2>
            
            <div class="moments-list">
              <div 
                v-for="moment in moments" 
                :key="moment.id"
                class="moment-item"
              >
                <div class="moment-header">
                  <h3>{{ formatDate(moment.event_date) }}</h3>
                  <div class="moment-actions">
                    <button 
                      @click="toggleMomentExpand(moment.id)"
                      class="btn-toggle"
                    >
                      {{ expandedMoments[moment.id] ? '收起' : '展开' }}
                    </button>
                    <button 
                      @click="removeMoment(moment.id)"
                      class="btn-remove"
                    >
                      删除
                    </button>
                  </div>
                </div>
                
                <div v-if="expandedMoments[moment.id]" class="moment-form">
                  <div class="form-group">
                    <label :for="`moment-date-${moment.id}`">日期</label>
                    <input 
                      type="date" 
                      :id="`moment-date-${moment.id}`" 
                      v-model="moment.event_date" 
                      class="form-input"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label :for="`moment-content-${moment.id}`">内容</label>
                    <textarea 
                      :id="`moment-content-${moment.id}`" 
                      v-model="moment.content" 
                      rows="3"
                      class="form-textarea"
                    ></textarea>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group form-group-half">
                      <label :for="`moment-location-${moment.id}`">地点</label>
                      <input 
                        type="text" 
                        :id="`moment-location-${moment.id}`" 
                        v-model="moment.location" 
                        class="form-input"
                      />
                    </div>
                    
                    <div class="form-group form-group-half">
                      <label :for="`moment-mood-${moment.id}`">心情</label>
                      <input 
                        type="text" 
                        :id="`moment-mood-${moment.id}`" 
                        v-model="moment.mood" 
                        class="form-input"
                      />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>照片/视频</label>
                    <div class="media-list">
                      <div 
                        v-for="media in moment.media" 
                        :key="media.id"
                        class="media-item"
                      >
                        <img 
                          v-if="media.file_type === 'image'" 
                          :src="media.file_path" 
                          alt="" 
                          class="media-preview"
                        />
                        <video 
                          v-else-if="media.file_type === 'video'" 
                          :src="media.file_path" 
                          controls
                          class="media-preview"
                        ></video>
                        <button 
                          @click="removeMedia(media.id, moment.id)"
                          class="btn-remove-media"
                        >
                          删除
                        </button>
                      </div>
                      
                      <label class="media-upload-label">
                        <input 
                          type="file" 
                          @change="(e) => handleMediaUpload(e, moment.id)" 
                          accept="image/*,video/*"
                          class="media-upload-input"
                        />
                        <span>添加照片/视频</span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="form-group form-actions">
                    <button 
                      @click="saveMoment(moment)" 
                      class="btn-save"
                      :disabled="isLoading"
                    >
                      {{ isLoading ? '保存中...' : '保存修改' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <button @click="addNewMoment" class="btn-add">添加新动态</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  
  // 登录状态
  const isLoggedIn = ref(false);
  const isLoading = ref(false);
  const loginError = ref('');
  const loginForm = reactive({
    username: '',
    password: ''
  });
  
  // 管理后台状态
  const activeTab = ref('greeting');
  const tabs = [
    { id: 'greeting', name: '首屏祝福' },
    { id: 'blocks', name: '内容区块' },
    { id: 'moments', name: '朋友圈动态' }
  ];
  
  // 表单数据
  const greetingForm = reactive({
    id: null,
    title: '',
    content: '',
    background_image: '',
    background_color: '#000000',
    text_color: '#ffffff'
  });
  
  const contentBlocks = ref([]);
  const expandedBlocks = reactive({});
  
  const moments = ref([]);
  const expandedMoments = reactive({});
  
  // 初始化
  onMounted(async () => {
    // 检查登录状态
    const token = getCookie('auth_token');
    if (token) {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        isLoggedIn.value = data.authenticated;
        
        if (isLoggedIn.value) {
          // 加载数据
          loadData();
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
      }
    }
  });
  
  // 加载数据
  const loadData = async () => {
    try {
      // 加载祝福内容
      const greetingRes = await fetch('/api/admin/greetings/active');
      const greeting = await greetingRes.json();
      if (greeting) {
        Object.assign(greetingForm, greeting);
      }
      
      // 加载内容区块
      const blocksRes = await fetch('/api/admin/content-blocks');
      contentBlocks.value = await blocksRes.json();
      
      // 加载朋友圈动态
      const momentsRes = await fetch('/api/admin/moments');
      moments.value = await momentsRes.json();
      
      // 加载每个动态的媒体文件
      for (const moment of moments.value) {
        const mediaRes = await fetch(`/api/admin/media?moment_id=${moment.id}`);
        moment.media = await mediaRes.json();
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };
  
  // 登录处理
  const handleLogin = async () => {
    loginError.value = '';
    isLoading.value = true;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        isLoggedIn.value = true;
        loadData();
      } else {
        loginError.value = data.statusMessage || '登录失败';
      }
    } catch (error) {
      console.error('登录失败:', error);
      loginError.value = '网络错误，请稍后重试';
    } finally {
      isLoading.value = false;
    }
  };
  
  // 退出登录
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
      isLoggedIn.value = false;
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };
  
  // 祝福内容管理
  const handleGreetingImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    isLoading.value = true;
    
    fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        greetingForm.background_image = data.filePath;
      })
      .catch(error => {
        console.error('上传图片失败:', error);
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  
  const saveGreeting = async () => {
    isLoading.value = true;
    
    try {
      const method = greetingForm.id ? 'PUT' : 'POST';
      const url = greetingForm.id ? 
        `/api/admin/greetings/${greetingForm.id}` : 
        '/api/admin/greetings';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(greetingForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        Object.assign(greetingForm, data);
        alert('保存成功');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('保存祝福内容失败:', error);
      alert('保存失败');
    } finally {
      isLoading.value = false;
    }
  };
  
  // 内容区块管理
  const toggleBlockExpand = (blockId) => {
    expandedBlocks[blockId] = !expandedBlocks[blockId];
  };
  
  const handleBlockImageUpload = (event, blockId) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    isLoading.value = true;
    
    fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        const block = contentBlocks.value.find(b => b.id === blockId);
        if (block) {
          block.image_url = data.filePath;
        }
      })
      .catch(error => {
        console.error('上传图片失败:', error);
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  
  const addNewBlock = () => {
    const newBlock = {
      id: `temp-${Date.now()}`,
      title: '',
      subtitle: '',
      content: '',
      background_color: '#ffffff',
      text_color: '#000000',
      image_url: '',
      image_position: 'right',
      display_order: contentBlocks.value.length + 1,
      is_active: true
    };
    
    contentBlocks.value.push(newBlock);
    expandedBlocks[newBlock.id] = true;
  };
  
  const saveBlock = async (block) => {
    isLoading.value = true;
    
    try {
      const isNew = block.id.toString().startsWith('temp-');
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? 
        '/api/admin/content-blocks' : 
        `/api/admin/content-blocks/${block.id}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(block)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (isNew) {
          // 替换临时ID
          const index = contentBlocks.value.findIndex(b => b.id === block.id);
          if (index !== -1) {
            delete expandedBlocks[block.id];
            contentBlocks.value[index] = data;
            expandedBlocks[data.id] = true;
          }
        } else {
          // 更新现有数据
          Object.assign(block, data);
        }
        
        alert('保存成功');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('保存区块失败:', error);
      alert('保存失败');
    } finally {
      isLoading.value = false;
    }
  };
  
  const removeBlock = async (blockId) => {
    if (!confirm('确定要删除这个区块吗？')) {
      return;
    }
    
    // 检查是否为临时ID
    if (blockId.toString().startsWith('temp-')) {
      contentBlocks.value = contentBlocks.value.filter(block => block.id !== blockId);
      delete expandedBlocks[blockId];
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/content-blocks/${blockId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        contentBlocks.value = contentBlocks.value.filter(block => block.id !== blockId);
        delete expandedBlocks[blockId];
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除区块失败:', error);
      alert('删除失败');
    }
  };
  
  // 朋友圈动态管理
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  const toggleMomentExpand = (momentId) => {
    expandedMoments[momentId] = !expandedMoments[momentId];
  };
  
  const handleMediaUpload = (event, momentId) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('moment_id', momentId);
    
    isLoading.value = true;
    
    fetch('/api/admin/upload/media', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        const moment = moments.value.find(m => m.id === momentId);
        if (moment) {
          if (!moment.media) {
            moment.media = [];
          }
          moment.media.push(data);
        }
      })
      .catch(error => {
        console.error('上传媒体文件失败:', error);
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  
  const addNewMoment = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const newMoment = {
      id: `temp-${Date.now()}`,
      content: '',
      event_date: today,
      location: '',
      mood: '',
      is_active: true,
      media: []
    };
    
    moments.value.unshift(newMoment);
    expandedMoments[newMoment.id] = true;
  };
  
  const saveMoment = async (moment) => {
    isLoading.value = true;
    
    try {
      const isNew = moment.id.toString().startsWith('temp-');
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? 
        '/api/admin/moments' : 
        `/api/admin/moments/${moment.id}`;
      
      const momentData = { ...moment };
      delete momentData.media; // 不发送媒体数据
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(momentData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (isNew) {
          // 替换临时ID
          const index = moments.value.findIndex(m => m.id === moment.id);
          if (index !== -1) {
            const media = moment.media;
            delete expandedMoments[moment.id];
            moments.value[index] = data;
            moments.value[index].media = media;
            expandedMoments[data.id] = true;
            
            // 更新媒体文件的moment_id
            for (const mediaItem of media) {
              if (mediaItem.id.toString().startsWith('temp-')) {
                continue; // 跳过临时媒体
              }
              
              await fetch(`/api/admin/media/${mediaItem.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ...mediaItem,
                  moment_id: data.id
                })
              });
            }
          }
        } else {
          // 更新现有数据
          Object.assign(moment, data, { media: moment.media });
        }
        
        alert('保存成功');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('保存动态失败:', error);
      alert('保存失败');
    } finally {
      isLoading.value = false;
    }
  };
  
  const removeMoment = async (momentId) => {
    if (!confirm('确定要删除这条动态吗？')) {
      return;
    }
    
    // 检查是否为临时ID
    if (momentId.toString().startsWith('temp-')) {
      moments.value = moments.value.filter(moment => moment.id !== momentId);
      delete expandedMoments[momentId];
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/moments/${momentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        moments.value = moments.value.filter(moment => moment.id !== momentId);
        delete expandedMoments[momentId];
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除动态失败:', error);
      alert('删除失败');
    }
  };
  
  const removeMedia = async (mediaId, momentId) => {
    if (!confirm('确定要删除这个媒体文件吗？')) {
      return;
    }
    
    // 检查是否为临时ID
    if (mediaId.toString().startsWith('temp-')) {
      const moment = moments.value.find(m => m.id === momentId);
      if (moment && moment.media) {
        moment.media = moment.media.filter(media => media.id !== mediaId);
      }
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const moment = moments.value.find(m => m.id === momentId);
        if (moment && moment.media) {
          moment.media = moment.media.filter(media => media.id !== mediaId);
        }
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除媒体文件失败:', error);
      alert('删除失败');
    }
  };
  
  // 辅助函数
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };
  </script>
  
  <style scoped>
  /* 全局样式 */
  .admin-container {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #333;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  /* 登录页面样式 */
  .login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .login-card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }
  
  .login-title {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .form-input,
  .form-textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .error-message {
    color: #e74c3c;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .btn-login {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.8rem;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .btn-login:hover:not(:disabled) {
    background-color: #2980b9;
  }
  
  .btn-login:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
  
  /* 管理后台样式 */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2rem 0;
  }
  
  .dashboard-header h1 {
    font-size: 1.8rem;
    margin: 0;
  }
  
  .btn-logout {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .btn-logout:hover {
    background-color: #c0392b;
  }
  
  .dashboard-tabs {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 2rem;
  }
  
  .tab-btn {
    padding: 0.8rem 1.5rem;
    border: none;
    background-color: transparent;
    font-size: 1rem;
    cursor: pointer;
    position: relative;
    transition: color 0.3s;
  }
  
  .tab-btn:hover {
    color: #3498db;
  }
  
  .tab-btn.active {
    color: #3498db;
    font-weight: 600;
  }
  
  .tab-btn.active:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 3px;
    background-color: #3498db;
  }
  
  .tab-content {
    margin-bottom: 3rem;
  }
  
  .tab-content h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  /* 表单样式 */
  .content-form {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 2rem;
  }
  
  .form-row {
    display: flex;
    gap: 20px;
  }
  
  .form-group-half {
    flex: 1;
  }
  
  .form-actions {
    margin-top: 1.5rem;
    text-align: right;
  }
  
  .btn-save {
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .btn-save:hover:not(:disabled) {
    background-color: #27ae60;
  }
  
  .btn-save:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
  
  /* 图片上传 */
  .image-upload-container {
    margin-top: 0.5rem;
  }
  
  .image-preview {
    position: relative;
    margin-bottom: 1rem;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }
  
  .btn-remove-image {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(231, 76, 60, 0.8);
    color: white;
    border: none;
    padding: 0.4rem 0.7rem;
    border-radius: 3px;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .image-upload-label {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #ddd;
    border-radius: 5px;
    padding: 2rem;
    cursor: pointer;
    transition: border-color 0.3s;
  }
  
  .image-upload-label:hover {
    border-color: #3498db;
  }
  
  .image-upload-input {
    display: none;
  }
  
  /* 内容区块列表 */
  .blocks-list,
  .moments-list {
    margin-bottom: 2rem;
  }
  
  .block-item,
  .moment-item {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
    overflow: hidden;
  }
  
  .block-header,
  .moment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #eee;
  }
  
  .block-header h3,
  .moment-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .block-actions,
  .moment-actions {
    display: flex;
    gap: 10px;
  }
  
  .btn-toggle,
  .btn-remove {
    background-color: transparent;
    border: 1px solid #ddd;
    padding: 0.4rem 0.7rem;
    border-radius: 3px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .btn-toggle:hover {
    border-color: #3498db;
    color: #3498db;
  }
  
  .btn-remove:hover {
    background-color: #e74c3c;
    border-color: #e74c3c;
    color: white;
  }
  
  .block-form,
  .moment-form {
    padding: 1.5rem;
  }
  
  .btn-add {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
    display: block;
    margin: 0 auto;
  }
  
  .btn-add:hover {
    background-color: #2980b9;
  }
  
  /* 单选框组 */
  .radio-group {
    display: flex;
    gap: 20px;
    margin-top: 0.5rem;
  }
  
  .radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .radio-label input {
    margin-right: 5px;
  }
  
  /* 媒体列表 */
  .media-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 0.5rem;
  }
  
  .media-item {
    position: relative;
  }
  
  .media-preview {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid #ddd;
  }
  
  .btn-remove-media {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: rgba(231, 76, 60, 0.8);
    color: white;
    border: none;
    padding: 0.3rem 0.5rem;
    border-radius: 3px;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .media-upload-label {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #ddd;
    border-radius: 5px;
    height: 150px;
    cursor: pointer;
    transition: border-color 0.3s;
  }
  
  .media-upload-label:hover {
    border-color: #3498db;
  }
  
  .media-upload-input {
    display: none;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 10px;
    }
    
    .radio-group {
      flex-direction: column;
      gap: 10px;
    }
    
    .media-list {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
  </style>