<template>
  <section class="story-timeline-section" id="story-section" ref="storySection">
    <h2 class="section-title">我们的故事</h2>
    
    <div class="timeline-container">
      <div class="timeline-line"></div>
      
      <div class="timeline-entries">
        <div 
          v-for="moment in moments" 
          :key="moment.id" 
          class="timeline-entry"
          :id="`moment-${moment.id}`"
          ref="momentEntries"
        >
          <div class="timeline-year">{{ formatYear(moment.eventDate) }}</div>
          <div class="timeline-dot"></div>
          
          <div class="timeline-card">
            <div class="timeline-card-content">
              <div class="timeline-text" v-html="moment.content"></div>
              
              <div v-if="moment.media && moment.media.length" class="timeline-media">
                <div 
                  v-for="media in moment.media" 
                  :key="media.id" 
                  class="media-item"
                  @click="openLightbox(media)"
                >
                  <img 
                    v-if="media.fileType === 'image'" 
                    :src="media.filePath" 
                    :alt="`Moment media ${media.id}`" 
                    loading="lazy"
                  >
                  <video 
                    v-else-if="media.fileType === 'video'" 
                    controls 
                    :src="media.filePath" 
                    preload="metadata"
                  ></video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图片预览弹窗 -->
    <div class="lightbox" v-if="lightboxActive" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <img v-if="currentMedia.fileType === 'image'" :src="currentMedia.filePath" alt="预览图片">
        <video 
          v-else-if="currentMedia.fileType === 'video'" 
          controls 
          :src="currentMedia.filePath" 
          autoplay
        ></video>
        <button class="lightbox-close" @click="closeLightbox">×</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 接收父组件传递的数据
const props = defineProps({
  moments: {
    type: Array,
    required: true
  }
});

// 引用和状态
const storySection = ref(null);
const momentEntries = ref([]);
const lightboxActive = ref(false);
const currentMedia = ref({});

// 观察器
let momentObserver = null;

// 格式化年份
const formatYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};

// 打开图片预览
const openLightbox = (media) => {
  currentMedia.value = media;
  lightboxActive.value = true;
  document.body.style.overflow = 'hidden'; // 防止背景滚动
};

// 关闭图片预览
const closeLightbox = () => {
  lightboxActive.value = false;
  document.body.style.overflow = ''; // 恢复滚动
};

// 设置滚动动画
onMounted(() => {
  // 设置 Intersection Observer 来触发动画
  const options = {
    root: null,
    rootMargin: '0px 0px -20% 0px',
    threshold: 0.1
  };

  momentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, options);

  // 观察所有时间线条目
  if (Array.isArray(momentEntries.value)) {
    momentEntries.value.forEach(el => {
      if (el) {
        momentObserver.disconnect();
        momentObserver.observe(el);
      }
    });
  }
});
</script>

<style scoped>
.story-timeline-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

.story-timeline-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%);
  z-index: 1;
}

.section-title {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 80px;
  color: #2c3e50;
  font-weight: 700;
  position: relative;
  z-index: 2;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: #3498db;
  margin: 20px auto 0;
  border-radius: 2px;
}

.timeline-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 4px;
  background: linear-gradient(to bottom, #3498db, #9b59b6);
  transform: translateX(-50%);
  border-radius: 2px;
}

.timeline-entries {
  position: relative;
}

.timeline-entry {
  position: relative;
  margin-bottom: 100px;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.timeline-entry.animate {
  opacity: 1;
  transform: translateY(0);
}

.timeline-entry:nth-child(odd) .timeline-card {
  margin-left: auto;
  margin-right: 60px;
}

.timeline-entry:nth-child(even) .timeline-card {
  margin-left: 60px;
  margin-right: auto;
}

.timeline-year {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #3498db;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.timeline-dot {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 2;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.3);
}

.timeline-card {
  width: calc(50% - 40px);
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.timeline-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.timeline-card::before {
  content: '';
  position: absolute;
  top: 20px;
  width: 20px;
  height: 20px;
  background: white;
  transform: rotate(45deg);
}

.timeline-entry:nth-child(odd) .timeline-card::before {
  right: -10px;
}

.timeline-entry:nth-child(even) .timeline-card::before {
  left: -10px;
}

.timeline-card-content {
  position: relative;
  z-index: 2;
}

.timeline-text {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #2c3e50;
}

.timeline-media {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.media-item {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.media-item:hover {
  transform: scale(1.03);
}

.media-item::after {
  content: '点击查看';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px;
  text-align: center;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-item:hover::after {
  opacity: 1;
}

.media-item img, .media-item video {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

/* 灯箱样式 */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
}

.lightbox-content img, .lightbox-content video {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .timeline-line {
    left: 30px;
  }
  
  .timeline-entry:nth-child(odd) .timeline-card,
  .timeline-entry:nth-child(even) .timeline-card {
    width: calc(100% - 80px);
    margin-left: 80px;
    margin-right: 0;
  }
  
  .timeline-year {
    left: 30px;
    transform: none;
  }
  
  .timeline-dot {
    left: 30px;
    transform: none;
  }
  
  .timeline-entry:nth-child(odd) .timeline-card::before,
  .timeline-entry:nth-child(even) .timeline-card::before {
    left: -10px;
    right: auto;
  }
}
</style>