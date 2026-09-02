<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from './stores/chatStore'
import Sidebar from './components/layout/Sidebar.vue'
import MainChat from './components/layout/MainChat.vue'
import KnowledgeBaseDrawer from './components/ui/KnowledgeBaseDrawer.vue'
import WidgetEmbedModal from './components/ui/WidgetEmbedModal.vue'
import LoginModal from './components/ui/LoginModal.vue'
import CreateBotModal from './components/ui/CreateBotModal.vue'
import ProductTour from './components/ui/ProductTour.vue'
import HomePage from './components/layout/HomePage.vue'
import { useTheme } from './composables/useTheme'

const chatStore = useChatStore()
const { isDark } = useTheme() // Initializes theme on mount

const isUploadModalOpen = ref(false)
const isEmbedModalOpen = ref(false)
const isCreateModalOpen = ref(false)
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
</script>

<template>
  <div class="app-layout">
    <template v-if="chatStore.isAuthenticated">
      <Sidebar @openCreate="isCreateModalOpen = true" />
      <MainChat 
        @openUpload="isUploadModalOpen = true" 
        @openEmbed="isEmbedModalOpen = true" 
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
      <ProductTour
        :isOpen="chatStore.isTourOpen"
        @close="handleTourClose"
        @finish="handleTourFinish"
      />
    </template>
    
    <template v-else>
      <HomePage v-if="!isLoginModalOpen" @open-login="openLogin" />
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
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-dark);
}
</style>
