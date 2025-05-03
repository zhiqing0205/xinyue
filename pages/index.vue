<template>
  <div class="main-container">
    <!-- Background Video/Fallback -->
    <div class="video-container" :class="{ 'fixed': scrollY < storySectionOffsetTop }">
      <video ref="bgVideo" autoplay loop muted playsinline class="background-video" v-if="greeting?.backgroundVideo">
        <source :src="greeting.backgroundVideo" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div v-else class="fallback-background"></div>
      <div class="overlay" ref="overlay"></div>
    </div>

    <!-- Content Wrapper -->
    <div class="content-wrapper">
      <!-- Greeting Section -->
      <section class="greeting-section" ref="greetingSection" v-if="greeting">
        <div class="greeting-content" :style="{ color: greeting.textColor || '#ffffff' }" ref="greetingContent">
          <div class="profile-image-container" v-if="greeting.profileImage">
            <img class="profile-image" :src="greeting.profileImage" alt="Profile Image">
          </div>
          <h1 class="greeting-title" ref="greetingTitle">{{ greeting.title }}</h1>
          <p class="greeting-text" ref="greetingText"></p>
        </div>
        <div
          class="scroll-indicator"
          @click="scrollToNext"
          ref="scrollIndicator"
          :style="{ opacity: scrollIndicatorOpacity }"
        >
          <span>Scroll Down</span>
          <div class="arrow-down"></div>
        </div>
      </section>

      <!-- Content Blocks Section (Sticky Container) -->
        <!-- Set explicit height to allow sticky positioning to work correctly when scrolling back up -->
      <div
        class="content-blocks"
        ref="contentBlocksContainerRef"
        :style="{ height: contentBlocksContainerHeight }"
      >
        <section
          v-for="(block, index) in contentBlocks"
          :key="block.id"
          class="content-block"
          :class="{ 'active': activeBlockId === block.id }"
          :id="`block-${block.id}`"
          ref="contentBlocksRef"
          :data-index="index"
        >
          <!-- Inner container for consistent padding/layout -->
          <div class="content-block-inner">
            <div class="block-text" :style="{ color: block.textColor || '#ffffff' }">
              <h2 class="block-title">{{ block.title }}</h2>
              <h3 class="block-subtitle" v-if="block.subtitle">{{ block.subtitle }}</h3>
              <div class="block-content" v-html="block.content"></div>
            </div>
            <div class="block-image" v-if="block.imageUrl">
              <img :src="block.imageUrl" :alt="block.title || 'Content Image'">
            </div>
          </div>
        </section>
      </div>

      <!-- Moments/Story Section (Redesigned) -->
      <section class="moments-section" v-if="moments.length > 0" ref="storySection" id="story-section">
        <h2 class="section-title">Our Story</h2>
        <div class="timeline">
          <!-- Vertical Line -->
          <div class="timeline-line"></div>
          <!-- Moment Cards -->
          <div
            v-for="moment in moments"
            :key="moment.id"
            class="moment-entry"
            :id="`moment-${moment.id}`"
            ref="momentCards"
          >
            <div class="moment-dot"></div>
            <div class="moment-card">
              <div class="moment-card-header">
                <span class="moment-date">{{ formatFullDate(moment.eventDate) }}</span>
              </div>
              <div class="moment-card-body">
                <div class="moment-text" v-html="moment.content"></div>
                <div v-if="moment.media && moment.media.length" class="moment-media">
                    <div v-for="media in moment.media" :key="media.id" class="media-item">
                        <img v-if="media.fileType === 'image'" :src="media.filePath" :alt="`Moment media ${media.id}`" loading="lazy">
                        <video v-else-if="media.fileType === 'video'" controls :src="media.filePath" preload="metadata"></video>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <p>With Love ❤️</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';

// --- Reactive State ---
const greeting = ref(null);
const contentBlocks = ref([]);
const moments = ref([]);
const activeBlockId = ref(null); // ID of the currently centered/active content block
const scrollY = ref(0);
const storySectionOffsetTop = ref(0); // Top position of the moments section
const contentBlocksContainerHeight = ref(null); // Dynamic height for sticky container

// --- Template Refs ---
const bgVideo = ref(null);
const greetingText = ref(null);
const contentBlocksRef = ref([]); // Array of refs for individual block elements
const momentCards = ref([]); // Array of refs for moment card elements
const greetingSection = ref(null);
const greetingContent = ref(null);
const greetingTitle = ref(null);
const scrollIndicator = ref(null);
const storySection = ref(null);
const overlay = ref(null);
const contentBlocksContainerRef = ref(null); // Ref for the blocks container


// --- Computed Properties ---
// Scroll progress within the greeting section (0 to 1)
const scrollProgress = computed(() => {
  if (!greetingSection.value) return 0;
  const sectionHeight = greetingSection.value.offsetHeight;
  return sectionHeight > 0 ? Math.min(1, Math.max(0, scrollY.value / sectionHeight)) : 0;
});

// Opacity for the scroll indicator (fades out as user scrolls down the first section)
const scrollIndicatorOpacity = computed(() => {
  const fadeEndProgress = 0.6; // Fully faded after 60% scroll of first section
  return Math.max(0, 1 - scrollProgress.value / fadeEndProgress);
});

// --- Lifecycle Hooks ---
let blockObserver = null;
let momentObserver = null;

onMounted(async () => {
  await fetchData(); // Fetch data first

  await nextTick(); // Ensure DOM is updated after data fetch

  initializeStateAndListeners(); // Setup everything else
});

onBeforeUnmount(() => {
  // Cleanup listeners and observers
  window.removeEventListener('scroll', handleScroll);
  if (bgVideo.value) {
    bgVideo.value.removeEventListener('loadeddata', handleVideoLoaded);
    bgVideo.value.removeEventListener('error', handleVideoError);
  }
  if (blockObserver) blockObserver.disconnect();
  if (momentObserver) momentObserver.disconnect();
});

// --- Functions ---

async function fetchData() {
  try {
    console.log('Fetching data...');
    // Use Promise.all for parallel fetching
    const [greetingRes, blocksRes, momentsRes] = await Promise.all([
      fetch('/api/greetings/active'),
      fetch('/api/content-blocks'),
      fetch('/api/moments')
    ]);

    // Check responses and parse JSON
    greeting.value = greetingRes.ok ? await greetingRes.json() : null;
    let fetchedBlocks = blocksRes.ok ? await blocksRes.json() : [];
    let fetchedMoments = momentsRes.ok ? await momentsRes.json() : [];


    // Ensure results are arrays
    contentBlocks.value = Array.isArray(fetchedBlocks) ? fetchedBlocks : [];
    moments.value = Array.isArray(fetchedMoments) ? fetchedMoments : [];


    console.log('Greeting:', greeting.value);
    console.log('Content Blocks:', contentBlocks.value);
    console.log('Moments:', moments.value);

    // Set initial active block ID _after_ data is loaded and validated
    // Set based on index 0 if blocks exist
    if (contentBlocks.value.length > 0) {
        activeBlockId.value = contentBlocks.value[0].id;
    }


  } catch (error) {
    console.error('Data fetching failed:', error);
    // Set empty arrays on failure to prevent errors later
    contentBlocks.value = [];
    moments.value = [];
  }
}

function initializeStateAndListeners() {
    console.log("Initializing states and listeners...");

  // Calculate offsets and heights needed _after_ DOM is ready
  calculateLayout();

    // Set the height for the sticky container
    if (contentBlocksContainerRef.value && contentBlocks.value.length > 0) {
        // Add a buffer (e.g., 1 viewport height) for smoother transitions at edges
        const bufferVh = 1;
        contentBlocksContainerHeight.value = `calc(${window.innerHeight}px * ${contentBlocks.value.length + bufferVh})`;
        console.log("Calculated Content Blocks Container Height:", contentBlocksContainerHeight.value);
    } else {
        // Fallback if no blocks or ref not ready
        contentBlocksContainerHeight.value = '0px';
        console.log("Content Blocks Container Height set to 0px (no blocks or ref invalid).");
    }


  // Start typewriter effect
  if (greeting.value?.content && greetingText.value) {
    setTimeout(() => {
      typeWriter(greeting.value.content, 0);
    }, 150); // Delay to ensure content is rendered before starting typewriter
  } else {
        // If no typewriter, make scroll indicator visible immediately if needed
        if (scrollIndicator.value && contentBlocks.value.length > 0) {
            scrollIndicator.value.classList.add('visible-initial');
        }
  }

  // Setup Intersection Observers
  setupScrollObservers();

  // Video setup
  if (bgVideo.value) {
    bgVideo.value.addEventListener('loadeddata', handleVideoLoaded);
    bgVideo.value.addEventListener('error', handleVideoError);
        // Check if already loaded (rare but possible)
        if (bgVideo.value.readyState >= 3) { // HAVE_FUTURE_DATA or more
            handleVideoLoaded();
        }
  } else {
    startInitialAnimation(); // Start animation if no video
  }

  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true }); // Use passive listener
  handleScroll(); // Initial call to set scrollY
}

function calculateLayout() {
    // Calculate story section offset
    if (storySection.value) {
        // Get distance from the top of the document
        let element = storySection.value;
        let offset = 0;
        do {
          offset += element.offsetTop || 0;
          element = element.offsetParent;
        } while(element);
        storySectionOffsetTop.value = offset;

        console.log("Story Section Offset Top:", storySectionOffsetTop.value);

    } else if (greetingSection.value) {
        // Estimate if story section isn't rendered (e.g., no moments)
         let estimatedOffset = greetingSection.value.offsetHeight || window.innerHeight;
         estimatedOffset += (contentBlocks.value.length * window.innerHeight); // Basic guess
         storySectionOffsetTop.value = estimatedOffset;
        console.log("Estimated Story Section Offset Top:", storySectionOffsetTop.value);
    } else {
        storySectionOffsetTop.value = window.innerHeight * (1 + contentBlocks.value.length); // Rough fallback
        console.log("Rough Fallback Story Section Offset Top:", storySectionOffsetTop.value);
    }

}


// Event Handlers
const handleScroll = () => {
  scrollY.value = window.scrollY;
};

const handleVideoLoaded = () => {
  console.log('Video loaded.');
  if (bgVideo.value) bgVideo.value.classList.add('loaded');
  startInitialAnimation();
};

const handleVideoError = (e) => {
  console.error('Video loading error:', e);
  startInitialAnimation(); // Proceed even if video fails
};

// Animations & Effects
function startInitialAnimation() {
    if (overlay.value) {
        // Ensure initial styles are set before adding class for animation
        overlay.value.style.opacity = '0';
        requestAnimationFrame(() => {
            overlay.value.classList.add('fade-in');
        });
    }
    if (greetingContent.value) {
        greetingContent.value.style.opacity = '0';
        requestAnimationFrame(() => {
             greetingContent.value.classList.add('fade-in');
        });
    }
}


function typeWriter(text, index) {
  if (!greetingText.value) return;
  if (index < text.length) {
    greetingText.value.innerHTML += text.charAt(index);
    setTimeout(() => typeWriter(text, index + 1), 80); // Slightly slower typing
  } else {
    // Typing finished
    if (scrollIndicator.value) {
      // Add class to manage visibility (separate from opacity style binding)
      scrollIndicator.value.classList.add('visible-initial');
    }
  }
}

// Scroll Observers
function setupScrollObservers() {
  // Observer for Content Blocks (Sticky Activation)
  const blockOptions = {
    root: null, // Viewport
    // Defines the "sweet spot" - triggers when block is roughly between 30% from top and 30% from bottom
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0.01, // Trigger even if only a small part enters/leaves the margin
  };

  blockObserver = new IntersectionObserver((entries) => {

    // Find the entry that is currently intersecting the most centered area
    const intersectingEntry = entries.find(entry => entry.isIntersecting);

    if (intersectingEntry) {
        const targetElement = intersectingEntry.target;
        const id = parseInt(targetElement.id.replace('block-', ''));

        // Check if the active block needs to change
         if(activeBlockId.value !== id) {
             console.log(`Activating Block: ${id}`);
             activeBlockId.value = id; // Update the active ID
         }
    } else {
         // Optional: If nothing is strictly in the center margin (e.g. scrolling fast),
         // we might want to keep the last active ID or determine based on scroll direction.
         // For simplicity, let's stick with the intersecting logic. If none intersect margin,
         // activeBlockId remains, and CSS handles :not(.active) state.
    }

     // Update classes for all observed blocks based on the single activeBlockId
     contentBlocksRef.value.forEach(el => {
         if (!el) return;
         const currentId = parseInt(el.id.replace('block-', ''));
         if (currentId === activeBlockId.value) {
             el.classList.add('active');
         } else {
             el.classList.remove('active');
         }
     });


  }, blockOptions);

  // Observer for Moment Cards (Animation Trigger)
  const momentOptions = {
    root: null,
    rootMargin: '0px 0px -20% 0px', // Trigger when 20% from bottom
    threshold: 0.1, // Need 10% visible
  };

  momentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        // Optional: Unobserve after first animation
        // momentObserver.unobserve(entry.target);
      } else {
          // Optional: Remove class if you want animation to re-trigger on scroll up
          // entry.target.classList.remove('animate');
      }
    });
  }, momentOptions);

  // Observe elements after DOM is confirmed ready
  nextTick(() => {
    // Observe Content Blocks
    if (Array.isArray(contentBlocksRef.value)) {
        let observedCount = 0;
        contentBlocksRef.value.forEach(el => {
            if (el) {
                blockObserver.observe(el);
                observedCount++;
            }
        });
         console.log(`Observing ${observedCount} content blocks.`);
    } else {
        console.warn("contentBlocksRef is not an array or empty.");
    }

    // Observe Moment Cards
    if (Array.isArray(momentCards.value)) {
         let observedCount = 0;
         momentCards.value.forEach(el => {
            if (el) {
                momentObserver.observe(el);
                 observedCount++;
            }
        });
         console.log(`Observing ${observedCount} moment cards.`);
    } else {
        console.warn("momentCards is not an array or empty.");
    }
  });
}


// Utilities
function scrollToNext() {
  // Scroll to the start of the content blocks container
  if (contentBlocksContainerRef.value) {
      // Calculate the correct offset, considering potential fixed header height if any
      const offsetTop = contentBlocksContainerRef.value.offsetTop;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  } else if (contentBlocks.value.length > 0 && contentBlocksRef.value?.[0]) {
      // Fallback to first block element
      contentBlocksRef.value[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Date Formatting
const formatFullDate = (dateString) => {
  if (!dateString) return '';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString; // Return original string on error
  }
};

// (Keep formatYear and formatMonthDay if used elsewhere, though formatFullDate is used in the redesigned timeline)
const formatYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};

const formatMonthDay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};


</script>

<style>
:root {
  --overlay-opacity: 0.65;
  --transition-duration: 0.7s; /* Slightly faster transitions */
  --easing: cubic-bezier(0.25, 1, 0.5, 1); /* Ease Out Quad */
  --primary-color: #ff6b6b; /* Softer pink/red */
  --secondary-color: #4ecdc4; /* Tealish blue */
  --text-light: #f8f9fa;
  --text-dark: #343a40;
  --text-muted: #6c757d;
  --background-dark: #121212;
  --background-card: #ffffff;
  --background-overlay: rgba(0, 0, 0, var(--overlay-opacity));
  --shadow-light: 0 4px 15px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 8px 25px rgba(0, 0, 0, 0.15);
  --shadow-dark: 0 12px 35px rgba(0, 0, 0, 0.2);
}

/* --- Base & Reset --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  font-size: 16px; /* Base font size */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--background-dark);
  color: var(--text-light);
  overflow-x: hidden; /* Prevent horizontal scroll */
  line-height: 1.6;
}

/* --- Background Elements --- */
.video-container {
  position: absolute; /* Will become fixed via class */
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
}

.video-container.fixed {
  position: fixed;
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
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.background-video.loaded {
  opacity: 1;
}

.fallback-background {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: var(--background-dark); /* Dark fallback */
}

.overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: var(--background-overlay);
  backdrop-filter: blur(4px); /* Slightly more blur */
  z-index: 1;
  opacity: 0;
  /* Uses fade-in animation class */
}
.overlay.fade-in {
   animation: overlayFadeIn 1.2s var(--easing) forwards;
}

/* --- Content Wrapper --- */
.content-wrapper {
  position: relative;
  z-index: 2; /* Above overlay */
  width: 100%;
}

/* --- Greeting Section --- */
.greeting-section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.greeting-content {
  max-width: 900px; /* Slightly wider */
  padding: 2.5rem clamp(1.5rem, 5vw, 3rem); /* Responsive padding */
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  color: var(--text-light); /* Ensure default text color */
  /* Uses fade-in animation class */
}
.greeting-content.fade-in {
   animation: contentFadeIn 1.5s var(--easing) 0.4s forwards; /* Delay slightly */
}


.greeting-title {
  font-size: clamp(2.8rem, 7vw, 4.8rem);
  font-weight: 700; /* Bold */
  margin-bottom: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.5px;
  background: linear-gradient(60deg, var(--primary-color), var(--secondary-color), #fffa65); /* Add yellow */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.greeting-text {
  font-size: clamp(1.1rem, 3vw, 1.6rem); /* Responsive */
  line-height: 1.7;
  min-height: 1.7em;
  max-width: 650px; /* Limit text width */
  margin: 0 auto 1rem auto; /* Center text block */
  color: inherit; /* Inherit color from parent */
}

.scroll-indicator {
  position: absolute;
  bottom: 35px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text-light);
  text-align: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0; /* Controlled by style binding */
  transition: opacity 0.5s ease, transform 0.3s ease;
  pointer-events: none; /* Initially non-interactive */
  animation: bounce 2.5s infinite ease-in-out 1s; /* Start bounce after delay */
}

.scroll-indicator.visible-initial {
    opacity: 1; /* Set initial opacity via class if no typewriter */
    pointer-events: auto; /* Make interactive */
}
/* Style binding will override class opacity during scroll */

.scroll-indicator span {
   display: block;
   margin-bottom: 8px;
   font-size: 0.8rem;
   text-transform: uppercase;
   letter-spacing: 1px;
   text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.arrow-down {
  width: 16px;
  height: 16px;
  border-right: 2px solid var(--text-light);
  border-bottom: 2px solid var(--text-light);
  transform: rotate(45deg);
  margin: 0 auto;
}

/* --- Content Blocks Section --- */
.content-blocks {
  position: relative; /* Must be relative for sticky children */
  z-index: 1; /* Below greeting initially */
  /* Height is set dynamically via :style binding */
}

.content-block {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex; /* Use flex on the block for alignment */
  align-items: center;
  justify-content: center;
  /* --- Fade Transition --- */
  opacity: 0;
  transition: opacity var(--transition-duration) ease-in-out;
  /* --- Interaction Control --- */
  pointer-events: none; /* Prevent interaction with inactive blocks */
}

.content-block.active {
  opacity: 1;
  z-index: 2; /* Active block on top */
  pointer-events: auto; /* Allow interaction with active block */
}

.content-block-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1300px; /* Wider max content */
    padding: 4rem clamp(2rem, 6vw, 6rem); /* Generous padding */
    box-sizing: border-box;
    height: 100%;
}

.block-text {
  flex: 1 1 55%; /* Give text slightly more space */
  max-width: 60%;
  padding-right: 3rem;
  color: var(--text-light); /* Default text color */
  /* Subtle animation for active state */
  transition: transform 0.6s var(--easing) 0.1s, opacity 0.6s ease 0.1s;
  transform: translateX(-15px);
  opacity: 0;
}
.content-block.active .block-text {
    transform: translateX(0);
    opacity: 1;
}

.block-title {
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 600;
  margin-bottom: 1.2rem;
  line-height: 1.3;
  color: inherit;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.block-subtitle {
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  margin-bottom: 1.8rem;
  opacity: 0.85;
  font-weight: 300; /* Lighter weight */
}

.block-content {
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  line-height: 1.8;
}
.block-content p { margin-bottom: 1em; }
.block-content p:last-child { margin-bottom: 0; }

.block-image {
  flex: 1 1 45%;
  max-width: 40%;
  text-align: center;
  /* Subtle animation */
  transition: transform 0.7s var(--easing), opacity 0.7s ease;
  transform: scale(0.95) rotate(-2deg); /* Start slightly scaled and rotated */
  opacity: 0;
}
.content-block.active .block-image {
    transform: scale(1) rotate(0deg);
    opacity: 1;
}

.block-image img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 10px;
  box-shadow: var(--shadow-medium);
  object-fit: cover; /* Use cover for better filling */
  display: block; /* Remove bottom space */
}


/* --- Moments Section (Redesigned) --- */
.moments-section {
  padding: 6rem clamp(1rem, 5vw, 4rem); /* More padding */
  background-color: #f4f7f6; /* Light off-white background */
  color: var(--text-dark); /* Dark text for this section */
  min-height: 100vh;
  position: relative;
  z-index: 3; /* Above sticky content */
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1); /* Top shadow */
}

.section-title {
  text-align: center;
  font-size: clamp(2rem, 5vw, 2.6rem);
  font-weight: 600;
  margin-bottom: 4rem;
  color: var(--text-dark);
  position: relative;
}

.section-title:after {
  content: '';
  position: absolute;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2px;
}

.timeline {
  position: relative;
  max-width: 700px; /* Slightly narrower */
  margin: 0 auto;
}

/* Vertical line */
.timeline-line {
  position: absolute;
  top: 10px; /* Start below first dot */
  bottom: 10px; /* End above last dot */
  left: 10px; /* Position for the dot */
  width: 3px; /* Thinner line */
  background-color: #dee2e6; /* Light grey line */
  z-index: 1;
  border-radius: 2px;
}

.moment-entry {
  display: flex;
  align-items: flex-start; /* Align items to the top */
  margin-bottom: 2.5rem; /* Space between entries */
  position: relative;
  padding-left: 40px; /* Space for dot and line */
  /* Animation setup */
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.moment-entry.animate {
    opacity: 1;
    transform: translateY(0);
}

/* Timeline dot */
.moment-dot {
  position: absolute;
  left: 0px; /* Align with the line's left edge */
  top: 8px; /* Align vertically with card header/date */
  width: 21px; /* Dot diameter including border */
  height: 21px;
  background-color: var(--background-card); /* White background */
  border: 4px solid var(--primary-color); /* Primary color border */
  border-radius: 50%;
  z-index: 2; /* Above line */
  box-shadow: 0 0 0 3px var(--background-card); /* Cutout effect */
  transition: border-color 0.3s ease;
}
.moment-entry:hover .moment-dot {
    border-color: var(--secondary-color); /* Change color on hover */
}


/* Moment card */
.moment-card {
  flex: 1;
  background-color: var(--background-card);
  border-radius: 8px;
  box-shadow: var(--shadow-light);
  overflow: hidden; /* Clip content */
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.moment-entry:hover .moment-card {
    box-shadow: var(--shadow-medium);
    transform: translateY(-3px); /* Subtle lift */
}

.moment-card-header {
  padding: 0.8rem 1.5rem;
  background-color: #f8f9fa; /* Very light grey header */
  border-bottom: 1px solid #e9ecef;
}

.moment-date {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
}

.moment-card-body {
  padding: 1.5rem;
}

.moment-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #495057; /* Slightly darker grey */
  margin-bottom: 1.2rem; /* Space before media */
}
.moment-text p:last-child { margin-bottom: 0; }

/* Media Grid */
.moment-media {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); /* Responsive columns */
    gap: 10px;
    margin-top: 1rem; /* Add space if text is short */
}

.media-item {
    position: relative;
    overflow: hidden;
    border-radius: 6px; /* Slightly smaller radius */
    background-color: #e9ecef; /* Placeholder bg */
    aspect-ratio: 1 / 1; /* Square items */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.media-item:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-light);
    z-index: 5; /* Bring hovered item forward */
}

.media-item img,
.media-item video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 6px;
}
.media-item video {
  background-color: #000; /* Background for video loading */
}


/* --- Footer --- */
.footer {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(to bottom, var(--background-dark) 0%, #000000 100%); /* Dark gradient */
  color: var(--text-muted); /* Muted text color */
  position: relative;
  z-index: 3;
}

.footer p {
  font-size: 0.95rem;
  letter-spacing: 0.5px;
   transition: color 0.3s ease;
}
.footer p:hover {
    color: var(--text-light);
}


/* --- Animations --- */
@keyframes overlayFadeIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(4px); }
}

@keyframes contentFadeIn {
  from { opacity: 0; transform: translateY(15px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) translateX(-50%); }
  50% { transform: translateY(-10px) translateX(-50%); }
}


/* --- Responsive Adjustments --- */
@media (max-width: 768px) {
  .content-block-inner {
    flex-direction: column;
    padding: 3rem 5%;
    text-align: center; /* Center text on mobile */
  }

  .block-text, .block-image {
    max-width: 95%;
    padding-right: 0;
    flex-basis: auto;
    transform: translateX(0); /* Reset transform base for column layout */
  }
    .block-text { order: 2; margin-top: 2rem; }
    .block-image { order: 1; }

  /* Adjust timeline line/dot position for smaller screens */
  .timeline-line { left: 8px; }
  .moment-entry { padding-left: 30px; }
  .moment-dot { left: -2px; width: 19px; height: 19px; border-width: 3px; }

   .moment-media {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* Smaller grid items */
   }
}

@media (max-width: 480px) {
  html { font-size: 15px; } /* Slightly smaller base font */

  .greeting-title { font-size: 2.2rem; }
  .greeting-text { font-size: 1rem; }

  .section-title { font-size: 1.8rem; margin-bottom: 3rem; }

  .moment-card-body, .moment-card-header { padding: 1rem; }
  .moment-text { font-size: 0.9rem; }
  .moment-date { font-size: 0.8rem; }
}

/* 添加圆形头像样式 */
.profile-image-container {
  width: clamp(150px, 10vw, 220px);
  height: clamp(150px, 10vw, 220px);
  margin: 0 auto 30px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: var(--shadow-medium);
  transition: transform 0.5s var(--easing);
  position: relative;
  z-index: 2;
}

.profile-image-container:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: var(--shadow-dark);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--easing);
}

.profile-image:hover {
  transform: scale(1.08);
}

/* 在小屏幕上调整头像大小 */
@media (max-width: 768px) {
  .profile-image-container {
    width: clamp(120px, 15vw, 180px);
    height: clamp(120px, 15vw, 180px);
    margin-bottom: 20px;
  }
}


</style>
