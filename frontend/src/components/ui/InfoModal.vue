<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import PricingTab from './info-modal/PricingTab.vue'
import IntegrationsTab from './info-modal/IntegrationsTab.vue'
import AboutTab from './info-modal/AboutTab.vue'
import CareersTab from './info-modal/CareersTab.vue'
import BlogTab from './info-modal/BlogTab.vue'
import ContactTab from './info-modal/ContactTab.vue'
import PrivacyTab from './info-modal/PrivacyTab.vue'
import TermsTab from './info-modal/TermsTab.vue'

export type InfoModalTab = 'integrations' | 'pricing' | 'about' | 'careers' | 'blog' | 'contact' | 'privacy' | 'terms'

const props = defineProps<{
  isOpen: boolean
  initialTab?: InfoModalTab
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-login', isLogin: boolean): void
  (e: 'scroll-to-features'): void
}>()

const currentTab = ref<InfoModalTab>(props.initialTab || 'pricing')

watch(() => props.initialTab, (newTab) => {
  if (newTab) {
    currentTab.value = newTab
  }
})

watch(() => props.isOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

const tabTitles: Record<InfoModalTab, string> = {
  integrations: 'Integrations & Ecosystem',
  pricing: 'Plans & Pricing',
  about: 'About RohBot AI',
  careers: 'Careers & Hiring',
  blog: 'Latest Engineering Updates',
  contact: 'Contact & Support',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service'
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop fade-in" @click.self="emit('close')">
    <div class="modal-container glass-panel">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-left">
          <div class="modal-badge">RohBot Hub</div>
          <h2>{{ tabTitles[currentTab] }}</h2>
        </div>
        <button class="close-btn" @click="emit('close')" aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button 
          :class="['tab-btn', { active: currentTab === 'pricing' }]"
          @click="currentTab = 'pricing'"
        >
          💎 Pricing
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'integrations' }]"
          @click="currentTab = 'integrations'"
        >
          🔌 Integrations
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'about' }]"
          @click="currentTab = 'about'"
        >
          🏢 About
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'careers' }]"
          @click="currentTab = 'careers'"
        >
          💼 Careers <span class="hiring-tag">Hiring</span>
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'blog' }]"
          @click="currentTab = 'blog'"
        >
          📰 Blog
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'contact' }]"
          @click="currentTab = 'contact'"
        >
          ✉️ Contact
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'privacy' }]"
          @click="currentTab = 'privacy'"
        >
          🔒 Privacy
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'terms' }]"
          @click="currentTab = 'terms'"
        >
          📜 Terms
        </button>
      </div>

      <!-- Modal Body (Modular Tab Views) -->
      <div class="modal-body custom-scrollbar">
        <PricingTab 
          v-if="currentTab === 'pricing'" 
          @open-login="emit('open-login', $event)" 
          @switch-tab="currentTab = ($event as InfoModalTab)" 
        />
        
        <IntegrationsTab 
          v-else-if="currentTab === 'integrations'" 
        />
        
        <AboutTab 
          v-else-if="currentTab === 'about'" 
          @open-login="emit('open-login', $event)" 
        />
        
        <CareersTab 
          v-else-if="currentTab === 'careers'" 
        />
        
        <BlogTab 
          v-else-if="currentTab === 'blog'" 
        />
        
        <ContactTab 
          v-else-if="currentTab === 'contact'" 
        />
        
        <PrivacyTab 
          v-else-if="currentTab === 'privacy'" 
        />
        
        <TermsTab 
          v-else-if="currentTab === 'terms'" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal-container {
  width: 100%;
  max-width: 860px;
  max-height: 88vh;
  background: var(--bg-panel);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScale {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: var(--space-6) var(--space-6) var(--space-4);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
}

.modal-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* Tabs Navigation */
.tabs-nav {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid var(--border-light);
  overflow-x: auto;
  white-space: nowrap;
}

.tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: var(--accent-primary);
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.3);
  font-weight: 600;
}

.hiring-tag {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-left: 2px;
}

/* Modal Body */
.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

@media (max-width: 768px) {
  .tabs-nav {
    padding: var(--space-2) var(--space-4);
  }
}
</style>
