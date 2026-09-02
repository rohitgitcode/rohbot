<script setup lang="ts">
const emit = defineEmits<{
  (e: 'open-login', isLogin: boolean): void
  (e: 'switch-tab', tab: string): void
}>()
</script>

<template>
  <div class="tab-content">
    <p class="tab-subtitle">
      Scale your custom AI capabilities with transparent, developer-friendly pricing.
    </p>
    <div class="pricing-grid">
      <!-- Free Tier -->
      <div class="price-card glass-panel">
        <div class="price-header">
          <h3>Starter</h3>
          <div class="price-amount">
            <span class="currency">$</span>
            <span class="val">0</span>
            <span class="period">/ mo</span>
          </div>
          <p class="price-desc">Perfect for testing, experiments & small projects.</p>
        </div>
        <ul class="price-features">
          <li><span class="check">✓</span> 1 Custom AI Bot</li>
          <li><span class="check">✓</span> 50 MB Document Storage</li>
          <li><span class="check">✓</span> PDF & Web URL Ingestion</li>
          <li><span class="check">✓</span> Standard Qdrant Vector Index</li>
          <li><span class="check">✓</span> 1-Click Embed Widget</li>
        </ul>
        <button class="btn-secondary w-full" @click="emit('open-login', false)">
          Start Free
        </button>
      </div>

      <!-- Pro Tier -->
      <div class="price-card glass-panel featured-card">
        <div class="popular-tag">MOST POPULAR</div>
        <div class="price-header">
          <h3>Pro Engine</h3>
          <div class="price-amount">
            <span class="currency">$</span>
            <span class="val">19</span>
            <span class="period">/ mo</span>
          </div>
          <p class="price-desc">For power users, businesses & production apps.</p>
        </div>
        <ul class="price-features">
          <li><span class="check">✓</span> Unlimited Custom AI Bots</li>
          <li><span class="check">✓</span> 1 GB Document Storage</li>
          <li><span class="check">✓</span> Multimodal Vision & Table OCR</li>
          <li><span class="check">✓</span> High-Priority Vector Indexing</li>
          <li><span class="check">✓</span> Remove RohBot Branding</li>
          <li><span class="check">✓</span> Priority Customer Support</li>
        </ul>
        <button class="btn-primary w-full" @click="emit('open-login', false)">
          Get Pro Access
        </button>
      </div>

      <!-- Enterprise Tier -->
      <div class="price-card glass-panel">
        <div class="price-header">
          <h3>Enterprise</h3>
          <div class="price-amount">
            <span class="val">Custom</span>
          </div>
          <p class="price-desc">Dedicated infrastructure and tailored SLAs.</p>
        </div>
        <ul class="price-features">
          <li><span class="check">✓</span> Dedicated Qdrant Vector Cluster</li>
          <li><span class="check">✓</span> Custom LLM Fine-Tuning</li>
          <li><span class="check">✓</span> 99.9% Uptime Guarantee & SLA</li>
          <li><span class="check">✓</span> SSO & Custom Role Permissions</li>
          <li><span class="check">✓</span> 24/7 Dedicated Account Engineer</li>
        </ul>
        <button class="btn-secondary w-full" @click="emit('switch-tab', 'contact')">
          Contact Enterprise
        </button>
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

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  align-items: stretch;
}

.price-card {
  padding: var(--space-5);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.featured-card {
  border-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
}

.popular-tag {
  position: absolute;
  top: -10px;
  right: 16px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.5px;
}

.price-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.price-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: var(--space-2);
}

.price-amount .currency {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--accent-primary);
}

.price-amount .val {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.price-amount .period {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.price-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  min-height: 36px;
}

.price-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-6);
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.price-features li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-features .check {
  color: var(--accent-primary);
  font-weight: 700;
}

.w-full {
  width: 100%;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
</style>
