<script setup lang="ts">
</script>

<template>
  <div class="tab-content legal-text">
    <div class="legal-badge">Effective Date: 2026</div>

    <section class="legal-section">
      <h4>1. Acceptance of Terms</h4>
      <p>
        By accessing RohBot AI or embedding our widget, you agree to comply with these terms, applicable laws, and data regulations.
      </p>
    </section>

    <section class="legal-section">
      <h4>2. Acceptable Use Policy</h4>
      <p>
        You agree not to use RohBot to process illegal, abusive, or copyright-infringing content, or attempt to reverse-engineer or overwhelm platform infrastructure.
      </p>
    </section>

    <section class="legal-section">
      <h4>3. Service Level & Availability</h4>
      <p>
        We strive to provide continuous 99.9% uptime. Scheduled maintenance and upstream provider interruptions will be communicated transparently.
      </p>
    </section>

    <section class="legal-section">
      <h4>4. Subscriptions & Cancellations</h4>
      <p>
        Paid subscription plans can be modified or cancelled at any time from your account workspace without penalty.
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
