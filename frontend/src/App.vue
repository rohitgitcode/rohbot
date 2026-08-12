<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from './stores/chatStore'
import Sidebar from './components/layout/Sidebar.vue'
import MainChat from './components/layout/MainChat.vue'
import KnowledgeBaseDrawer from './components/ui/KnowledgeBaseDrawer.vue'
import LoginModal from './components/ui/LoginModal.vue'
import CreateBotModal from './components/ui/CreateBotModal.vue'

const chatStore = useChatStore()
const isUploadModalOpen = ref(false)
const isCreateModalOpen = ref(false)

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
  await chatStore.fetchBots()
  await chatStore.fetchChatHistory()
  checkOnboarding()
}
</script>

<template>
  <div class="app-layout">
    <template v-if="chatStore.isAuthenticated">
      <Sidebar @openCreate="isCreateModalOpen = true" />
      <MainChat @openUpload="isUploadModalOpen = true" />
      <KnowledgeBaseDrawer 
        :isOpen="isUploadModalOpen" 
        @close="isUploadModalOpen = false" 
      />
      <CreateBotModal 
        :isOpen="isCreateModalOpen" 
        @close="isCreateModalOpen = false" 
      />
    </template>
    
    <template v-else>
      <LoginModal @success="handleLoginSuccess" />
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
