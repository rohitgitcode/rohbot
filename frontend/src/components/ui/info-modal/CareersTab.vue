<script setup lang="ts">
import { ref } from 'vue'

const copiedCareerEmail = ref(false)

const copyCareerEmail = () => {
  navigator.clipboard.writeText('careers@rohbot.ai')
  copiedCareerEmail.value = true
  setTimeout(() => { copiedCareerEmail.value = false }, 2000)
}
</script>

<template>
  <div class="tab-content">
    <div class="careers-hero">
      <div class="hiring-badge-large">🚀 We are hiring builders & engineers</div>
      <h3>Shape the Next Frontier of Custom AI Knowledge Engines</h3>
      <p class="tab-subtitle">
        Join a high-velocity, remote-first team pioneering multimodal document intelligence, lightning-fast vector search, and developer-first AI copilots.
      </p>
    </div>

    <!-- Perks Grid -->
    <div class="perks-grid">
      <div class="perk-item glass-panel">
        <span class="perk-icon">🌍</span>
        <div>
          <h5>100% Remote-First</h5>
          <p>Work from anywhere in the world with flexible, asynchronous hours.</p>
        </div>
      </div>
      <div class="perk-item glass-panel">
        <span class="perk-icon">⚡</span>
        <div>
          <h5>High Ownership</h5>
          <p>Ship meaningful features directly to users from your first week.</p>
        </div>
      </div>
      <div class="perk-item glass-panel">
        <span class="perk-icon">💰</span>
        <div>
          <h5>Competitive Pay & Equity</h5>
          <p>Top-tier market compensation with generous early-stage equity.</p>
        </div>
      </div>
      <div class="perk-item glass-panel">
        <span class="perk-icon">🧠</span>
        <div>
          <h5>AI Hardware & Compute</h5>
          <p>Access to modern GPUs, model APIs, and home workstation stipends.</p>
        </div>
      </div>
    </div>

    <h4 class="section-subtitle">Open Positions</h4>

    <!-- Job Openings List -->
    <div class="jobs-list">
      <div class="job-card glass-panel">
        <div class="job-header">
          <div>
            <h4>Full-Stack AI Engineer</h4>
            <div class="job-tags">
              <span class="job-tag">Engineering</span>
              <span class="job-tag">Vue 3 / Node.js</span>
              <span class="job-tag location">Remote</span>
            </div>
          </div>
          <button class="btn-secondary job-apply-btn" @click="copyCareerEmail">
            {{ copiedCareerEmail ? '✓ Email Copied' : 'Apply for Role' }}
          </button>
        </div>
        <p class="job-desc">
          Lead the development of real-time RAG ingestion pipelines, reactive Vue workspaces, and embedding vector indexing infrastructure.
        </p>
      </div>

      <div class="job-card glass-panel">
        <div class="job-header">
          <div>
            <h4>AI & RAG Systems Engineer</h4>
            <div class="job-tags">
              <span class="job-tag">AI / ML</span>
              <span class="job-tag">Qdrant & LLMs</span>
              <span class="job-tag location">Remote</span>
            </div>
          </div>
          <button class="btn-secondary job-apply-btn" @click="copyCareerEmail">
            {{ copiedCareerEmail ? '✓ Email Copied' : 'Apply for Role' }}
          </button>
        </div>
        <p class="job-desc">
          Architect high-accuracy vector retrieval, semantic re-ranking, multimodal vision document parsers, and low-latency LLM streaming.
        </p>
      </div>

      <div class="job-card glass-panel">
        <div class="job-header">
          <div>
            <h4>Senior Product / UI Designer</h4>
            <div class="job-tags">
              <span class="job-tag">Design</span>
              <span class="job-tag">Figma & Design Systems</span>
              <span class="job-tag location">Remote</span>
            </div>
          </div>
          <button class="btn-secondary job-apply-btn" @click="copyCareerEmail">
            {{ copiedCareerEmail ? '✓ Email Copied' : 'Apply for Role' }}
          </button>
        </div>
        <p class="job-desc">
          Craft state-of-the-art developer experiences, dark-mode interfaces, interactive chatbot themes, and modular widget builders.
        </p>
      </div>
    </div>

    <!-- Application Banner -->
    <div class="apply-banner glass-panel">
      <div class="banner-content">
        <h4>Don't see your specific role?</h4>
        <p>We always welcome exceptional builders. Send your portfolio, GitHub, or resume directly to our founders.</p>
      </div>
      <div class="apply-action">
        <button class="btn-primary" @click="copyCareerEmail">
          {{ copiedCareerEmail ? '✓ Email Copied!' : '✉️ careers@rohbot.ai' }}
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

.section-subtitle {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: var(--space-6) 0 var(--space-4);
}

.careers-hero {
  margin-bottom: var(--space-6);
}

.hiring-badge-large {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.careers-hero h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.perks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.perk-item {
  padding: var(--space-4);
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.perk-icon {
  font-size: 1.5rem;
}

.perk-item h5 {
  font-size: 0.95rem;
  margin-bottom: 2px;
  color: var(--text-primary);
}

.perk-item p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.job-card {
  padding: var(--space-4);
  border-radius: 12px;
  transition: border-color var(--transition-fast);
}

.job-card:hover {
  border-color: var(--accent-primary);
}

.job-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.job-header h4 {
  font-size: 1.1rem;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.job-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.job-tag {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
}

.job-tag.location {
  background: rgba(6, 182, 212, 0.12);
  color: #06b6d4;
  border-color: rgba(6, 182, 212, 0.3);
}

.job-apply-btn {
  padding: 6px 14px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.job-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.apply-banner {
  padding: var(--space-5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
}

.banner-content h4 {
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.banner-content p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .perks-grid,
  .apply-banner {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .job-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
