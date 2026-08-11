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

const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadSuccess = ref(false)
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
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    validateAndSetFile(e.dataTransfer.files[0])
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    validateAndSetFile(target.files[0])
  }
}

const validateAndSetFile = (file: File) => {
  errorMsg.value = ''
  if (file.type !== 'application/pdf') {
    errorMsg.value = 'Only PDF files are supported.'
    return
  }
  if (file.size > 10 * 1024 * 1024) { // 10MB limit for demo
    errorMsg.value = 'File size must be under 10MB.'
    return
  }
  selectedFile.value = file
}

const handleDelete = async (docId: string) => {
  if (!confirm('Are you sure you want to delete this document and its vectors?')) return
  const botId = chatStore.activeBotId
  if (!botId) return
  
  await chatStore.deleteDocument(docId, botId)
}

const resetState = () => {
  selectedFile.value = null
  isUploading.value = false
  uploadProgress.value = 0
  uploadSuccess.value = false
  errorMsg.value = ''
}

const handleClose = () => {
  resetState()
  emit('close')
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  
  const botId = chatStore.activeBotId
  if (!botId) {
    errorMsg.value = 'Please select a Workspace first.'
    return
  }
  
  isUploading.value = true
  errorMsg.value = ''
  uploadProgress.value = 10
  
  // Simulate progress bar while API is called
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 300)

  try {
    const success = await chatStore.uploadPdf(selectedFile.value, botId)
    clearInterval(progressInterval)
    
    if (success) {
      uploadProgress.value = 100
      uploadSuccess.value = true
      setTimeout(() => {
        resetState()
      }, 2000)
    } else {
      throw new Error('Upload failed')
    }
  } catch (e) {
    clearInterval(progressInterval)
    errorMsg.value = 'Failed to upload and embed document.'
    isUploading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay fade-in" @click="handleClose">
      <div class="modal-drawer glass-panel" @click.stop>
        <div class="modal-header">
          <h2>Knowledge Ingestion</h2>
          <button class="close-btn" @click="handleClose">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="description">Manage and expand the knowledge base for the active workspace.</p>

          <div class="documents-section">
            <h3 class="section-title">Uploaded Knowledge Documents</h3>
            <div v-if="chatStore.documents.length === 0" class="empty-docs">
              No documents uploaded yet.
            </div>
            <div v-else class="document-list">
              <div v-for="doc in chatStore.documents" :key="doc._id" class="document-item">
                <div class="doc-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <div class="doc-details">
                  <span class="doc-filename">{{ doc.filename }}</span>
                  <span class="doc-meta">{{ (doc.size || 0) > 0 ? (doc.size / 1024 / 1024).toFixed(2) + ' MB • ' : '' }}{{ doc.chunkCount }} chunks</span>
                </div>
                <button class="delete-doc-btn" @click="handleDelete(doc._id)" title="Delete Document">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <template v-if="!uploadSuccess">
            <!-- Dropzone -->
            <div 
              class="dropzone"
              :class="{ 'is-dragging': isDragging, 'has-file': selectedFile }"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
              @click="!selectedFile && ($refs.fileInput as any).click()"
            >
              <input 
                type="file" 
                ref="fileInput" 
                accept="application/pdf" 
                class="hidden-input"
                @change="handleFileSelect"
              />
              
              <template v-if="!selectedFile">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drop-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <p>Drag & drop a PDF here</p>
                <p class="sub-text">or click to browse</p>
              </template>
              
              <template v-else>
                <div class="file-info">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span class="filename">{{ selectedFile.name }}</span>
                  <span class="filesize">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</span>
                  <button v-if="!isUploading" @click.stop="selectedFile = null" class="remove-file-btn">Remove</button>
                </div>
              </template>
            </div>

            <div v-if="errorMsg" class="error-toast">{{ errorMsg }}</div>

            <!-- Upload Progress -->
            <div v-if="isUploading" class="upload-progress fade-in">
              <div class="progress-info">
                <span>Ingesting document...</span>
                <span>{{ uploadProgress }}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" :style="{ width: `${uploadProgress}%` }"></div>
              </div>
            </div>

            <button 
              class="btn-primary upload-submit-btn" 
              :disabled="!selectedFile || isUploading"
              @click="handleUpload"
            >
              {{ isUploading ? 'Processing...' : 'Upload & Embed' }}
            </button>
          </template>

          <template v-else>
            <!-- Success State -->
            <div class="success-state fade-in">
              <div class="success-icon animate-pulse">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Document Ingested!</h3>
              <p>The AI can now answer questions based on this document.</p>
              <p class="sub-text" style="margin-top: 10px;">Ready for next upload...</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4); /* Slate 900 overlay */
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.modal-drawer {
  width: 400px;
  height: 100vh;
  border-left: 1px solid var(--border-light);
  border-radius: 0;
  background: var(--bg-panel);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: var(--space-4);
}



.documents-section {
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-3);
  font-weight: 600;
}

.empty-docs {
  font-size: 0.85rem;
  color: var(--text-muted);
  padding: var(--space-4);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  text-align: center;
  border: 1px dashed var(--border-strong);
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 200px;
  overflow-y: auto;
}

.document-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-panel-light);
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

.doc-icon {
  color: var(--accent-primary);
  display: flex;
}

.doc-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.doc-filename {
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.delete-doc-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.delete-doc-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-error);
}

.select-field {
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
  cursor: pointer;
  background-color: var(--bg-panel-light);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  border-radius: 6px;
  padding: var(--space-2) var(--space-3);
}

.dropzone {
  border: 2px dashed var(--border-strong);
  border-radius: 8px;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--bg-dark);
  margin-bottom: var(--space-6);
}

.dropzone:hover, .dropzone.is-dragging {
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.05); /* Indigo tint */
}

.dropzone.has-file {
  cursor: default;
  border-style: solid;
  border-color: var(--border-strong);
  background: var(--bg-panel);
}

.drop-icon {
  color: var(--text-muted);
  margin-bottom: var(--space-3);
  transition: color var(--transition-normal);
}

.dropzone:hover .drop-icon {
  color: var(--accent-primary);
}

.dropzone p {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.sub-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.hidden-input {
  display: none;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.filename {
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
}

.filesize {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.remove-file-btn {
  margin-top: var(--space-2);
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.remove-file-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-error);
  border-color: rgba(239, 68, 68, 0.3);
}

.error-toast {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-error);
  padding: var(--space-3);
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin-bottom: var(--space-4);
  font-size: 0.9rem;
  text-align: center;
}

.upload-progress {
  margin-bottom: var(--space-6);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  font-weight: 500;
}

.progress-bar-bg {
  height: 8px;
  background: var(--bg-dark);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-strong);
}

.progress-bar-fill {
  height: 100%;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}

.upload-submit-btn {
  width: 100%;
  margin-top: auto;
  padding: var(--space-3);
  font-size: 1rem;
}

.upload-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
}

.success-icon {
  margin-bottom: var(--space-4);
}

.success-state h3 {
  font-size: 1.5rem;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.success-state p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: var(--space-6);
}

.mt-4 {
  margin-top: var(--space-4);
}
</style>
