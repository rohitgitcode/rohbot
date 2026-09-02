<script setup lang="ts">
</script>

<template>
  <div class="tab-content legal-text">
    <div class="legal-badge">Effective Date: 2026</div>

    <section class="legal-section">
      <h4>1. Complete Data Ownership</h4>
      <p>
        You retain all ownership, intellectual property rights, and control over all documents, text files, web pages, and prompts you upload to RohBot.
      </p>
    </section>

    <section class="legal-section">
      <h4>2. Zero AI Training on Customer Data</h4>
      <p>
        We enforce a strict zero-retention training policy: your proprietary knowledge base is never used to train or fine-tune public foundation models.
      </p>
    </section>

    <section class="legal-section">
      <h4>3. Enterprise Security & Vector Isolation</h4>
      <p>
        All communications between your browser, widget, and backend are encrypted using TLS 1.3. Vector representations stored in Qdrant Vector Cloud are isolated per tenant ID to guarantee cross-workspace data boundaries.
      </p>
    </section>

    <section class="legal-section">
      <h4>4. Right to Immediate Deletion</h4>
      <p>
        When you delete a document, workspace, or bot, all corresponding vectors in Qdrant and database records in MongoDB are permanently purged immediately.
      </p>
    </section>
  </div>
</template>

<style scoped>
.legal-text {
  max-width: 100%;
}

.legal-badge {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.legal-section {
  margin-bottom: var(--space-5);
}

.legal-section h4 {
  font-size: 1rem;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.legal-section p {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
