<!-- pages/index.vue -->
<template>
    <div>
      <!-- 首屏生日祝福部分 -->
      <section 
        v-if="greeting" 
        class="greeting-section" 
        :style="{ backgroundImage: `url(${greeting.backgroundImage})` }"
        ref="greetingSection">
        <div class="greeting-content" :style="{ color: greeting.textColor }">
          <h1 class="greeting-title" v-intersect="onTitleIntersect">{{ greeting.title }}</h1>
          <p class="greeting-text" v-intersect="onTextIntersect">{{ greeting.content }}</p>
          <div class="scroll-indicator" @click="scrollToContentBlocks">
            <span>继续往下</span>
            <div class="arrow-down"></div>
          </div>
        </div>
      </section>
  
      <!-- 苹果风格的滚动内容区域 -->
      <section class="content-blocks-section">
        <div 
          v-for="block in contentBlocks" 
          :key="block.id"
          class="content-block"
          :style="{ backgroundColor: block.backgroundColor }"
          v-intersect="(isIntersecting) => onBlockIntersect(block.id, isIntersecting)">
          
          <div class="block-text" :style="{ color: block.textColor }" :class="{ 'animate': animatedBlocks[block.id] }">
            <h2 class="block-title">{{ block.title }}</h2>
            <h3 class="block-subtitle">{{ block.subtitle }}</h3>
            <div class="block-content" v-html="block.content"></div>
          </div>
          
          <div 
            class="block-image" 
            :class="[
              `image-${block.imagePosition}`,
              { 'animate': animatedBlocks[block.id] }
            ]">
            <img :src="block.imageUrl" :alt="block.title">
          </div>
        </div>
      </section>
  
      <!-- 朋友圈时间线部分 -->
      <section class="moments-section">
        <h2 class="section-title">我们的故事</h2>
        <div class="timeline">
          <div 
            v-for="moment in moments" 
            :key="moment.id"
            class="moment-card"
            :class="{ 'animate': animatedMoments[moment.id] }"
            v-intersect="(isIntersecting) => onMomentIntersect(moment.id, isIntersecting)">
            
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
  </template>
  
  <script setup>
  import { ref, onMounted, reactive } from 'vue';
  
  const greeting = ref(null);
  const contentBlocks = ref([]);
  const moments = ref([]);
  const animatedBlocks = reactive({});
  const animatedMoments = reactive({});
  
  onMounted(async () => {
    try {
      // 获取首屏祝福内容
      const greetingRes = await fetch('/api/greetings/active');
      greeting.value = await greetingRes.json();
  
      // 获取内容区块
      const blocksRes = await fetch('/api/content-blocks');
      contentBlocks.value = await blocksRes.json();
      
      // 获取朋友圈动态
      const momentsRes = await fetch('/api/moments');
      moments.value = await momentsRes.json();
      
      // 媒体文件已经包含在动态中，不需要额外获取
      console.log('加载数据成功:', { greeting: greeting.value, blocks: contentBlocks.value, moments: moments.value });
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  });
  
  // 格式化日期函数
  const formatYear = (dateString) => {
    return new Date(dateString).getFullYear();
  };
  
  const formatMonthDay = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  // 平滑滚动到内容区块
  const scrollToContentBlocks = () => {
    const blocksSection = document.querySelector('.content-blocks-section');
    if (blocksSection) {
      blocksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Intersection Observer 回调函数
  const onTitleIntersect = (isIntersecting) => {
    if (isIntersecting) {
      // 添加动画类
    }
  };
  
  const onTextIntersect = (isIntersecting) => {
    if (isIntersecting) {
      // 添加动画类
    }
  };
  
  const onBlockIntersect = (blockId, isIntersecting) => {
    if (isIntersecting) {
      animatedBlocks[blockId] = true;
    }
  };
  
  const onMomentIntersect = (momentId, isIntersecting) => {
    if (isIntersecting) {
      animatedMoments[momentId] = true;
    }
  };
  
  // 声明 v-intersect 指令
  const vIntersect = {
    mounted(el, binding) {
      const observer = new IntersectionObserver((entries) => {
        const isIntersecting = entries[0].isIntersecting;
        binding.value(isIntersecting);
      }, {
        threshold: 0.1
      });
      
      observer.observe(el);
      
      // 在元素卸载时取消观察
      el._observer = observer;
    },
    
    unmounted(el) {
      if (el._observer) {
        el._observer.disconnect();
      }
    }
  };
  </script>
  
  <style scoped>
  /* 全局样式 */
  :root {
    --transition-duration: 0.8s;
    --easing: cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  /* 首屏祝福部分 */
  .greeting-section {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
  }
  
  .greeting-content {
    text-align: center;
    padding: 2rem;
    max-width: 800px;
    position: relative;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    animation: fadeIn 2s var(--easing);
  }
  
  .greeting-title {
    font-size: 4rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }
  
  .greeting-text {
    font-size: 1.8rem;
    line-height: 1.6;
    opacity: 0;
    animation: fadeInUp 1.5s var(--easing) forwards;
    animation-delay: 0.8s;
  }
  
  .scroll-indicator {
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    text-align: center;
    cursor: pointer;
    animation: bounce 2s infinite;
    opacity: 0;
    animation-delay: 2s;
    animation-fill-mode: forwards;
  }
  
  .arrow-down {
    width: 20px;
    height: 20px;
    border-right: 3px solid white;
    border-bottom: 3px solid white;
    transform: rotate(45deg);
    margin: 10px auto;
  }
  
  /* 内容区块部分 */
  .content-blocks-section {
    width: 100%;
    overflow: hidden;
  }
  
  .content-block {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4rem 8%;
    overflow: hidden;
  }
  
  .block-text {
    flex: 1;
    max-width: 50%;
    opacity: 0;
    transform: translateY(50px);
    transition: opacity var(--transition-duration) var(--easing),
                transform var(--transition-duration) var(--easing);
  }
  
  .block-text.animate {
    opacity: 1;
    transform: translateY(0);
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
    opacity: 0;
    transform: translateX(100px);
    transition: opacity var(--transition-duration) var(--easing),
                transform var(--transition-duration) var(--easing);
  }
  
  .block-image.animate {
    opacity: 1;
    transform: translateX(0);
  }
  
  .block-image img {
    max-width: 100%;
    max-height: 70vh;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  
  .image-left {
    order: -1;
    transform: translateX(-100px);
  }
  
  .image-center {
    flex: 1;
    max-width: 100%;
    margin: 0 auto;
  }
  
  /* 朋友圈时间线部分 */
  .moments-section {
    padding: 5rem 8%;
    background-color: #f8f8f8;
  }
  
  .section-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    position: relative;
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
    color: #333;
  }
  
  .month-day {
    display: block;
    font-size: 1rem;
    color: #666;
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
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0) translateX(-50%);
      opacity: 0.7;
    }
    40% {
      transform: translateY(-20px) translateX(-50%);
      opacity: 1;
    }
    60% {
      transform: translateY(-10px) translateX(-50%);
      opacity: 1;
    }
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .content-block {
      flex-direction: column;
      padding: 3rem 5%;
    }
    
    .block-text,
    .block-image {
      max-width: 100%;
      margin-bottom: 2rem;
    }
    
    .image-left {
      order: 0;
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