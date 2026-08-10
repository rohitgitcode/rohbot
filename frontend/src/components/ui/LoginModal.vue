<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '../../stores/chatStore'

const chatStore = useChatStore()
const emit = defineEmits<{
  (e: 'success'): void
}>()

const email = ref('')
const password = ref('')
const customToken = ref('')
const isDevMode = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  
  if (isDevMode.value) {
    if (!customToken.value.trim()) {
      errorMsg.value = 'Please enter a valid JWT token.'
      return
    }
    chatStore.setToken(customToken.value.trim())
    await chatStore.fetchBots()
    emit('success')
    return
  }

  if (!email.value || !password.value) {
    errorMsg.value = 'Please enter email and password.'
    return
  }

  isLoading.value = true
  
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    if (res.ok) {
      const data = await res.json()
      if (data.token) {
        chatStore.setToken(data.token)
        await chatStore.fetchBots()
        emit('success')
      } else {
        throw new Error('No token received')
      }
    } else {
      throw new Error('Invalid credentials')
    }
  } catch (e) {
    errorMsg.value = 'Login failed. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card fade-in">
      <div class="login-header">
        <div class="logo">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M12 8v8"></path>
              <path d="M8 12h8"></path>
            </svg>
          </div>
          <h1>RohBot AI</h1>
        </div>
        <p>Sign in to access your knowledge engines</p>
      </div>

      <div class="login-form">
        <template v-if="!isDevMode">
          <div class="form-group">
            <label>Email Address</label>
            <input 
              v-model="email" 
              type="email" 
              class="input-field" 
              placeholder="you@example.com"
              @keyup.enter="handleLogin"
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input 
              v-model="password" 
              type="password" 
              class="input-field" 
              placeholder="••••••••"
              @keyup.enter="handleLogin"
            />
          </div>
        </template>
        
        <template v-else>
          <div class="form-group">
            <label>Workspace Bearer Token</label>
            <input 
              v-model="customToken" 
              type="text" 
              class="input-field" 
              placeholder="eyJh..."
              @keyup.enter="handleLogin"
            />
            <span class="help-text">Authenticate directly using a developer JWT token</span>
          </div>
        </template>

        <div v-if="errorMsg" class="error-msg fade-in">{{ errorMsg }}</div>

        <button 
          class="btn-primary login-btn" 
          @click="handleLogin"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Authenticating...' : 'Enter Workspace' }}
        </button>

        <div class="dev-toggle">
          <button @click="isDevMode = !isDevMode" class="dev-btn">
            {{ isDevMode ? 'Switch to Standard Login' : 'Developer? Use Token' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  position: fixed;
  inset: 0;
  background: var(--bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: var(--space-8);
  background: var(--bg-panel);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: var(--accent-primary);
  color: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.logo h1 {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

.login-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-field {
  padding: var(--space-3);
  font-size: 1rem;
}

.help-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.error-msg {
  color: var(--accent-error);
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: var(--space-4);
  padding: var(--space-2);
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.login-btn {
  width: 100%;
  padding: var(--space-3);
  font-size: 1.05rem;
  margin-top: var(--space-2);
}

.dev-toggle {
  margin-top: var(--space-6);
  text-align: center;
}

.dev-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color var(--transition-fast);
}

.dev-btn:hover {
  color: var(--text-primary);
}
</style>
