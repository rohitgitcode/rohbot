<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useChatStore } from '../../stores/chatStore'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'finish'): void
}>()

const chatStore = useChatStore()

export interface TourStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  badge?: string
  icon?: string
}

const steps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to RohBot AI! 🚀',
    badge: 'Product Tour',
    description: 'Build custom AI Knowledge Engines trained on your own PDFs, documents, and websites. Let’s take a quick 1-minute interactive tour to explore your new workspace!',
    placement: 'center',
    icon: 'sparkles'
  },
  {
    id: 'workspace',
    title: 'Workspaces & Knowledge Engines',
    badge: 'Step 1 of 6',
    description: 'Manage distinct AI engines for different departments, products, or clients. Switch active bots or click the "+" button to launch a new workspace anytime.',
    targetSelector: '[data-tour="bot-switcher"]',
    placement: 'right',
    icon: 'cpu'
  },
  {
    id: 'threads',
    title: 'Conversations & History',
    badge: 'Step 2 of 6',
    description: 'Start fresh conversation threads with the "New Thread" button and seamlessly access past dialogues. You can also select and bulk-manage history.',
    targetSelector: '[data-tour="new-thread"]',
    placement: 'right',
    icon: 'message'
  },
  {
    id: 'upload',
    title: 'Upload Documents & Websites',
    badge: 'Step 3 of 6',
    description: 'Train your bot in seconds! Upload PDFs or ingest live webpage URLs. RohBot automatically extracts, chunks, and vector-indexes your proprietary data.',
    targetSelector: '[data-tour="upload-btn"]',
    placement: 'bottom',
    icon: 'upload'
  },
  {
    id: 'embed',
    title: 'Embed Chat Widget Anywhere',
    badge: 'Step 4 of 6',
    description: 'Take your bot to production! Generate customized script tags or iframe embeds to install RohBot onto your website, React app, Shopify, or WordPress.',
    targetSelector: '[data-tour="embed-btn"]',
    placement: 'bottom',
    icon: 'code'
  },
  {
    id: 'chat',
    title: 'RAG-Powered AI Chat',
    badge: 'Step 5 of 6',
    description: 'Ask anything in natural language. RohBot executes semantic vector search across your uploaded documents to deliver accurate, contextual answers with source citations.',
    targetSelector: '[data-tour="chat-input"]',
    placement: 'top',
    icon: 'zap'
  },
  {
    id: 'footer',
    title: 'Settings & Theme Personalization',
    badge: 'Step 6 of 6',
    description: 'Switch between sleek Dark and Light modes, manage account info, or re-open this interactive tour whenever you need a refresher!',
    targetSelector: '[data-tour="user-footer"]',
    placement: 'right',
    icon: 'sun'
  },
  {
    id: 'completed',
    title: 'You\'re Ready to Build! 🎉',
    badge: 'Tour Complete',
    description: 'You\'re all set to create your first knowledge engine. Upload a document or create a bot to start exploring the power of custom AI.',
    placement: 'center',
    icon: 'check'
  }
]

const currentStepIndex = ref(0)
const currentStep = computed<TourStep>(() => steps[currentStepIndex.value] || steps[0]!)
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)
const isFirstStep = computed(() => currentStepIndex.value === 0)

// Target rect for spotlight positioning
const targetRect = ref<{ top: number; left: number; width: number; height: number } | null>(null)
const popoverPosition = ref<{ top: number; left: number; arrowPlacement: string }>({ top: 0, left: 0, arrowPlacement: 'top' })

const updateTargetPosition = () => {
  if (!props.isOpen || !currentStep.value) return

  const selector = currentStep.value.targetSelector
  if (!selector) {
    targetRect.value = null
    return
  }

  const el = document.querySelector(selector) as HTMLElement
  if (!el) {
    targetRect.value = null
    return
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  const rect = el.getBoundingClientRect()
  const padding = 8

  targetRect.value = {
    top: Math.max(0, rect.top - padding),
    left: Math.max(0, rect.left - padding),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  }

  // Calculate Popover Position
  const popoverWidth = 380
  const popoverHeight = 220
  const margin = 16
  let top = 0
  let left = 0
  let arrowPlacement = 'top'

  const placement = currentStep.value.placement || 'bottom'

  if (placement === 'right') {
    left = rect.right + margin
    top = rect.top + rect.height / 2 - 100
    arrowPlacement = 'left'

    // Viewport overflow check
    if (left + popoverWidth > window.innerWidth) {
      left = Math.max(16, rect.left - popoverWidth - margin)
      arrowPlacement = 'right'
    }
  } else if (placement === 'bottom') {
    left = rect.left + rect.width / 2 - popoverWidth / 2
    top = rect.bottom + margin
    arrowPlacement = 'top'

    if (top + popoverHeight > window.innerHeight) {
      top = Math.max(16, rect.top - popoverHeight - margin)
      arrowPlacement = 'bottom'
    }
  } else if (placement === 'top') {
    left = rect.left + rect.width / 2 - popoverWidth / 2
    top = rect.top - popoverHeight - margin
    arrowPlacement = 'bottom'

    if (top < 16) {
      top = rect.bottom + margin
      arrowPlacement = 'top'
    }
  } else if (placement === 'left') {
    left = rect.left - popoverWidth - margin
    top = rect.top + rect.height / 2 - 100
    arrowPlacement = 'right'
  }

  // Horizontal clamping
  left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, left))
  top = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, top))

  popoverPosition.value = { top, left, arrowPlacement }
}

const nextStep = () => {
  if (isLastStep.value) {
    finishTour()
  } else {
    currentStepIndex.value++
  }
}

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

const goToStep = (index: number) => {
  if (index >= 0 && index < steps.length) {
    currentStepIndex.value = index
  }
}

const skipTour = () => {
  chatStore.completeTour()
  emit('close')
}

const finishTour = () => {
  chatStore.completeTour()
  emit('finish')
  emit('close')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.isOpen) return
  if (e.key === 'Escape') {
    skipTour()
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    nextStep()
  } else if (e.key === 'ArrowLeft') {
    prevStep()
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    currentStepIndex.value = 0
    nextTick(() => {
      updateTargetPosition()
    })
  }
})

watch(currentStepIndex, () => {
  nextTick(() => {
    updateTargetPosition()
  })
})

onMounted(() => {
  window.addEventListener('resize', updateTargetPosition)
  window.addEventListener('scroll', updateTargetPosition, true)
  window.addEventListener('keydown', handleKeydown)
  if (props.isOpen) {
    nextTick(updateTargetPosition)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateTargetPosition)
  window.removeEventListener('scroll', updateTargetPosition, true)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div v-if="isOpen" class="tour-backdrop fade-in">
    <!-- SVG Masked Spotlight Cutout -->
    <svg class="tour-spotlight-svg" width="100%" height="100%">
      <defs>
        <mask id="tour-spotlight-mask">
          <!-- White background covers whole screen (visible overlay) -->
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <!-- Black cutout exposes the target element (transparent hole) -->
          <rect
            v-if="targetRect"
            :x="targetRect.left"
            :y="targetRect.top"
            :width="targetRect.width"
            :height="targetRect.height"
            rx="12"
            ry="12"
            fill="black"
            class="spotlight-rect-transition"
          />
        </mask>
      </defs>
      <!-- Dark backdrop filled with the mask -->
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(10, 10, 15, 0.78)"
        mask="url(#tour-spotlight-mask)"
      />
    </svg>

    <!-- Glowing highlight outline around spotlight target -->
    <div
      v-if="targetRect"
      class="spotlight-highlight-ring"
      :style="{
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`
      }"
    >
      <div class="spotlight-pulse-border"></div>
    </div>

    <!-- Centered Modal for Step 0 (Welcome) and Step 7 (Complete) -->
    <div
      v-if="currentStep.placement === 'center'"
      class="tour-modal-card glass-panel modal-animate"
    >
      <div class="tour-modal-header">
        <div class="modal-icon-badge">
          <svg v-if="currentStep.icon === 'sparkles'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
          <svg v-else-if="currentStep.icon === 'check'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <span class="tour-step-badge">{{ currentStep.badge }}</span>
      </div>

      <h2 class="tour-modal-title">{{ currentStep.title }}</h2>
      <p class="tour-modal-desc">{{ currentStep.description }}</p>

      <div v-if="isFirstStep" class="welcome-highlights">
        <div class="highlight-item">
          <div class="hl-icon">📄</div>
          <div>
            <strong>Context-Aware RAG</strong>
            <p>Upload PDFs or URLs to train your AI instantly</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="hl-icon">⚡</div>
          <div>
            <strong>High-Performance Vector Search</strong>
            <p>Powered by Qdrant vector database and Gemini embeddings</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="hl-icon">🌐</div>
          <div>
            <strong>Instant Widget Embeds</strong>
            <p>Embed your AI assistant on any website in seconds</p>
          </div>
        </div>
      </div>

      <div v-if="isLastStep" class="completed-features">
        <div class="feature-chip">✨ Ready to deploy</div>
        <div class="feature-chip">📚 Documents vectorized</div>
        <div class="feature-chip">💬 Chat interface enabled</div>
      </div>

      <!-- Step dots -->
      <div class="tour-dots-wrapper">
        <span
          v-for="(_, idx) in steps"
          :key="idx"
          :class="['tour-dot', { active: idx === currentStepIndex }]"
          @click="goToStep(idx)"
        ></span>
      </div>

      <!-- Footer Buttons -->
      <div class="tour-modal-footer">
        <button v-if="isFirstStep" class="btn-ghost" @click="skipTour">
          Skip for Now
        </button>
        <button v-else-if="!isLastStep" class="btn-ghost" @click="prevStep">
          Back
        </button>

        <button
          v-if="isFirstStep"
          class="btn-primary start-tour-btn"
          @click="nextStep"
        >
          Start Interactive Tour <span>→</span>
        </button>
        <button
          v-else-if="isLastStep"
          class="btn-primary start-tour-btn"
          @click="finishTour"
        >
          Get Started with RohBot 🚀
        </button>
      </div>
    </div>

    <!-- Floating Popover Tooltip for Targeted Steps -->
    <div
      v-else
      class="tour-popover glass-panel popover-animate"
      :style="{
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`
      }"
    >
      <div class="popover-header">
        <div class="popover-header-left">
          <span class="tour-step-badge">{{ currentStep.badge }}</span>
          <h3 class="popover-title">{{ currentStep.title }}</h3>
        </div>
        <button class="popover-close-btn" @click="skipTour" title="Close tour (Esc)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="popover-body">
        <p class="popover-desc">{{ currentStep.description }}</p>
      </div>

      <!-- Progress bar -->
      <div class="popover-progress-bar">
        <div
          class="popover-progress-fill"
          :style="{ width: `${((currentStepIndex) / (steps.length - 1)) * 100}%` }"
        ></div>
      </div>

      <div class="popover-footer">
        <div class="popover-step-indicator">
          {{ currentStepIndex }} / {{ steps.length - 2 }}
        </div>

        <div class="popover-actions">
          <button
            class="btn-small btn-ghost"
            @click="prevStep"
            :disabled="currentStepIndex <= 0"
          >
            Back
          </button>
          <button
            class="btn-small btn-primary"
            @click="nextStep"
          >
            {{ isLastStep ? 'Finish' : 'Next →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tour-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: auto;
  overflow: hidden;
}

.tour-spotlight-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.spotlight-rect-transition {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.spotlight-highlight-ring {
  position: absolute;
  border-radius: 12px;
  pointer-events: none;
  z-index: 10000;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.spotlight-pulse-border {
  position: absolute;
  inset: -3px;
  border: 2px solid var(--accent-primary, #8b5cf6);
  border-radius: 14px;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 10px rgba(139, 92, 246, 0.2);
  animation: spotlightPulse 2s infinite ease-in-out;
}

@keyframes spotlightPulse {
  0%, 100% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.02);
  }
}

/* Centered Modal Card */
.tour-modal-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 520px;
  background: var(--bg-panel, #18181b);
  border: 1px solid var(--border-light, rgba(255, 255, 255, 0.12));
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.2);
  z-index: 10001;
  text-align: center;
}

.modal-animate {
  animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: translate(-50%, -46%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.tour-modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.25));
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: var(--accent-primary, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.2);
}

.tour-step-badge {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(139, 92, 246, 0.15);
  color: var(--accent-primary, #a78bfa);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.tour-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin-bottom: 12px;
  line-height: 1.3;
}

.tour-modal-desc {
  color: var(--text-secondary, #a1a1aa);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 24px;
}

.welcome-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-light, rgba(255, 255, 255, 0.06));
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.hl-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.highlight-item strong {
  display: block;
  font-size: 0.9rem;
  color: var(--text-primary, #fff);
  margin-bottom: 2px;
}

.highlight-item p {
  font-size: 0.8rem;
  color: var(--text-muted, #71717a);
  margin: 0;
}

.completed-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.feature-chip {
  padding: 6px 14px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tour-dots-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 24px;
}

.tour-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tour-dot.active {
  width: 24px;
  border-radius: 10px;
  background: var(--accent-primary, #8b5cf6);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.6);
}

.tour-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.start-tour-btn {
  flex: 1;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Floating Popover */
.tour-popover {
  position: absolute;
  width: 360px;
  background: var(--bg-panel, #18181b);
  border: 1px solid var(--border-light, rgba(255, 255, 255, 0.15));
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(139, 92, 246, 0.15);
  z-index: 10001;
  pointer-events: auto;
  transition: top 0.3s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.popover-animate {
  animation: popoverFade 0.25s ease-out;
}

@keyframes popoverFade {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.popover-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.popover-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.popover-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #71717a);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.popover-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #fff);
}

.popover-body {
  margin-bottom: 16px;
}

.popover-desc {
  font-size: 0.88rem;
  color: var(--text-secondary, #a1a1aa);
  line-height: 1.5;
  margin: 0;
}

.popover-progress-bar {
  height: 4px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 14px;
}

.popover-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  transition: width 0.3s ease;
}

.popover-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popover-step-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #71717a);
}

.popover-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-ghost {
  background: transparent;
  border: none;
  color: var(--text-muted, #a1a1aa);
  font-size: 0.85rem;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  color: var(--text-primary, #fff);
  background: rgba(255, 255, 255, 0.08);
}

.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-small {
  padding: 6px 14px;
  font-size: 0.82rem;
  border-radius: 6px;
}
</style>
