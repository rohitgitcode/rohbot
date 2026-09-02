<script setup lang="ts">
</script>

<template>
  <div class="tab-content">
    <p class="tab-subtitle">
      Insights on Retrieval-Augmented Generation, vector embeddings, and AI engineering.
    </p>

    <div class="blog-list">
      <article class="blog-card glass-panel">
        <div class="blog-meta">
          <span class="blog-tag">Architecture</span>
          <span class="blog-date">September 2026</span>
        </div>
        <h4>Announcing Multimodal Document Parsing & Qdrant RAG</h4>
        <p>
          How we solved complex table extraction and image summaries in PDF documents to provide hyper-accurate context retrieval for AI chat bots.
        </p>
        <a href="#" class="read-more" @click.prevent>Read Engineering Post →</a>
      </article>

      <article class="blog-card glass-panel">
        <div class="blog-meta">
          <span class="blog-tag">Tutorial</span>
          <span class="blog-date">August 2026</span>
        </div>
        <h4>Embed an AI Copilot on your Website in 30 Seconds</h4>
        <p>
          A step-by-step breakdown of how our lightweight embed script loads inside shadow DOM to prevent CSS bleeding and deliver a native experience.
        </p>
        <a href="#" class="read-more" @click.prevent>Read Tutorial →</a>
      </article>

      <article class="blog-card glass-panel">
        <div class="blog-meta">
          <span class="blog-tag">Deep Dive</span>
          <span class="blog-date">July 2026</span>
        </div>
        <h4>Why Vector Embeddings Outperform Traditional Keyword Search</h4>
        <p>
          Comparing lexical vs semantic search pipelines: why cosine distance on 384-dimension embeddings creates conversational magic.
        </p>
        <a href="#" class="read-more" @click.prevent>Read Deep Dive →</a>
      </article>
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

.blog-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.blog-card {
  padding: var(--space-4);
  border-radius: 10px;
}

.blog-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
  font-size: 0.75rem;
}

.blog-tag {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.blog-date {
  color: var(--text-muted);
}

.blog-card h4 {
  font-size: 1.05rem;
  margin-bottom: var(--space-2);
}

.blog-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  line-height: 1.4;
}

.read-more {
  color: var(--accent-primary);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}

.read-more:hover {
  text-decoration: underline;
}
</style>
