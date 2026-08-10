<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChatStore } from '../../stores/chatStore'
import type { ChatMessage } from '../../stores/chatStore'

const props = defineProps<{
  message: ChatMessage
}>()

const chatStore = useChatStore()
const isUser = computed(() => props.message.role === 'user')
const isError = computed(() => props.message.isError)

const formattedContent = computed(() => {
  let content = props.message.content
  
  if (content === '...') {
    return '<span class="typing-indicator">Generating response</span>'
  }
  
  if (isError.value) {
    return content // don't parse markdown for error msg
  }
  
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  content = content.replace(/`([^`]+)`/g, '<code>$1</code>')
  content = content.replace(/\n/g, '<br/>')
  
  return content
})

const showCopyTooltip = ref(false)
const showAddTooltip = ref(false)
const showRetryTooltip = ref(false)

const copyMessage = () => {
  navigator.clipboard.writeText(props.message.content)
  showCopyTooltip.value = true
  setTimeout(() => showCopyTooltip.value = false, 2000)
}

const retryMessage = () => {
  // Find the last user message and resend it
  const messages = chatStore.currentMessages
  const idx = messages.findIndex(m => m.id === props.message.id)
  let lastUserMsg = ''
  for (let i = idx - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      lastUserMsg = messages[i].content
      break
    }
  }
  if (lastUserMsg) {
    chatStore.sendMessage(lastUserMsg)
  }
}
</script>

<template>
  <div class="message-wrapper" :class="{ 'is-user': isUser }">
    <!-- Avatar -->
    <div class="message-avatar" :class="{ 'ai-avatar': !isUser, 'user-avatar': isUser }">
      <template v-if="isUser">
        <!-- Colored circular monogram for User -->
        <span class="user-monogram">D</span>
      </template>
      <template v-else>
        <!-- Custom Brand Monogram -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <path d="M12 8v8"></path>
          <path d="M8 12h8"></path>
        </svg>
      </template>
    </div>

    <!-- Bubble -->
    <div class="message-content">
      <div class="bubble fade-in" :class="{ 'is-error': isError }">
        <div class="bubble-inner-wrapper">
          <svg v-if="isError" class="error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div class="bubble-inner" v-html="formattedContent"></div>
          
          <button v-if="isError" @click="retryMessage" class="inline-retry-btn" title="Retry">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
        </div>
        
        <!-- RAG Badge indicator -->
        <div v-if="message.hasContext && !isError" class="rag-badge fade-in">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ✨ Grounded with KB
        </div>
      </div>
      
      <!-- Actions Toolbar -->
      <div class="message-actions" v-if="!isUser && message.content !== '...' && !isError">
        <div class="action-toolbar">
          <div class="action-group">
            <button class="action-btn" @click="copyMessage" @mouseenter="showCopyTooltip = true" @mouseleave="showCopyTooltip = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <span class="tooltip" :class="{ 'show': showCopyTooltip }">Copy</span>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="action-group">
            <button class="action-btn" @mouseenter="showAddTooltip = true" @mouseleave="showAddTooltip = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <span class="tooltip" :class="{ 'show': showAddTooltip }">Save to notes</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-wrapper {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  max-width: 90%;
}

.message-wrapper.is-user {
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar {
  background: var(--accent-primary);
  color: #111;
  box-shadow: var(--shadow-sm);
}

.user-monogram {
  font-weight: 700;
  font-size: 0.95rem;
}

.ai-avatar {
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  border-radius: 8px; /* Slight square for AI vs circle for User */
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.is-user .message-content {
  align-items: flex-end;
}

.bubble {
  padding: var(--space-3) var(--space-4);
  font-size: 0.95rem;
  line-height: 1.7;
}

.is-user .bubble {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  border-radius: 12px 12px 0 12px;
  color: #ffffff;
  border: none;
  box-shadow: var(--shadow-sm);
}

.message-wrapper:not(.is-user) .bubble {
  background: #ffffff;
  border-radius: 0 12px 12px 12px;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  box-shadow: var(--shadow-md);
}

.message-wrapper:not(.is-user) .bubble.is-error {
  border-left-color: var(--accent-error);
  background: rgba(239, 68, 68, 0.05);
}

.bubble-inner-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.error-icon {
  color: var(--accent-error);
  margin-top: 4px;
  flex-shrink: 0;
}

.inline-retry-btn {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-muted);
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  transition: all var(--transition-fast);
}

.inline-retry-btn:hover {
  background: var(--bg-panel-light);
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.bubble-inner {
  flex: 1;
}

.bubble-inner :deep(p) {
  margin-bottom: 0.5rem;
}
.bubble-inner :deep(p:last-child) {
  margin-bottom: 0;
}

.bubble-inner :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.bubble-inner :deep(pre) {
  background: var(--bg-dark);
  padding: var(--space-3);
  border-radius: 6px;
  overflow-x: auto;
  margin: var(--space-3) 0;
  border: 1px solid var(--border-strong);
}

.bubble-inner :deep(code) {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--accent-primary);
}

.bubble-inner :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.rag-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: 4px 10px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--accent-primary);
  font-weight: 600;
}

/* Actions Toolbar */
.message-actions {
  opacity: 0;
  transition: opacity var(--transition-normal);
  margin-top: 4px;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.action-toolbar {
  display: inline-flex;
  align-items: center;
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 20px;
  padding: 2px;
  box-shadow: var(--shadow-sm);
}

.action-group {
  position: relative;
  display: flex;
}

.toolbar-divider {
  width: 1px;
  height: 14px;
  background: var(--border-strong);
  margin: 0 4px;
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-panel-light);
  color: var(--text-primary);
}

/* Tooltips */
.tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: var(--bg-dark);
  color: var(--text-secondary);
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-strong);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10;
}

.tooltip.show {
  opacity: 1;
}
</style>
