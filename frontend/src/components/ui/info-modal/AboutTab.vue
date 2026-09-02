<script setup lang="ts">
const emit = defineEmits<{
  (e: 'open-login', isLogin: boolean): void
}>()
</script>

<template>
  <div class="tab-content">
    <div class="about-hero">
      <h3>Empowering every business with custom AI intelligence.</h3>
      <p>
        RohBot was built to eliminate the complexity of building production-grade Retrieval-Augmented Generation (RAG) systems. 
        We enable creators, engineers, and companies to turn scattered PDFs, documentation, and websites into conversational AI engines in seconds.
      </p>
    </div>

    <div class="values-grid">
      <div class="value-item glass-panel">
        <div class="value-icon">🛡️</div>
        <h4>Zero Model Training</h4>
        <p>Your documents strictly belong to you. We never train public foundation models with your uploaded proprietary data.</p>
      </div>
      <div class="value-item glass-panel">
        <div class="value-icon">⚡</div>
        <h4>Real-time Processing</h4>
        <p>From PDF upload to searchable vector embeddings in seconds with automated text chunking and vector upserts.</p>
      </div>
      <div class="value-item glass-panel">
        <div class="value-icon">🌐</div>
        <h4>Universal Compatibility</h4>
        <p>Embed seamless chat widgets across React, Vue, Next.js, WordPress, or plain HTML pages with zero configuration.</p>
      </div>
    </div>

    <div class="about-cta">
      <button class="btn-primary" @click="emit('open-login', false)">
        Create Your First Bot Today →
      </button>
    </div>
  </div>
</template>

<style scoped>
.about-hero {
  margin-bottom: var(--space-6);
}

.about-hero h3 {
  font-size: 1.35rem;
  margin-bottom: var(--space-3);
  color: var(--accent-primary);
}

.about-hero p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.value-item {
  padding: var(--space-4);
  border-radius: 10px;
  text-align: center;
}

.value-icon {
  font-size: 2rem;
  margin-bottom: var(--space-2);
}

.value-item h4 {
  font-size: 0.95rem;
  margin-bottom: var(--space-2);
}

.value-item p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.about-cta {
  text-align: center;
  margin-top: var(--space-4);
}

@media (max-width: 768px) {
  .values-grid {
    grid-template-columns: 1fr;
  }
}
</style>
