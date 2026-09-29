<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useChatStore } from '../../stores/chatStore'
import { DEFAULT_SYSTEM_PROMPT } from '../../constants/prompts'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const chatStore = useChatStore()

const botName = ref('')
const systemPrompt = ref('')
const isSaving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const activeBot = computed(() => {
  return chatStore.bots.find(b => (b as any)._id === chatStore.activeBotId || (b as any).id === chatStore.activeBotId)
})

watch(() => props.isOpen, (open) => {
  if (open) {
    errorMsg.value = ''
    successMsg.value = ''
    if (activeBot.value) {
      botName.value = activeBot.value.name || ''
      systemPrompt.value = activeBot.value.systemPrompt || DEFAULT_SYSTEM_PROMPT
    } else {
      botName.value = ''
      systemPrompt.value = DEFAULT_SYSTEM_PROMPT
    }
  }
})

const resetToDefaultPrompt = () => {
  systemPrompt.value = DEFAULT_SYSTEM_PROMPT
}

const handleSave = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!botName.value.trim()) {
    errorMsg.value = 'Workspace Name is required.'
    return
  }

  if (!chatStore.activeBotId || chatStore.activeBotId === 'custom') {
    errorMsg.value = 'Please select a valid workspace to edit.'
    return
  }

  isSaving.value = true

  try {
    const success = await chatStore.updateBot(chatStore.activeBotId, {
      name: botName.value.trim(),
      systemPrompt: systemPrompt.value.trim() || DEFAULT_SYSTEM_PROMPT
    })

    if (success) {
      successMsg.value = 'Workspace updated successfully!'
      setTimeout(() => {
        emit('close')
      }, 600)
    } else {
      errorMsg.value = 'Failed to update workspace.'
    }
  } catch (e) {
    errorMsg.value = 'An error occurred while updating.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay fade-in" @click="$emit('close')">
      <div class="modal-card glass-panel" @click.stop>
        <div class="modal-header">
          <div class="header-title-wrap">
            <div class="header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <h2>Workspace Settings</h2>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="description">Customize this workspace's name and AI instructions for strictly grounded responses.</p>

          <div class="form-group">
            <label>Workspace Name</label>
            <input
              v-model="botName"
              type="text"
              class="input-field"
              placeholder="e.g. Finance Assistant"
            />
          </div>

          <div class="form-group">
            <div class="label-row">
              <label>System Prompt <span class="badge-guard">Anti-Hallucination Active</span></label>
              <button 
                type="button" 
                class="reset-btn" 
                @click="resetToDefaultPrompt" 
                title="Reset to recommended anti-hallucination prompt"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                Reset to Default
              </button>
            </div>
            <p class="field-hint">
              You can customize this prompt. It guides the AI to only answer from your uploaded documents and website links without hallucinating.
            </p>
            <textarea
              v-model="systemPrompt"
              class="input-field textarea-field"
              placeholder="Instruct the AI on how it should behave..."
              rows="7"
            ></textarea>
          </div>

          <div v-if="errorMsg" class="error-toast fade-in">{{ errorMsg }}</div>
          <div v-if="successMsg" class="success-toast fade-in">{{ successMsg }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('close')" :disabled="isSaving">Cancel</button>
          <button class="btn-primary" @click="handleSave" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-card {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  max-height: 90dvh;
  border-radius: 14px;
  background: var(--bg-panel);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden;
  border: 1px solid var(--border-light);
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
  flex-shrink: 0;
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.15);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
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
  overflow-y: auto;
  flex: 1;
}

.description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: var(--space-5);
  line-height: 1.4;
}

.form-group {
  margin-bottom: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.badge-guard {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.reset-btn {
  background: transparent;
  border: none;
  color: var(--accent-primary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.reset-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  text-decoration: underline;
}

.field-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.35;
  margin-bottom: 2px;
}

.textarea-field {
  resize: vertical;
  min-height: 140px;
  font-size: 0.85rem;
  line-height: 1.5;
  font-family: inherit;
}

.error-toast {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-error);
  padding: var(--space-3);
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin-top: var(--space-4);
  font-size: 0.85rem;
  text-align: center;
}

.success-toast {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: var(--space-3);
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  margin-top: var(--space-4);
  font-size: 0.85rem;
  text-align: center;
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 14px 14px;
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: var(--space-2);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }
}
</style>
