<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useChatStore } from '../../stores/chatStore'
import MessageBubble from '../chat/MessageBubble.vue'

const chatStore = useChatStore()
const emit = defineEmits<{
  (e: 'openUpload'): void
  (e: 'openEmbed'): void
}>()

const activeBotName = computed(() => {
  const bot = chatStore.bots.find(b => b.id === chatStore.activeBotId)
  return bot ? bot.name : 'Custom Workspace'
})

const messageInput = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const chatContainerRef = ref<HTMLElement | null>(null)

// Auto-expand textarea
const handleInput = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 150) + 'px'
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const sendMessage = () => {
  if (!messageInput.value.trim() || chatStore.isLoading) return
  chatStore.sendMessage(messageInput.value)
  messageInput.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

// Auto-scroll to bottom
const scrollToBottom = () => {
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

watch(() => chatStore.currentMessages.length, () => {
  nextTick(scrollToBottom)
})
</script>

<template>
  <main class="main-chat">
    <!-- Header -->
    <header class="chat-header">
      <div class="header-info">
        <h2 class="bot-name">{{ activeBotName }}</h2>
        <div class="status-badges">
          <span class="badge badge-outline">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            RAG Active
          </span>
          <span class="badge badge-solid">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            Qdrant
          </span>
        </div>
      </div>
      
      <div class="header-actions">
        <button @click="$emit('openEmbed')" class="btn-secondary embed-btn" style="margin-right: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          Embed Widget
        </button>
        <button @click="$emit('openUpload')" class="btn-secondary upload-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Upload Document
        </button>
      </div>
    </header>

    <!-- Chat Container -->
    <div class="chat-container" ref="chatContainerRef">
      <div v-if="chatStore.currentMessages.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
            <line x1="20" y1="9" x2="23" y2="9"></line>
            <line x1="20" y1="14" x2="23" y2="14"></line>
            <line x1="1" y1="9" x2="4" y2="9"></line>
            <line x1="1" y1="14" x2="4" y2="14"></line>
          </svg>
        </div>
        <h3>Workspace Ready</h3>
        <p>The AI is connected and ready. Ask a question or provide context to begin.</p>
      </div>
      
      <div class="messages-list">
        <MessageBubble 
          v-for="(msg, idx) in chatStore.currentMessages" 
          :key="msg.id || idx" 
          :message="msg" 
        />
      </div>
    </div>

    <!-- Input Dock -->
    <div class="input-dock-container">
      <div class="input-wrapper" :class="{ 'is-focused': true }">
        <button class="attachment-btn" @click="$emit('openUpload')" title="Upload Context Document">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>
        
        <textarea 
          ref="textareaRef"
          v-model="messageInput"
          placeholder="Message RohBot..."
          @input="handleInput"
          @keydown="handleKeydown"
          class="chat-input"
          rows="1"
          :disabled="chatStore.isLoading"
        ></textarea>
        
        <button 
          class="send-btn" 
          :class="{ 'is-active': messageInput.trim() && !chatStore.isLoading }"
          @click="sendMessage"
          :disabled="!messageInput.trim() || chatStore.isLoading"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="dock-footer">
        RohBot AI can make mistakes. Consider verifying important information.
      </div>
    </div>
  </main>
</template>

<style scoped>
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  background: var(--bg-dark);
}

/* Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-dark);
  z-index: 10;
}

.header-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.bot-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.status-badges {
  display: flex;
  gap: var(--space-2);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-outline {
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
}

.badge-solid {
  background: var(--bg-panel-light);
  color: var(--text-secondary);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.85rem;
}

/* Chat Container */
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.messages-list {
  width: 100%;
  max-width: 900px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  text-align: center;
  width: 100%;
  max-width: 900px;
}

.empty-icon {
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  font-size: 1.5rem;
}

.empty-state p {
  max-width: 400px;
  font-size: 0.95rem;
}

.messages-list {
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
}

/* Input Dock */
.input-dock-container {
  padding: 0 var(--space-4) var(--space-4);
  background: linear-gradient(to top, var(--bg-dark) 60%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-wrapper {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  background: var(--bg-panel);
  border-radius: 12px;
  padding: var(--space-2);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.input-wrapper:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 1px var(--accent-primary), var(--shadow-lg);
}

.attachment-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: var(--space-2);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.attachment-btn:hover {
  color: var(--text-primary);
  background: var(--bg-panel-light);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  padding: var(--space-2) 0;
  resize: none;
  outline: none;
  max-height: 200px;
  min-height: 24px;
  line-height: 1.5;
}

.chat-input::placeholder {
  color: var(--text-muted);
}

.send-btn {
  background: var(--bg-panel-light);
  border: none;
  color: var(--text-muted);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: not-allowed;
  transition: all var(--transition-fast);
}

.send-btn.is-active {
  background: var(--text-primary);
  color: var(--bg-dark);
  cursor: pointer;
}

.send-btn.is-active:hover {
  background: var(--accent-primary);
}

.dock-footer {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: var(--space-3);
}
</style>
