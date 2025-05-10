<template>
  <section class="story-carousel-section" id="story-section" ref="storySection">
    <h2 class="section-title">欣路历程</h2>
    
    <div class="carousel-outer-container">
      <!-- 左侧年份 -->
      <div class="year-display-container year-left-container">
        <div class="year-track" :style="{ transform: `translateX(${-currentIndex * 100}%)` }">
          <div v-for="(moment, index) in moments" :key="`left-${moment.id}`" class="year-item">
            <span>{{ formatYearFirstTwo(moment.eventDate) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧年份 -->
      <div class="year-display-container year-right-container">
        <div class="year-track" :style="{ transform: `translateX(${-currentIndex * 100}%)` }">
          <div v-for="(moment, index) in moments" :key="`right-${moment.id}`" class="year-item">
            <span>{{ formatYearLastTwo(moment.eventDate) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 移动端年份显示 -->
      <!-- <div class="mobile-year-display">
        <span>{{ formatYear(currentMoment?.eventDate) }}</span>
      </div> -->

      <!-- 移动端年份显示 -->
<div class="mobile-year-display">
  <div class="year-track" :style="{ transform: `translateX(${-currentIndex * 100}%)` }">
    <div v-for="(moment, index) in moments" :key="`mobile-${moment.id}`" class="year-item">
      <span>{{ formatYear(moment.eventDate) }}</span>
    </div>
  </div>
</div>
      
      <div class="carousel-container" ref="carouselContainer">
        <!-- 轮播主体 -->
        <div 
          class="carousel-track" 
          ref="carouselTrack"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd($event)"
          :style="{ transform: `translateX(${-currentIndex * 100}%)` }"
        >
          <div 
            v-for="(moment, index) in moments" 
            :key="moment.id" 
            class="carousel-slide"
            :class="{ 'active': index === currentIndex }"
          >
            <div class="slide-image-container" @click="openLightbox(moment.media?.[0] || null)">
              <img 
                v-if="moment.media && moment.media.length && moment.media[0].fileType === 'image'" 
                :src="moment.media[0].filePath" 
                alt="回忆照片"
                loading="lazy"
              >
              <video 
                :ref="el => { if (el) videoRefs[index] = el; else delete videoRefs[index]; }"
                v-else-if="moment.media && moment.media.length && moment.media[0].fileType === 'video'" 
                :src="moment.media[0].filePath"
                preload="metadata"
                @play="handleCarouselVideoPlay(index)"
                @ended="handleCarouselVideoEnded(index)"
                @click.stop="openLightbox(moment.media[0])"
                controls
              ></video>
              <div v-else class="no-image">
                <span>暂无图片</span>
              </div>
              
              <div class="slide-overlay">
                <div class="slide-year">{{ formatYear(moment.eventDate) }}</div>
                <div class="slide-content-text" v-html="moment.content"></div>
              </div>
            </div>
            
            <!-- 额外的媒体缩略图 -->
            <div v-if="moment.media && moment.media.length > 1" class="slide-thumbnails">
              <div 
                v-for="(media, mediaIndex) in moment.media.slice(1)" 
                :key="mediaIndex" 
                class="thumbnail"
                @click="openLightbox(media)"
              >
                <img 
                  v-if="media.fileType === 'image'" 
                  :src="media.filePath" 
                  :alt="`缩略图 ${mediaIndex + 1}`"
                  loading="lazy"
                >
                <video 
                  v-else-if="media.fileType === 'video'" 
                  :src="media.filePath"
                  preload="metadata"
                ></video>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 导航按钮 -->
        <button class="carousel-nav prev" @click="prevSlide" aria-label="上一张">
          <div class="nav-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
            </svg>
          </div>
        </button>
        <button class="carousel-nav next" @click="nextSlide" aria-label="下一张">
          <div class="nav-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
            </svg>
          </div>
        </button>
        
        <!-- 指示器小圆点 -->
        <div class="carousel-indicators">
          <button 
            v-for="(_, index) in moments" 
            :key="index"
            class="indicator-dot"
            :class="{ 'active': index === currentIndex }"
            @click="goToSlide(index)"
            :aria-label="`跳转到第${index + 1}张`"
          ></button>
        </div>
      </div>
    </div>
    
    <!-- 图片预览弹窗 -->
    <div class="lightbox" v-if="lightboxActive" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <img v-if="currentMedia && currentMedia.fileType === 'image'" :src="currentMedia.filePath" alt="预览图片">
        <video 
          v-else-if="currentMedia && currentMedia.fileType === 'video'" 
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
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';

// 接收父组件传递的数据
const props = defineProps({
  moments: {
    type: Array,
    required: true
  }
});

// 引用和状态
const storySection = ref(null);
const carouselContainer = ref(null);
const carouselTrack = ref(null);
const currentIndex = ref(0);
const lightboxActive = ref(false);
const currentMedia = ref(null);
const autoplayInterval = ref(null);
const touchStartX = ref(0);
const touchEndX = ref(0);
const autoplayStarted = ref(false);

// 新增：用于存储视频元素的引用
const videoRefs = ref({});
// 新增：标记当前轮播内的视频是否正在播放
const activeVideoPlaying = ref(false);

// 新增：用于存储 Intersection Observer 实例
let observer = null;

// 格式化年份
const formatYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};

// 格式化年份 - 前两位数字
const formatYearFirstTwo = (dateString) => {
  if (!dateString) return '';
  const year = new Date(dateString).getFullYear().toString();
  return year.substring(0, 2);
};

// 格式化年份 - 后两位数字
const formatYearLastTwo = (dateString) => {
  if (!dateString) return '';
  const year = new Date(dateString).getFullYear().toString();
  return year.substring(2);
};

// --- Autoplay Logic ---
const startAutoplay = () => {
  if (autoplayInterval.value || autoplayStarted.value) {
    return;
  }
  // 如果当前幻灯片中的视频正在播放或尚未结束，则不启动轮播
  if (activeVideoPlaying.value) {
    console.log('轮播内视频正在播放，不启动自动轮播。');
    return;
  }
  const currentVideo = currentSlideVideoElement.value;
  if (currentVideo && !currentVideo.ended && !currentVideo.paused) {
      console.log('当前幻灯片视频尚未结束，不启动自动轮播。');
      return;
  }

  console.log('IntersectionObserver: Starting autoplay');
  autoplayStarted.value = true;
  autoplayInterval.value = setInterval(() => {
    nextSlideInternal(); // 使用内部调用，避免再次停止
  }, 3000);
};
const stopAutoplay = () => {
  if (autoplayInterval.value) {
    console.log('IntersectionObserver: Stopping autoplay');
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
    autoplayStarted.value = false; // 重置状态
  }
};
// --- Slide Control Logic ---
// 创建一个内部 nextSlide，不调用 stopAutoplay，供自动轮播使用
const nextSlideInternal = () => {
  if (currentIndex.value < props.moments.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // 循环到第一张
  }
}
// 用户交互触发的 nextSlide，需要停止自动轮播
const nextSlide = () => {
  nextSlideInternal();
  stopAutoplay(); // 用户交互停止自动轮播
};
// 用户交互触发的 prevSlide
const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.moments.length - 1; // 循环到最后一张
  }
  stopAutoplay(); // 用户交互停止自动轮播
};
// 用户交互触发的 goToSlide
const goToSlide = (index) => {
  currentIndex.value = index;
  stopAutoplay(); // 用户交互停止自动轮播
};
// --- Touch Event Handling ---
const handleTouchStart = (e) => {
  // Ensure we only track one touch point
  if (e.touches.length === 1) {
    touchStartX.value = e.touches[0].clientX;
    touchEndX.value = e.touches[0].clientX; // Initialize endX same as startX
    stopAutoplay(); // Pause autoplay on touch start
  }
};
const handleTouchMove = (e) => {
  // Ensure we only track one touch point
  if (e.touches.length === 1) {
    touchEndX.value = e.touches[0].clientX;
  }
};
const handleTouchEnd = (event) => { // Accept the event object
  // Ensure touchStartX has a valid value (avoid issues if touch started weirdly)
  if (touchStartX.value === 0) return;
  const touchDiff = touchEndX.value - touchStartX.value;
  const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
  let isSwipe = false; // Flag to track if a swipe occurred
  // Check for horizontal swipe
  if (Math.abs(touchDiff) > SWIPE_THRESHOLD) {
    if (touchDiff > SWIPE_THRESHOLD) {
      // Swipe Right (Show Previous Slide)
      console.log('Swipe Right detected, preventing click.');
      prevSlide(); // This already stops autoplay
      event.preventDefault(); // *** CRUCIAL: Prevent the subsequent click event ***
      isSwipe = true;
    } else if (touchDiff < -SWIPE_THRESHOLD) {
      // Swipe Left (Show Next Slide)
      console.log('Swipe Left detected, preventing click.');
      nextSlide(); // This already stops autoplay
      event.preventDefault(); // *** CRUCIAL: Prevent the subsequent click event ***
      isSwipe = true;
    }
  }
  // Reset touch coordinates
  touchStartX.value = 0;
  touchEndX.value = 0;
  if (!isSwipe) {
    console.log('Touch end was not a swipe. Allowing potential click.');
    // If it was not a swipe (i.e., it was likely a tap or small drag),
    // we *do not* call preventDefault(). This allows the browser
    // to proceed with firing the 'click' event if applicable.
    // The @click handler on the .slide-image-container will then
    // correctly trigger openLightbox without competition from swipe navigation.
  }
  // Removed: Autoplay restart logic is now handled by Intersection Observer
  // startAutoplay();
};
// --- Lightbox Logic ---
const openLightbox = (media) => {
  if (!media) return;
  currentMedia.value = media;
  lightboxActive.value = true;
  document.body.style.overflow = 'hidden';
  stopAutoplay(); // 打开灯箱时停止自动轮播
};
const closeLightbox = () => {
  lightboxActive.value = false;
  document.body.style.overflow = '';
  // 关闭灯箱后，尝试恢复自动轮播
  // startAutoplay 函数内部会检查元素是否完全可见
  console.log('灯箱已关闭，尝试恢复自动轮播。');
  // 可以选择性地加一个小的延迟，但通常不需要
  // setTimeout(startAutoplay, 50);
  startAutoplay();
};


// --- Lifecycle Hooks ---
onMounted(() => {
  // 配置 Intersection Observer
  const options = {
    root: null, // 相对于浏览器视口
    rootMargin: '0px',
    threshold: 0.75 // 关键：阈值为 1.0 表示元素完全可见时触发
  };
  // 创建 Observer 回调函数
  const callback = (entries) => {
    entries.forEach(entry => {
      // entry.isIntersecting 在 threshold 为 1.0 时，
      // 表示元素至少有 100% 出现在视口中（即完全可见）
      if (entry.isIntersecting && entry.intersectionRatio >= options.threshold) {
        // 元素完全可见
        console.log('组件完全可见，开始轮播');
        startAutoplay();
      } else {
        // 元素不再完全可见（或者从未完全可见）
        // 只有当之前正在轮播时才需要停止
        if (autoplayStarted.value) {
          console.log('组件不再完全可见，停止轮播');
          stopAutoplay();
        }
      }
    });
  };
  // 创建并启动 Observer
  observer = new IntersectionObserver(callback, options);
  // --- 修改这里 ---
  if (carouselContainer.value) { // 检查 carouselContainer 是否存在
    observer.observe(carouselContainer.value); // 开始观察 carouselContainer
    console.log('IntersectionObserver is observing the carousel container.'); // 更新日志
  } else {
    console.error('Carousel container ref not found on mount for IntersectionObserver.'); // 更新错误日志
  }
});
onBeforeUnmount(() => {
  // 组件销毁前停止轮播并断开观察
  stopAutoplay();
  if (observer) {
    observer.disconnect(); // 停止观察所有目标
    console.log('IntersectionObserver disconnected.');
  }
});
// --- Watcher ---
watch(() => props.moments, () => {
  currentIndex.value = 0;
  // 当数据变化时，如果元素仍然可见，Intersection Observer 会确保轮播状态正确
  // 无需手动调用 stop/start
}, { deep: true });

// 计算当前显示的moment
const currentMoment = computed(() => {
  if (!props.moments || props.moments.length === 0) return null;
  return props.moments[currentIndex.value];
});

// 新增：计算当前幻灯片中的视频元素
const currentSlideVideoElement = computed(() => {
  if (props.moments && props.moments.length > 0 && currentIndex.value >= 0 && currentIndex.value < props.moments.length) {
    const moment = props.moments[currentIndex.value];
    if (moment.media && moment.media.length > 0 && moment.media[0].fileType === 'video') {
      return videoRefs.value[currentIndex.value];
    }
  }
  return null;
});

// 新增：轮播内视频事件处理
const handleCarouselVideoPlay = (index) => {
  if (index === currentIndex.value) {
    console.log(`轮播内索引 ${index} 的视频开始播放。`);
    stopAutoplay(); // 停止轮播的自动播放间隔
    activeVideoPlaying.value = true;
  }
};

const handleCarouselVideoEnded = (index) => {
  if (index === currentIndex.value) {
    console.log(`轮播内索引 ${index} 的视频播放结束。`);
    activeVideoPlaying.value = false;
    if (!lightboxActive.value) { // 如果灯箱未激活
      startAutoplay(); // 尝试启动轮播的自动播放
    }
  }
};


// --- Lifecycle Hooks ---
onMounted(() => {
  // 配置 Intersection Observer
  const options = {
    root: null, // 相对于浏览器视口
    rootMargin: '0px',
    threshold: 0.75 // 关键：阈值为 1.0 表示元素完全可见时触发
  };
  // 创建 Observer 回调函数
  const callback = (entries) => {
    entries.forEach(entry => {
      // entry.isIntersecting 在 threshold 为 1.0 时，
      // 表示元素至少有 100% 出现在视口中（即完全可见）
      if (entry.isIntersecting && entry.intersectionRatio >= options.threshold) {
        // 元素完全可见
        console.log('组件完全可见，开始轮播');
        startAutoplay();
      } else {
        // 元素不再完全可见（或者从未完全可见）
        // 只有当之前正在轮播时才需要停止
        if (autoplayStarted.value) {
          console.log('组件不再完全可见，停止轮播');
          stopAutoplay();
        }
      }
    });
  };
  // 创建并启动 Observer
  observer = new IntersectionObserver(callback, options);
  // --- 修改这里 ---
  if (carouselContainer.value) { // 检查 carouselContainer 是否存在
    observer.observe(carouselContainer.value); // 开始观察 carouselContainer
    console.log('IntersectionObserver is observing the carousel container.'); // 更新日志
  } else {
    console.error('Carousel container ref not found on mount for IntersectionObserver.'); // 更新错误日志
  }
});
onBeforeUnmount(() => {
  // 组件销毁前停止轮播并断开观察
  stopAutoplay();
  if (observer) {
    observer.disconnect(); // 停止观察所有目标
    console.log('IntersectionObserver disconnected.');
  }
});
// --- Watcher ---
watch(currentIndex, (newIndex, oldIndex) => {
  // 暂停上一个幻灯片中的视频（如果正在播放）
  if (oldIndex !== undefined && oldIndex !== newIndex) {
    const oldVideo = videoRefs.value[oldIndex];
    if (oldVideo && !oldVideo.paused) {
      oldVideo.pause();
    }
  }
  activeVideoPlaying.value = false; // 为新幻灯片重置状态

  const newMoment = props.moments[newIndex];
  if (newMoment?.media?.[0]?.fileType === 'video') {
    stopAutoplay(); // 当视频幻灯片激活时，停止轮播的自动播放
    // Vue 的 nextTick 确保 DOM 更新后再操作 video 元素
    nextTick(() => {
        const videoElement = videoRefs.value[newIndex];
        if (videoElement) {
            videoElement.play().catch(error => console.error("轮播内视频播放失败:", error));
            // video 元素的 @play 事件会设置 activeVideoPlaying.value = true 并再次确认 stopAutoplay()
        }
    });
  } else {
    // 如果新幻灯片不是视频，并且灯箱未激活，则尝试启动自动轮播
    if (!lightboxActive.value) {
      startAutoplay();
    }
  }
});

watch(() => props.moments, () => {
  currentIndex.value = 0;
  // 当数据变化时，如果元素仍然可见，Intersection Observer 会确保轮播状态正确
  // 无需手动调用 stop/start
}, { deep: true });

// // 计算当前显示的moment
// const currentMoment = computed(() => {
//   if (!props.moments || props.moments.length === 0) return null;
//   return props.moments[currentIndex.value];
// });

</script>

<style scoped>
.story-carousel-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%);
  position: relative;
  overflow: hidden;
}

.story-carousel-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(219, 39, 119, 0.2) 0%, transparent 50%);
  z-index: 0;
}

.section-title {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 3rem;
  margin-bottom: 50px;
  color: #2c3e50;
  font-weight: 700;
}

.carousel-outer-container {
  position: relative;
  max-width: 1600px; /* 增加最大宽度 */
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-container {
  position: relative;
  z-index: 1;
  width: 1200px; /* 增加宽度 */
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.carousel-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 关键：使用边框创建相框 */
  /* 边框颜色需要与你的页面背景协调，这里用白色示例 */
  /* border: 20px solid black; */
  /* 让伪元素的圆角与容器匹配 */
  border-radius: 12px; /* 与 .carousel-container 一致 */
  /* z-index 需要高于轮播轨道 (默认 z-index: auto 或 0) */
  z-index: 2;
  /* 重要：让鼠标事件穿透伪元素，到达下面的轮播和图片 */
  pointer-events: none;
  /* 确保边框计算在元素尺寸内 */
  box-sizing: border-box;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
  height: 100%;
  z-index: 1; /* 确保轮播内容在边框内 */
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  /* 移除 position: relative, min-height, padding, box-sizing (如果添加过) */
  opacity: 0.7;
  transition: opacity 0.5s ease;
  /* 高度由内容决定或设置基础值 */
  min-height: 75vh; /* 例如 */
}

.carousel-slide.active {
  opacity: 1;
}

.slide-image-container {
  position: relative; /* 正常定位 */
  width: 100%;
  height: 75vh; /* 例如 */
  overflow: hidden;
  /* 移除或注释掉 border-radius 和 box-shadow，因为会被遮罩 */
  /* border-radius: 8px; */
  /* box-shadow: 0 5px 15px rgba(0,0,0,0.1); */
  cursor: pointer;
  /* 确保没有 margin */
  border-radius: 12px; /* 与外部容器圆角一致 */
}

.slide-image-container img,
.slide-image-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
  border-radius: 12px; /* 与外部容器圆角一致 */
}

.slide-image-container:hover img,
.slide-image-container:hover video {
  transform: scale(1.03);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #495057;
  font-size: 1.5rem;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
  color: white;
  transition: transform 0.3s ease;
  padding: 30px 60px 60px; /* 改为 上30, 左右30, 下30 */
}

.slide-year {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}

.slide-content-text {
  font-size: 1.1rem;
  line-height: 1.6;
  max-height: 120px;
  overflow-y: auto;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.slide-thumbnails {
  position: absolute; /* 相对于 slide 定位 */
  bottom: 20px;      /* 与 image container 底部留白一致 */
  left: 20px;
  right: 20px;
  height: 70px;      /* 假设缩略图高度 */
  /* ... 其他缩略图样式 ... */
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.thumbnail {
  width: 100px;
  height: 70px;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.thumbnail:hover {
  transform: translateY(-3px);
}

.thumbnail img,
.thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: ease;
}

.carousel-nav.prev .nav-arrow {
  animation-name: bounceLeft;
}

.carousel-nav.next .nav-arrow {
  animation-name: bounceRight;
}

@keyframes bounceLeft {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-5px); }
}

@keyframes bounceRight {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

.carousel-nav:hover {
  background: rgba(0, 0, 0, 0.5);
}

.carousel-nav.prev {
  left: 40px;
}

.carousel-nav.next {
  right: 40px;
}

.carousel-nav svg {
  width: 30px;
  height: 30px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

.carousel-indicators {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 12px;
  border-radius: 20px;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: white;
  transform: scale(1.2);
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

.lightbox-content img,
.lightbox-content video {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: -20px;
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

/* 年份显示样式 - 重新设计为滑动效果 */
.year-display-container {
  position: absolute;
  top: 47%;
  transform: translateY(-50%);
  height: 260px;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
  width: 360px; /* 增加宽度，避免数字重叠 */
}

.year-left-container {
  left: -180px; /* 增加与图片的距离 */
}

.year-right-container {
  right: -180px; /* 增加与图片的距离 */
}

.year-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
  height: 100%;
}

.year-item {
  flex: 0 0 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.year-left-container .year-item span {
  font-size: 16rem; /* 增大字体 */
  font-weight: 900;
  opacity: 0.4;
  color: transparent;
  background: linear-gradient(to right, #3498db, #9b59b6);
  -webkit-background-clip: text;
  background-clip: text;
  white-space: nowrap; /* 防止换行 */
}

.year-right-container .year-item span {
  font-size: 16rem; /* 增大字体 */
  font-weight: 900;
  opacity: 0.4;
  color: transparent;
  background: linear-gradient(to right, #9b59b6, #e74c3c);
  -webkit-background-clip: text;
  background-clip: text;
  white-space: nowrap; /* 防止换行 */
}

/* 导航按钮和指示器调整 */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-nav.prev {
  left: 40px; /* 增加左侧距离 */
}

.carousel-nav.next {
  right: 40px; /* 增加右侧距离 */
}

.carousel-indicators {
  position: absolute;
  bottom: 40px; /* 增加底部距离 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 12px;
  border-radius: 20px;
}

/* 移动端年份显示 */
.mobile-year-display {
  display: none; /* 默认隐藏 */
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 150px; /* 调整高度 */
  z-index: 5;
  margin-bottom: 20px;
}

.mobile-year-display .year-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
  height: 100%;
}

.mobile-year-display .year-item {
  flex: 0 0 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-year-display .year-item span {
  font-size: 8rem; /* 移动端年份大小 */
  font-weight: 900;
  opacity: 0.4;
  color: transparent;
  background: linear-gradient(to right, #3498db, #e74c3c);
  -webkit-background-clip: text;
  background-clip: text;
  white-space: nowrap;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .carousel-container {
    width: 90%;
  }
  
  .year-left-container .year-item span,
  .year-right-container .year-item span {
    font-size: 14rem;
  }
  
  .year-left-container {
    left: -100px;
  }
  
  .year-right-container {
    right: -100px;
  }
}

@media (max-width: 1200px) {

    .carousel-outer-container {
    flex-direction: column;
  }

  .year-display-container {
    display: none;
  }
  
  .mobile-year-display {
    display: block;
  }
  
  .mobile-year-display .year-item span {
    font-size: 8rem;
  }
}

@media (max-width: 768px) {
  .carousel-outer-container {
    flex-direction: column;
  }
  
  .mobile-year-display {
    height: 100px;
    margin-bottom: 36px;
  }
  
  .mobile-year-display span {
    font-size: 4rem; /* 移动端进一步减小字体 */
  }
  
  .slide-image-container {
    height: 45vh; /* 移动端大幅降低高度 */
  }
  
  .carousel-slide {
    min-height: 45vh; /* 与图片容器高度一致 */
  }
  
  .carousel-nav {
    width: 40px;
    height: 40px;
  }
  
  .carousel-nav.prev {
    left: 20px;
  }
  
  .carousel-nav.next {
    right: 20px;
  }
  
  .carousel-indicators {
    bottom: 20px;
  }
  
  .section-title {
    font-size: 2.2rem;
    margin-bottom: 30px;
  }
  
  .slide-year {
    font-size: 1.5rem;
  }
  
  .slide-content-text {
    font-size: 1rem;
    max-height: 80px;
  }
  
  .slide-overlay {
    padding: 20px 30px 40px;
  }
}
</style>