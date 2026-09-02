<script setup lang="ts">
import { ref } from 'vue'

const copiedSnippet = ref(false)

const copySnippet = () => {
  navigator.clipboard.writeText('<script src="https://rohbot.onrender.com/widget.js" data-bot-id="YOUR_BOT_ID"><\/script>')
  copiedSnippet.value = true
  setTimeout(() => { copiedSnippet.value = false }, 2000)
}
</script>

<template>
  <div class="tab-content">
    <p class="tab-subtitle">
      Connect RohBot with your existing tools, data sources, and frontend frameworks effortlessly.
    </p>

    <div class="integrations-grid">
      <div class="integ-card glass-panel">
        <div class="integ-icon">📄</div>
        <h4>Multimodal Documents</h4>
        <p>Upload PDF documents with complex tables and diagrams. Our OCR pipeline extracts structured markdown automatically.</p>
      </div>

      <div class="integ-card glass-panel">
        <div class="integ-icon">🌐</div>
        <h4>Live Web Ingestion</h4>
        <p>Pass any public web documentation URL or blog post. RohBot strips boilerplates and vectorizes readable content.</p>
      </div>

      <div class="integ-card glass-panel">
        <div class="integ-icon">🔮</div>
        <h4>Qdrant Vector Cloud</h4>
        <p>Powered by ultra-fast HNSW vector indexing for sub-millisecond semantic search retrieval across millions of chunks.</p>
      </div>

      <div class="integ-card glass-panel">
        <div class="integ-icon">⚡</div>
        <h4>Groq LPU Acceleration</h4>
        <p>Instant conversational replies utilizing cutting-edge open weights intelligence with industry-leading token speed.</p>
      </div>
    </div>

    <div class="widget-preview-box glass-panel">
      <div class="widget-preview-header">
        <div class="wp-title">
          <span class="icon">🚀</span>
          <strong>Embed Anywhere with 1 Line of Code</strong>
        </div>
        <button class="copy-code-btn" @click="copySnippet">
          {{ copiedSnippet ? '✓ Copied!' : 'Copy Snippet' }}
        </button>
      </div>
      <pre class="code-block"><code>&lt;script src="https://rohbot.onrender.com/widget.js" data-bot-id="YOUR_BOT_ID"&gt;&lt;/script&gt;</code></pre>
    </div>
  </div>
</template>

<style scoped>
.tab-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.integ-card {
  padding: var(--space-4);
  border-radius: 10px;
}

.integ-icon {
  font-size: 1.75rem;
  margin-bottom: var(--space-2);
}

.integ-card h4 {
  font-size: 1rem;
  margin-bottom: var(--space-2);
}

.integ-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.widget-preview-box {
  padding: var(--space-4);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
}

.widget-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.wp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.copy-code-btn {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.copy-code-btn:hover {
  opacity: 0.9;
}

.code-block {
  background: rgba(0, 0, 0, 0.5);
  padding: var(--space-3);
  border-radius: 8px;
  font-size: 0.8rem;
  color: #06b6d4;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .integrations-grid {
    grid-template-columns: 1fr;
  }
}
</style>
