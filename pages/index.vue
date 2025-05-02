<template>
  <div class="main-container">
    <!-- 背景视频 -->
    <div class="video-container">
      <video ref="bgVideo" autoplay loop muted playsinline class="background-video" v-if="greeting?.backgroundImage">
        <source :src="greeting.backgroundImage" type="video/mp4">
        <!-- 添加备用内容 -->
        您的浏览器不支持视频标签
      </video>
      <!-- 如果没有视频，显示纯色背景 -->
      <div v-else class="fallback-background"></div>
      <div class="overlay"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 首屏祝福部分 -->
      <section class="greeting-section" ref="greetingSection" v-if="greeting">
        <div class="greeting-content" :style="{ color: greeting.textColor || '#ffffff' }">
          <h1 class="greeting-title" ref="greetingTitle">{{ greeting.title }}</h1>
          <p class="greeting-text" ref="greetingText"></p>
          <div class="scroll-indicator" @click="scrollToNext">
            <span>继续往下</span>
            <div class="arrow-down"></div>
          </div>
        </div>
      </section>

      <!-- 内容区块部分 -->
      <div class="content-blocks">
        <section 
          v-for="(block, index) in contentBlocks" 
          :key="block.id"
          class="content-block"
          :class="{ 'active': index === 0 || activeBlockId === block.id }"
          :id="`block-${block.id}`"
          ref="contentBlocksRef"
        >
          <div class="block-text" :style="{ color: block.textColor || '#ffffff' }">
            <h2 class="block-title">{{ block.title }}</h2>
            <h3 class="block-subtitle" v-if="block.subtitle">{{ block.subtitle }}</h3>
            <div class="block-content" v-html="block.content"></div>
          </div>
          
          <div class="block-image" v-if="block.imageUrl">
            <img :src="block.imageUrl" :alt="block.title">
          </div>
        </section>
      </div>

      <!-- 朋友圈时间线部分 -->
      <section class="moments-section" v-if="moments.length > 0">
        <h2 class="section-title">我们的故事</h2>
        <div class="timeline">
          <div 
            v-for="moment in moments" 
            :key="moment.id"
            class="moment-card"
            :id="`moment-${moment.id}`"
            ref="momentCards"
          >
            <div class="moment-date">
              <span class="year">{{ formatYear(moment.eventDate) }}</span>
              <span class="month-day">{{ formatMonthDay(moment.eventDate) }}</span>
            </div>
            
            <div class="moment-content">
              <div class="moment-text" v-html="moment.content"></div>
              
              <div v-if="moment.media && moment.media.length" class="moment-media">
                <div 
                  v-for="media in moment.media" 
                  :key="media.id"
                  class="media-item">
                  <img v-if="media.fileType === 'image'" :src="media.filePath" alt="">
                  <video 
                    v-else-if="media.fileType === 'video'" 
                    controls
                    :src="media.filePath">
                  </video>
                </div>
              </div>
              
              <div class="moment-footer">
                <span class="moment-location" v-if="moment.location">
                  <i class="location-icon"></i>
                  {{ moment.location }}
                </span>
                <span class="moment-mood" v-if="moment.mood">
                  <i class="mood-icon"></i>
                  {{ moment.mood }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部签名区域 -->
      <footer class="footer">
        <p>爱你的 ❤️</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';

// 数据状态
const greeting = ref(null);
const contentBlocks = ref([]);
const moments = ref([]);
const activeBlockId = ref(null);
const bgVideo = ref(null);
const greetingText = ref(null);
const contentBlocksRef = ref([]);
const momentCards = ref([]);

// 获取数据
onMounted(async () => {
  try {
    console.log('开始加载数据...');
    
    // 获取首屏祝福内容
    const greetingRes = await fetch('/api/greetings/active');
    greeting.value = await greetingRes.json();
    console.log('祝福内容:', greeting.value);

    // 获取内容区块
    const blocksRes = await fetch('/api/content-blocks');
    contentBlocks.value = await blocksRes.json();
    console.log('内容区块:', contentBlocks.value);
    
    // 获取朋友圈动态
    const momentsRes = await fetch('/api/moments');
    moments.value = await momentsRes.json();
    console.log('朋友圈动态:', moments.value);
    
    // 初始化
    nextTick(() => {
      // 设置第一个内容区块为活动状态
      if (contentBlocks.value.length > 0) {
        activeBlockId.value = contentBlocks.value[0].id;
      }
      
      // 初始化打字机效果
      if (greeting.value && greetingText.value) {
        typeWriter(greeting.value.content, 0);
      }
      
      // 设置滚动监听
      setupScrollObserver();
      
      // 调试视频加载
      if (bgVideo.value) {
        bgVideo.value.addEventListener('loadeddata', () => {
          console.log('视频已加载');
        });
        
        bgVideo.value.addEventListener('error', (e) => {
          console.error('视频加载错误:', e);
        });
      }
    });
    
  } catch (error) {
    console.error('加载数据失败:', error);
  }
});

// 打字机效果
const typeWriter = (text, index) => {
  if (!greetingText.value) return;
  
  if (index < text.length) {
    greetingText.value.innerHTML += text.charAt(index);
    setTimeout(() => typeWriter(text, index + 1), 50);
  }
};

// 设置滚动监听
const setupScrollObserver = () => {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3
  };
  
  // 监听内容区块
  const blockObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = parseInt(entry.target.id.replace('block-', ''));
        activeBlockId.value = id;
      }
    });
  }, options);
  
  // 监听朋友圈卡片
  const momentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, options);
  
  // 等待DOM更新后观察元素
  nextTick(() => {
    // 观察内容区块
    if (contentBlocksRef.value) {
      if (Array.isArray(contentBlocksRef.value)) {
        contentBlocksRef.value.forEach(el => {
          if (el) blockObserver.observe(el);
        });
      }
    }
    
    // 观察朋友圈卡片
    if (momentCards.value) {
      if (Array.isArray(momentCards.value)) {
        momentCards.value.forEach(el => {
          if (el) momentObserver.observe(el);
        });
      }
    }
  });
};

// 滚动到下一个内容
const scrollToNext = () => {
  if (contentBlocks.value.length > 0) {
    const firstBlock = document.getElementById(`block-${contentBlocks.value[0].id}`);
    if (firstBlock) {
      firstBlock.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// 格式化日期函数
const formatYear = (dateString) => {
  return new Date(dateString).getFullYear();
};

const formatMonthDay = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};
</script>

<style>
:root {
  --overlay-opacity: 0.6;
  --transition-duration: 0.8s;
  --easing: cubic-bezier(0.16, 1, 0.3, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  height: 100%;
  overflow-x: hidden;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #000000;
}

/* 主容器 */
.main-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

/* 视频背景 */
.video-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
}

.fallback-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, var(--overlay-opacity));
  z-index: 1;
}

/* 内容包装器 */
.content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
}

/* 祝福部分 */
.greeting-section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.greeting-content {
  max-width: 800px;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.greeting-title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  animation: fadeIn 1.5s var(--easing);
}

.greeting-text {
  font-size: 1.8rem;
  line-height: 1.6;
  min-height: 3em;
}

.scroll-indicator {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  cursor: pointer;
  animation: bounce 2s infinite;
}

.arrow-down {
  width: 20px;
  height: 20px;
  border-right: 3px solid white;
  border-bottom: 3px solid white;
  transform: rotate(45deg);
  margin: 10px auto;
}

/* 内容区块 */
.content-blocks {
  min-height: 100vh;
}

.content-block {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 8%;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity var(--transition-duration) var(--easing),
              transform var(--transition-duration) var(--easing);
}

.content-block.active {
  opacity: 1;
  transform: translateY(0);
}

.block-text {
  flex: 1;
  max-width: 50%;
}

.block-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.block-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.block-content {
  font-size: 1.2rem;
  line-height: 1.8;
}

.block-image {
  flex: 1;
  text-align: center;
  padding-left: 2rem;
}

.block-image img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 朋友圈时间线部分 */
.moments-section {
  padding: 5rem 8%;
  background-color: rgba(0, 0, 0, 0.7);
  min-height: 100vh;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  position: relative;
  color: white;
}

.section-title:after {
  content: '';
  position: absolute;
  width: 80px;
  height: 4px;
  background-color: #ff4763;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline:before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 80px;
  width: 4px;
  background-color: #ddd;
  z-index: 1;
}

.moment-card {
  display: flex;
  margin-bottom: 3rem;
  position: relative;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.5s ease;
}

.moment-card.animate {
  opacity: 1;
  transform: translateY(0);
}

.moment-date {
  width: 80px;
  text-align: center;
  padding-right: 20px;
  position: relative;
  z-index: 2;
  color: white;
}

.moment-date:after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #ff4763;
  border-radius: 50%;
  right: -8px;
  top: 0;
  border: 4px solid white;
  box-shadow: 0 0 0 4px rgba(255, 71, 99, 0.3);
}

.year {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.month-day {
  display: block;
  font-size: 1rem;
  opacity: 0.8;
}

.moment-content {
  flex: 1;
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-left: 30px;
}

.moment-text {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1rem;
}

.moment-media {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin: 1rem 0;
}

.media-item img,
.media-item video {
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
  height: 150px;
}

.moment-footer {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.moment-location,
.moment-mood {
  display: flex;
  align-items: center;
}

.location-icon,
.mood-icon {
  width: 16px;
  height: 16px;
  margin-right: 5px;
  display: inline-block;
}

.location-icon {
  background-image: url('/icons/location.svg');
  background-size: contain;
  background-repeat: no-repeat;
}

.mood-icon {
  background-image: url('/icons/mood.svg');
  background-size: contain;
  background-repeat: no-repeat;
}

/* 底部区域 */
.footer {
  text-align: center;
  padding: 2rem;
  background-color: #333;
  color: white;
}

/* 动画关键帧 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  40% {
    transform: translateY(-20px) translateX(-50%);
  }
  60% {
    transform: translateY(-10px) translateX(-50%);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .greeting-title {
    font-size: 2.5rem;
  }
  
  .greeting-text {
    font-size: 1.2rem;
  }
  
  .content-block {
    flex-direction: column;
    padding: 3rem 5%;
  }
  
  .block-text,
  .block-image {
    max-width: 100%;
    margin-bottom: 2rem;
  }
  
  .block-title {
    font-size: 2rem;
  }
  
  .block-image {
    padding-left: 0;
  }
  
  .timeline:before {
    left: 30px;
  }
  
  .moment-date {
    width: 30px;
  }
  
  .year {
    font-size: 1.2rem;
  }
  
  .month-day {
    font-size: 0.8rem;
  }
  
  .moment-content {
    margin-left: 15px;
  }
}
</style>