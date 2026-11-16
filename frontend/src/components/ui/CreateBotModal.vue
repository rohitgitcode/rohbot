<script setup lang="ts">
import { ref, watch } from 'vue'
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
const systemPrompt = ref(DEFAULT_SYSTEM_PROMPT)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isCreating = ref(false)
const errorMsg = ref('')

watch(() => props.isOpen, (open) => {
  if (open) {
    errorMsg.value = ''
    if (!systemPrompt.value.trim()) {
      systemPrompt.value = DEFAULT_SYSTEM_PROMPT
    }
  }
})

const resetToDefaultPrompt = () => {
  systemPrompt.value = DEFAULT_SYSTEM_PROMPT
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.csv', '.xlsx', '.md']

const isSupportedFile = (file: File) => {
  const name = file.name.toLowerCase()
  return SUPPORTED_EXTENSIONS.some(ext => name.endsWith(ext))
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    if (isSupportedFile(file)) {
      selectedFile.value = file
    } else {
      errorMsg.value = 'Supported formats: .pdf, .docx, .txt, .csv, .xlsx, .md'
    }
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (isSupportedFile(file)) {
      selectedFile.value = file
    } else {
      errorMsg.value = 'Supported formats: .pdf, .docx, .txt, .csv, .xlsx, .md'
    }
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
      systemPrompt: systemPrompt.value.trim() || DEFAULT_SYSTEM_PROMPT
    })

    if (newBotId) {
      if (selectedFile.value) {
        isCreating.value = true
        // Upload the document to the new bot
        const uploadSuccess = await chatStore.uploadDocument(selectedFile.value, newBotId)
        if (!uploadSuccess) {
          errorMsg.value = 'Workspace created, but failed to upload document.'
          return // Don't close modal if upload failed, so user can see it
        }
      }

      // Success reset
      botName.value = ''
      systemPrompt.value = DEFAULT_SYSTEM_PROMPT
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
              rows="6"
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
                accept=".pdf,.docx,.txt,.csv,.xlsx,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/markdown"
                class="hidden-input"
                @change="handleFileSelect"
              />

              <template v-if="!selectedFile">
                <p>Drag & drop a file here or click to browse</p>
                <span class="sub-format-hint">Supports PDF, DOCX, TXT, CSV, XLSX, MD</span>
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
  background: rgba(15, 23, 42, 0.6); /* Slate overlay */
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
  border-radius: 12px;
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
  overflow-y: auto;
  flex: 1;
}

.description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: var(--space-5);
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

  .filename {
    max-width: 160px;
  }
}

.form-group {
  margin-bottom: var(--space-4);
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

.optional {
  color: var(--text-muted);
  font-weight: 400;
  font-size: 0.8rem;
}

.textarea-field {
  resize: vertical;
  min-height: 120px;
  font-size: 0.85rem;
  line-height: 1.5;
  font-family: inherit;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.sub-format-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.8;
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
