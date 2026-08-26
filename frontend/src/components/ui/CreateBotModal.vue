<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '../../stores/chatStore'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const chatStore = useChatStore()

const botName = ref('')
const systemPrompt = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isCreating = ref(false)
const errorMsg = ref('')

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      selectedFile.value = file
    } else {
      errorMsg.value = 'Only PDF files are currently supported.'
    }
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleCreate = async () => {
  errorMsg.value = ''
  if (!botName.value.trim()) {
    errorMsg.value = 'Workspace Name is required.'
    return
  }

  isCreating.value = true
  try {
    const newBotId = await chatStore.createBot({
      name: botName.value.trim(),
      systemPrompt: systemPrompt.value.trim()
    })
  if (newBotId) {
      if (selectedFile.value) {
        isCreating.value = true
        // Upload the PDF to the new bot
        const uploadSuccess = await chatStore.uploadPdf(selectedFile.value, newBotId)
        if (!uploadSuccess) {
          errorMsg.value = 'Workspace created, but failed to upload document.'
          return // Don't close modal if upload failed, so user can see it
        }
      }
      // Success reset
      botName.value = ''
      systemPrompt.value = ''
      selectedFile.value = null
      emit('close')
    } else {
      errorMsg.value = 'Failed to create workspace.'
    }
  } catch (e) {
    errorMsg.value = 'An error occurred during creation.'
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay fade-in" @click="$emit('close')">
      <div class="modal-card glass-panel" @click.stop>
        <div class="modal-header">
          <h2>Create Workspace</h2>
          <button class="close-btn" @click="$emit('close')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="description">Configure a new AI workspace with custom instructions.</p>

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
            <label>System Prompt <span class="optional">(Optional)</span></label>
            <textarea
              v-model="systemPrompt"
              class="input-field textarea-field"
              placeholder="Instruct the AI on how it should behave..."
              rows="3"
            ></textarea>
          </div>

          <!-- Dropzone -->
          <div class="form-group">
            <label>Initial Knowledge Base <span class="optional">(Optional)</span></label>
            <div
              class="dropzone"
              :class="{ 'is-dragging': isDragging, 'has-file': selectedFile }"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
              @click="!selectedFile && fileInput?.click()"
            >
              <input
                type="file"
                ref="fileInput"
                accept="application/pdf"
                class="hidden-input"
                @change="handleFileSelect"
              />

              <template v-if="!selectedFile">
                <p>Drag & drop a PDF here or click to browse</p>
              </template>

              <template v-else>
                <div class="file-info">
                  <span class="filename">{{ selectedFile.name }}</span>
                  <button @click.stop="selectedFile = null" class="remove-file-btn">Remove</button>
                </div>
              </template>
            </div>
          </div>

          <div v-if="errorMsg" class="error-toast fade-in">{{ errorMsg }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('close')" :disabled="isCreating">Cancel</button>
          <button class="btn-primary" @click="handleCreate" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create Workspace' }}
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
  background: rgba(15, 23, 42, 0.4); /* Slate overlay */
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  width: 100%;
  max-width: 450px;
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
  margin-bottom: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.optional {
  color: var(--text-muted);
  font-weight: 400;
  font-size: 0.8rem;
}

.textarea-field {
  resize: vertical;
  min-height: 60px;
}

.dropzone {
  border: 2px dashed var(--border-strong);
  border-radius: 8px;
  padding: var(--space-4);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-panel-light);
  color: var(--text-muted);
  font-size: 0.9rem;
}

.dropzone:hover, .dropzone.is-dragging {
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.05); /* Soft indigo tint */
  color: var(--accent-primary);
}

.dropzone.has-file {
  border-style: solid;
  border-color: var(--border-strong);
  background: var(--bg-panel);
  cursor: default;
}

.hidden-input {
  display: none;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filename {
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.remove-file-btn {
  background: transparent;
  border: none;
  color: var(--accent-error);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
}

.error-toast {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-error);
  padding: var(--space-3);
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin-top: var(--space-4);
  font-size: 0.9rem;
  text-align: center;
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 12px 12px;
}
</style>
