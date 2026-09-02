<script setup lang="ts">
import { ref } from 'vue'

const copiedEmail = ref(false)
const contactName = ref('')
const contactEmail = ref('')
const contactMessage = ref('')
const contactSubmitted = ref(false)

const copyEmail = () => {
  navigator.clipboard.writeText('support@rohbot.ai')
  copiedEmail.value = true
  setTimeout(() => { copiedEmail.value = false }, 2000)
}

const submitContact = () => {
  if (!contactEmail.value || !contactMessage.value) return
  contactSubmitted.value = true
  setTimeout(() => {
    contactName.value = ''
    contactEmail.value = ''
    contactMessage.value = ''
  }, 1000)
}
</script>

<template>
  <div class="tab-content">
    <p class="tab-subtitle">
      Have a question, feedback, or need enterprise assistance? We respond within 24 hours.
    </p>

    <div class="contact-layout">
      <!-- Form -->
      <div class="contact-form glass-panel">
        <div v-if="contactSubmitted" class="contact-success fade-in">
          <div class="success-icon">🎉</div>
          <h4>Message Received!</h4>
          <p>Thank you for reaching out. Our engineering team will get back to you shortly at <strong>{{ contactEmail }}</strong>.</p>
          <button class="btn-secondary mt-4" @click="contactSubmitted = false">Send Another Message</button>
        </div>

        <form v-else @submit.prevent="submitContact">
          <div class="form-field">
            <label>Your Name</label>
            <input v-model="contactName" type="text" placeholder="Rohit Kumar" required class="input-field" />
          </div>

          <div class="form-field">
            <label>Email Address</label>
            <input v-model="contactEmail" type="email" placeholder="you@example.com" required class="input-field" />
          </div>

          <div class="form-field">
            <label>Message / Question</label>
            <textarea v-model="contactMessage" rows="4" placeholder="How can we help you?" required class="input-field"></textarea>
          </div>

          <button type="submit" class="btn-primary w-full">Send Message</button>
        </form>
      </div>

      <!-- Direct details -->
      <div class="contact-sidebar">
        <div class="direct-card glass-panel">
          <h4>Direct Email</h4>
          <p>Feel free to shoot us an email directly anytime:</p>
          <div class="email-box">
            <code>support@rohbot.ai</code>
            <button class="copy-btn" @click="copyEmail">
              {{ copiedEmail ? '✓ Copied' : 'Copy' }}
            </button>
          </div>
        </div>

        <div class="direct-card glass-panel">
          <h4>Response SLA</h4>
          <p>⚡ Starter Users: Within 24 hours</p>
          <p>🚀 Pro & Enterprise: Dedicated priority channel</p>
        </div>
      </div>
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

.contact-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--space-5);
}

.contact-form {
  padding: var(--space-5);
  border-radius: 12px;
}

.form-field {
  margin-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-field label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-field textarea.input-field {
  resize: vertical;
}

.w-full {
  width: 100%;
}

.contact-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.direct-card {
  padding: var(--space-4);
  border-radius: 12px;
}

.direct-card h4 {
  font-size: 0.95rem;
  margin-bottom: var(--space-2);
}

.direct-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: var(--space-2);
}

.email-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.4);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  margin-top: 6px;
}

.email-box code {
  color: var(--accent-primary);
  font-size: 0.85rem;
  font-weight: 600;
}

.copy-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.contact-success {
  text-align: center;
  padding: var(--space-6) 0;
}

.success-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-3);
}

.contact-success h4 {
  font-size: 1.2rem;
  margin-bottom: var(--space-2);
}

.contact-success p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.mt-4 {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .contact-layout {
    grid-template-columns: 1fr;
  }
}
</style>
