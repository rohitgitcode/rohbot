<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from './stores/chatStore'
import Sidebar from './components/layout/Sidebar.vue'
import MainChat from './components/layout/MainChat.vue'
import KnowledgeBaseDrawer from './components/ui/KnowledgeBaseDrawer.vue'
import WidgetEmbedModal from './components/ui/WidgetEmbedModal.vue'
import LoginModal from './components/ui/LoginModal.vue'
import CreateBotModal from './components/ui/CreateBotModal.vue'
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
  if (chatStore.bots.length === 0) {
    isCreateModalOpen.value = true
  }
}

onMounted(async () => {
  if (chatStore.isAuthenticated) {
    await chatStore.fetchBots()
    await chatStore.fetchChatHistory()
    checkOnboarding()
  }
})

const handleLoginSuccess = async () => {
  isLoginModalOpen.value = false
  await chatStore.fetchBots()
  await chatStore.fetchChatHistory()
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
