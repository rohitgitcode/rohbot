<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from './stores/chatStore'
import Sidebar from './components/layout/Sidebar.vue'
import MainChat from './components/layout/MainChat.vue'
import KnowledgeBaseDrawer from './components/ui/KnowledgeBaseDrawer.vue'
import WidgetEmbedModal from './components/ui/WidgetEmbedModal.vue'
import LoginModal from './components/ui/LoginModal.vue'
import CreateBotModal from './components/ui/CreateBotModal.vue'
import EditBotModal from './components/ui/EditBotModal.vue'
import ProductTour from './components/ui/ProductTour.vue'
import HomePage from './components/layout/HomePage.vue'
import { useTheme } from './composables/useTheme'

const chatStore = useChatStore()
const { isDark } = useTheme() // Initializes theme on mount

const isUploadModalOpen = ref(false)
const isEmbedModalOpen = ref(false)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isLoginModalOpen = ref(false)
const loginMode = ref(true)

const checkOnboarding = () => {
  if (chatStore.isTourOpen) return
  if (chatStore.bots.length === 0) {
    isCreateModalOpen.value = true
  }
}

const shouldShowTour = () => {
  const uid = chatStore.currentUser?.id || chatStore.currentUser?._id
  const localCompleted = uid
    ? localStorage.getItem(`rohbot_tour_completed_${uid}`)
    : localStorage.getItem('rohbot_tour_completed')
  
  if (localCompleted === 'true') return false
  if (chatStore.currentUser && chatStore.currentUser.hasCompletedTour) return false
  return true
}

onMounted(async () => {
  if (chatStore.isAuthenticated) {
    await chatStore.fetchCurrentUser()
    await chatStore.fetchBots()
    await chatStore.fetchChatHistory()

    if (shouldShowTour()) {
      chatStore.startTour()
    } else {
      checkOnboarding()
    }
  }
})

const handleLoginSuccess = async (meta?: { isNewUser?: boolean }) => {
  isLoginModalOpen.value = false
  await chatStore.fetchCurrentUser()
  await chatStore.fetchBots()
  await chatStore.fetchChatHistory()

  if (meta?.isNewUser || shouldShowTour()) {
    chatStore.startTour()
  } else {
    checkOnboarding()
  }
}

const handleTourFinish = () => {
  chatStore.completeTour()
  checkOnboarding()
}

const handleTourClose = () => {
  chatStore.closeTour()
  checkOnboarding()
}

const openLogin = (isLogin: boolean) => {
  loginMode.value = isLogin
  isLoginModalOpen.value = true
}

const enterDemo = () => {
  chatStore.enterDemoMode()
}

const exitDemo = () => {
  chatStore.exitDemoMode()
}
</script>

<template>
  <div class="app-layout">
    <template v-if="chatStore.isAuthenticated">
      <!-- Mobile sidebar backdrop -->
      <div 
        v-if="chatStore.isMobileSidebarOpen" 
        class="sidebar-backdrop fade-in"
        @click="chatStore.closeSidebar"
        aria-hidden="true"
      ></div>

      <Sidebar 
        @openCreate="isCreateModalOpen = true" 
        @openEdit="isEditModalOpen = true"
      />
      <MainChat 
        @openUpload="isUploadModalOpen = true" 
        @openEmbed="isEmbedModalOpen = true" 
        @openEdit="isEditModalOpen = true"
      />
      <KnowledgeBaseDrawer 
        :isOpen="isUploadModalOpen" 
        @close="isUploadModalOpen = false" 
      />
      <WidgetEmbedModal 
        :isOpen="isEmbedModalOpen" 
        @close="isEmbedModalOpen = false" 
      />
      <CreateBotModal 
        :isOpen="isCreateModalOpen" 
        @close="isCreateModalOpen = false" 
      />
      <EditBotModal
        :isOpen="isEditModalOpen"
        @close="isEditModalOpen = false"
      />
      <ProductTour
        :isOpen="chatStore.isTourOpen"
        @close="handleTourClose"
        @finish="handleTourFinish"
      />
    </template>

    <template v-else-if="chatStore.isDemoMode">
      <!-- Demo Mode Banner -->
      <div class="demo-banner">
        <div class="demo-banner-content">
          <span class="demo-badge">🎯 Demo Mode</span>
          <span class="demo-text">You're exploring RohBot with sample data</span>
        </div>
        <div class="demo-banner-actions">
          <button class="btn-primary btn-sm" @click="exitDemo(); openLogin(false)">Sign Up Free</button>
          <button class="btn-ghost btn-sm" @click="exitDemo">✕ Exit Demo</button>
        </div>
      </div>

      <!-- Mobile sidebar backdrop -->
      <div 
        v-if="chatStore.isMobileSidebarOpen" 
        class="sidebar-backdrop fade-in"
        @click="chatStore.closeSidebar"
        aria-hidden="true"
      ></div>

      <Sidebar />
      <MainChat :isDemoMode="true" />
    </template>
    
    <template v-else>
      <HomePage v-if="!isLoginModalOpen" @open-login="openLogin" @view-demo="enterDemo" />
      <LoginModal 
        v-else 
        :initial-mode="loginMode"
        @success="handleLoginSuccess" 
        @close="isLoginModalOpen = false"
      />
    </template>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-dark);
  position: relative;
}

.demo-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  z-index: 200;
  color: white;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.demo-banner-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.demo-badge {
  background: rgba(255,255,255,0.2);
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8rem;
}

.demo-text {
  font-weight: 500;
}

.demo-banner-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-sm {
  padding: 4px 14px;
  font-size: 0.8rem;
  border-radius: 6px;
}

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: rgba(255,255,255,0.15);
  border-color: white;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: 45;
  }

  .demo-banner {
    flex-direction: column;
    height: auto;
    padding: 6px var(--space-3);
    gap: 4px;
  }

  .demo-text {
    display: none;
  }
}
</style>
