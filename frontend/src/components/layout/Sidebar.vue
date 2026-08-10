<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '../../stores/chatStore'
const chatStore = useChatStore()
const isCustomBotInputOpen = ref(false)
const customBotId = ref('')

const emit = defineEmits<{
  (e: 'openCreate'): void
}>()

const handleSelectBot = (botId: string) => {
  chatStore.setActiveBot(botId)
  isCustomBotInputOpen.value = false
}

const handleSetCustomBot = () => {
  if (customBotId.value.trim()) {
    chatStore.setActiveBot(customBotId.value.trim())
    isCustomBotInputOpen.value = false
    customBotId.value = ''
  }
}
</script>

<template>
  <aside class="sidebar glass-panel">
    <!-- Brand Header -->
    <div class="brand-header">
      <div class="logo">
        <div class="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        </div>
        <h1>RohBot</h1>
      </div>
    </div>

    <!-- Bot Switcher -->
    <div class="bot-switcher">
      <div class="bot-switcher-header">
        <label>Workspace</label>
        <button @click="$emit('openCreate')" class="add-bot-btn" title="Create Workspace">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      <div class="custom-select">
        <select 
          :value="chatStore.activeBotId" 
          @change="chatStore.setActiveBot(($event.target as HTMLSelectElement).value)"
          class="input-field select-field"
        >
          <option v-for="bot in chatStore.bots" :key="bot._id" :value="bot._id">
            {{ bot.name }}
          </option>
          <option value="custom">Connect Custom Engine...</option>
        </select>
      </div>

      <!-- Custom Bot ID Input -->
      <div v-if="chatStore.activeBotId === 'custom' || isCustomBotInputOpen" class="custom-bot-input fade-in">
        <input 
          v-model="customBotId" 
          type="text" 
          placeholder="Engine ID" 
          class="input-field"
          @keyup.enter="handleSetCustomBot"
        />
        <button @click="handleSetCustomBot" class="btn-secondary btn-small">Link</button>
      </div>
    </div>

    <!-- New Chat Button -->
    <button @click="chatStore.startNewChat" class="btn-primary new-chat-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      New Thread
    </button>

    <!-- Chat History -->
    <div class="chat-history">
      <h3 class="history-title">Recent Activity</h3>
      <div class="history-list">
        <div v-if="chatStore.chatHistory.length === 0" class="empty-history">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 8 12 12 16 14"></polyline>
          </svg>
          <p>No recent activity</p>
        </div>
        
        <div 
          v-for="chat in chatStore.chatHistory" 
          :key="chat.id"
          class="history-item"
          :class="{ active: chat.id === chatStore.currentChatId }"
          @click="chatStore.loadChat(chat.id)"
        >
          <svg class="chat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="chat-title">{{ chat.title || 'New Conversation' }}</span>
        </div>
      </div>
    </div>

    <!-- User Profile Footer -->
    <div class="user-footer">
      <div class="user-info">
        <div class="avatar user-avatar">
          <span class="user-monogram">D</span>
        </div>
        <div class="user-details">
          <span class="user-name">Developer</span>
          <span class="user-role">Workspace Admin</span>
        </div>
      </div>
      <button @click="chatStore.logout" class="logout-btn" title="Sign Out">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
    
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 280px;
  height: 100vh;
  border-right: 1px solid var(--border-light);
  background: var(--bg-panel);
  padding: var(--space-4);
  box-shadow: 2px 0 10px rgba(0,0,0,0.2);
  z-index: 20;
}

.brand-header {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-light);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: var(--accent-primary);
  color: #111;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.logo h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

.bot-switcher {
  margin-bottom: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bot-switcher label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bot-switcher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-bot-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.add-bot-btn:hover {
  background: var(--bg-panel-light);
  color: var(--text-primary);
}

.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
  cursor: pointer;
  background-color: var(--bg-dark);
}

.custom-bot-input {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.btn-small {
  padding: 0 var(--space-3);
  font-size: 0.85rem;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  margin-bottom: var(--space-6);
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.history-title {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  padding: 0 var(--space-2);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: var(--space-6) 0;
  opacity: 0.7;
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 8px var(--space-3);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.history-item:hover {
  background: var(--bg-panel-light);
  color: var(--text-primary);
}

.history-item.active {
  background: var(--bg-panel-light);
  color: var(--text-primary);
  box-shadow: inset 2px 0 0 var(--accent-primary);
}

.chat-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-footer {
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  background: var(--accent-primary);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.user-monogram {
  font-weight: 700;
  font-size: 0.95rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.logout-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: var(--bg-panel-light);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
</style>
