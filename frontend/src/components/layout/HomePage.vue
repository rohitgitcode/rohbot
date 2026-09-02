<script setup lang="ts">
import { ref } from 'vue'
import ThemeToggle from '../ui/ThemeToggle.vue'
import InfoModal, { type InfoModalTab } from '../ui/InfoModal.vue'

const emit = defineEmits<{
  (e: 'open-login', isLogin: boolean): void
}>()

const isInfoModalOpen = ref(false)
const infoModalTab = ref<InfoModalTab>('pricing')

const openInfoModal = (tab: InfoModalTab) => {
  infoModalTab.value = tab
  isInfoModalOpen.value = true
}

const scrollToFeatures = () => {
  isInfoModalOpen.value = false
  const el = document.getElementById('features')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToTop = () => {
  const container = document.querySelector('.homepage-container')
  if (container) {
    container.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="homepage-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo" @click="scrollToTop">
          <div class="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
              <path d="M10 12C10 10.8954 10.8954 10 12 10H16.5C18.9853 10 21 12.0147 21 14.5C21 16.9853 18.9853 19 16.5 19H12V22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 19L21 24" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#8b5cf6" />
                  <stop offset="1" stop-color="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="brand-name">RohBot</span>
        </div>
        
        <div class="nav-links">
          <a href="#features" @click.prevent="scrollToFeatures">Features</a>
          <a href="#how-it-works">How it Works</a>
        </div>
        
        <div class="nav-auth">
          <ThemeToggle />
          <button class="btn-secondary" @click="emit('open-login', true)">Log in</button>
          <button class="btn-primary" @click="emit('open-login', false)">Sign up free</button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="main-content">
      <section class="hero">
        <div class="hero-content fade-in">
          <div class="badge">✨ The new standard for AI</div>
          <h1 class="hero-title">
            Build Custom AI <br /> <span class="text-gradient-purple">Knowledge Engines</span>
          </h1>
          <p class="hero-subtitle">
            Upload your documents, connect your data sources, and instantly deploy intelligent chat bots that know exactly what your business knows. No coding required.
          </p>
          <div class="hero-actions">
            <button class="btn-primary btn-large" @click="emit('open-login', false)">Get Started Now</button>
            <button class="btn-secondary btn-large" @click="emit('open-login', true)">View Demo</button>
          </div>
        </div>
        
        <div class="hero-visual fade-in" style="animation-delay: 0.2s">
          <div class="glass-panel mockup-window">
            <div class="mockup-header">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="mockup-body">
              <div class="chat-message bot">
                <div class="avatar bot-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
                </div>
                <div class="msg-content">Hello! I'm your custom RohBot. How can I help you with your documents today?</div>
              </div>
              <div class="chat-message user">
                <div class="avatar user-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="msg-content">Can you summarize our Q3 marketing strategy?</div>
              </div>
              <div class="chat-message bot typing">
                <div class="typing-indicator">Analyzing knowledge base...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works Section -->
      <section id="how-it-works" class="how-it-works">
        <h2 class="section-title">How it Works</h2>
        <div class="steps-container">
          <div class="step-card fade-in">
            <div class="step-number">01</div>
            <h3>Connect your data</h3>
            <p>Upload files, paste text, or connect to your website URL.</p>
          </div>
          <div class="step-connector"></div>
          <div class="step-card fade-in" style="animation-delay: 0.1s">
            <div class="step-number">02</div>
            <h3>AI Processing</h3>
            <p>Our system analyzes and vectorizes your knowledge base instantly.</p>
          </div>
          <div class="step-connector"></div>
          <div class="step-card fade-in" style="animation-delay: 0.2s">
            <div class="step-number">03</div>
            <h3>Deploy & Chat</h3>
            <p>Embed the bot on your site or chat securely in your workspace.</p>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="features">
        <h2 class="section-title">Why choose RohBot?</h2>
        <div class="features-grid">
          <div class="feature-card glass-panel">
            <div class="feature-icon animate-float">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <h3>Instant Deployment</h3>
            <p>Go from raw documents to a fully functional AI assistant in under 60 seconds.</p>
          </div>
          <div class="feature-card glass-panel">
            <div class="feature-icon animate-float" style="animation-delay: 0.2s">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
            </div>
            <h3>Multiple Data Sources</h3>
            <p>Upload PDFs, Word docs, text files, or connect directly to your website.</p>
          </div>
          <div class="feature-card glass-panel">
            <div class="feature-icon animate-float" style="animation-delay: 0.4s">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3>Secure & Private</h3>
            <p>Your data remains yours. Enterprise-grade security keeps your knowledge base protected.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="logo" @click="scrollToTop">
            <div class="brand-icon new-brand-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="url(#logo-grad-footer)" />
                <path d="M10 12C10 10.8954 10.8954 10 12 10H16.5C18.9853 10 21 12.0147 21 14.5C21 16.9853 18.9853 19 16.5 19H12V22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 19L21 24" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="logo-grad-footer" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#8b5cf6" />
                    <stop offset="1" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span class="brand-name">RohBot</span>
          </div>
          <p class="footer-desc">Empowering businesses with custom AI intelligence.</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>Product</h4>
            <a href="#features" @click.prevent="scrollToFeatures">Features</a>
            <a href="#integrations" @click.prevent="openInfoModal('integrations')">Integrations</a>
            <a href="#pricing" @click.prevent="openInfoModal('pricing')">Pricing</a>
          </div>
          <div class="link-group">
            <h4>Company</h4>
            <a href="#about" @click.prevent="openInfoModal('about')">About</a>
            <a href="#careers" @click.prevent="openInfoModal('careers')" class="careers-link">
              Careers <span class="footer-badge">Hiring</span>
            </a>
            <a href="#blog" @click.prevent="openInfoModal('blog')">Blog</a>
            <a href="#contact" @click.prevent="openInfoModal('contact')">Contact</a>
          </div>
          <div class="link-group">
            <h4>Legal</h4>
            <a href="#privacy" @click.prevent="openInfoModal('privacy')">Privacy Policy</a>
            <a href="#terms" @click.prevent="openInfoModal('terms')">Terms of Service</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 RohBot AI. All rights reserved.</p>
      </div>
    </footer>

    <!-- Interactive Info Modal -->
    <InfoModal 
      :is-open="isInfoModalOpen"
      :initial-tab="infoModalTab"
      @close="isInfoModalOpen = false"
      @open-login="emit('open-login', $event)"
      @scroll-to-features="scrollToFeatures"
    />
  </div>
</template>

<style scoped>
.homepage-container {
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--bg-dark);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--navbar-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  z-index: 100;
  display: flex;
  align-items: center;
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-name {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.nav-links {
  display: flex;
  gap: var(--space-6);
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.nav-links a:hover {
  color: var(--text-primary);
}

.nav-auth {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

/* Main Content */
.main-content {
  flex: 1;
  padding-top: 72px; /* Navbar height */
}

/* Hero Section */
.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) 6rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 80vh;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: var(--space-6);
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.1;
  margin-bottom: var(--space-6);
  letter-spacing: -1px;
}

.text-gradient-purple {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  max-width: 90%;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
}

.btn-large {
  padding: 0.75rem 1.5rem;
  font-size: 1.05rem;
}

/* Mockup Window */
.mockup-window {
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--mockup-bg);
}

.mockup-header {
  padding: 12px 16px;
  background: var(--border-light);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }

.mockup-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 360px;
}

.chat-message {
  display: flex;
  gap: var(--space-3);
  max-width: 85%;
}

.chat-message.bot {
  align-self: flex-start;
}

.chat-message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-panel-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.bot-avatar {
  background: rgba(139, 92, 246, 0.2);
  color: var(--accent-primary);
}

.user-avatar {
  background: rgba(6, 182, 212, 0.2);
  color: var(--accent-secondary);
}

.msg-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.chat-message.bot .msg-content {
  background: var(--bg-panel-light);
  border: 1px solid var(--border-light);
  border-top-left-radius: 4px;
}

.chat-message.user .msg-content {
  background: var(--accent-primary);
  color: white;
  border-top-right-radius: 4px;
}

/* How it Works */
.how-it-works {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem var(--space-6) 6rem;
}

.steps-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 3rem;
  position: relative;
}

.step-card {
  flex: 1;
  text-align: center;
  padding: var(--space-4);
  position: relative;
  z-index: 2;
}

.step-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--bg-panel-light), var(--bg-panel));
  border: 1px solid var(--border-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--accent-primary);
  font-size: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.step-card h3 {
  font-size: 1.25rem;
  margin-bottom: var(--space-2);
}

.step-card p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  max-width: 250px;
  margin: 0 auto;
}

.step-connector {
  flex: 0 0 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
  margin-top: 40px;
}

/* Features */
.features {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem var(--space-6) 6rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.feature-card {
  padding: var(--space-6);
  border-radius: 12px;
  transition: transform var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  margin-bottom: var(--space-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: var(--space-2);
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Footer */
.footer {
  background: var(--bg-panel);
  border-top: 1px solid var(--border-light);
  padding: 4rem var(--space-6) 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.footer-brand .logo {
  margin-bottom: var(--space-4);
}

.footer-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  max-width: 250px;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.link-group h4 {
  font-size: 1rem;
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.link-group a {
  display: block;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: var(--space-2);
  font-size: 0.9rem;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.link-group a:hover {
  color: var(--accent-primary);
}

.careers-link {
  display: flex !important;
  align-items: center;
  gap: 6px;
}

.footer-badge {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
  color: var(--text-muted);
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }
  
  .hero-subtitle {
    margin: 0 auto var(--space-6);
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .nav-links {
    display: none;
  }

  .steps-container {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .step-connector {
    display: none;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
