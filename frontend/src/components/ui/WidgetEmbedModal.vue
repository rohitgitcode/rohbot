<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '../../stores/chatStore'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const chatStore = useChatStore()
const isCopied = ref(false)

const embedCode = computed(() => {
  const botId = chatStore.activeBotId
  if (!botId) return '<!-- Please select a workspace first -->'
  
  // Assuming the backend is hosted at the same origin or a known domain
  // For local development, hardcode or use env variable. 
  // We will use window.location.origin as a fallback if the backend URL isn't configured,
  // but usually it is process.env.VITE_API_URL or similar.
  const backendUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
  
  return `<!-- RohBot AI Embed Code -->
<script 
  src="${backendUrl}/widget.js" 
  data-bot-id="${botId}" 
  defer>
<\/script>`
})

const copySnippet = () => {
  navigator.clipboard.writeText(embedCode.value)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay fade-in" @click="$emit('close')">
      <div class="modal-card glass-panel" @click.stop>
        <div class="modal-header">
          <h2>Embed Widget</h2>
          <button class="close-btn" @click="$emit('close')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="description">
            Copy and paste this snippet into the <code>&lt;head&gt;</code> or just before the closing <code>&lt;/body&gt;</code> tag of your website to add the floating chatbot widget.
          </p>
          
          <div class="code-preview">
            <pre><code>{{ embedCode }}</code></pre>
            <button class="copy-btn" @click="copySnippet" :class="{ copied: isCopied }">
              <svg v-if="!isCopied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {{ isCopied ? 'Copied to clipboard!' : 'Copy Snippet Code' }}
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary w-full" @click="$emit('close')">Done</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6); /* Slate overlay */
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  background: var(--bg-panel);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--bg-panel-light);
}

.modal-body {
  padding: var(--space-6);
}

.description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: var(--space-4);
  line-height: 1.5;
}

.description code {
  background: var(--bg-dark);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: var(--text-primary);
}

.code-preview {
  background: var(--bg-dark);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  overflow: hidden;
}

.code-preview pre {
  margin: 0;
  padding: var(--space-4);
  overflow-x: auto;
  font-size: 0.85rem;
  color: #a5b4fc; /* light indigo */
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.copy-btn {
  width: 100%;
  padding: var(--space-3);
  background: var(--bg-panel-light);
  border: none;
  border-top: 1px solid var(--border-strong);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--transition-fast);
}

.copy-btn:hover {
  background: var(--accent-primary);
  color: var(--bg-dark);
}

.copy-btn.copied {
  background: var(--accent-success);
  color: white;
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-light);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 12px 12px;
}

.w-full {
  width: 100%;
  padding: 10px;
}
</style>
