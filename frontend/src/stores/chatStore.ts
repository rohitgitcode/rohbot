import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export interface Bot {
  _id: string
  name: string
  systemPrompt?: string
}

export interface ChatMessage {
  _id?: string
  id?: string
  role: 'user' | 'assistant'
  content: string
  hasContext?: boolean
  isError?: boolean
}

export interface KBDocument {
  _id: string
  filename: string
  size: number
  chunkCount: number
  status: string
  createdAt: string
  fileType?: string
  sourceUrl?: string
}

export interface ChatThread {
  _id: string
  title: string
  updatedAt: string
}

export const useChatStore = defineStore('chat', () => {
  // State
  const token = ref<string>(localStorage.getItem('rohbot_token') || '')
  const isAuthenticated = computed(() => !!token.value)

  const bots = ref<Bot[]>([])
  const activeBotId = ref<string>('')

  const documents = ref<KBDocument[]>([])

  const chatHistory = ref<ChatThread[]>([])
  const currentChatId = ref<string | null>(null)
  const currentMessages = ref<ChatMessage[]>([])

  const isLoading = ref<boolean>(false)

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('rohbot_token', newToken)
    } else {
      localStorage.removeItem('rohbot_token')
    }
  }

  const logout = () => {
    setToken('')
    chatHistory.value = []
    currentMessages.value = []
    currentChatId.value = null
  }

  const fetchBots = async () => {
    if (!isAuthenticated.value) return
    try {
      const res = await fetch(`${API_BASE}/api/bots`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      if (res.ok) {
        const payload = await res.json()
        const fetchedBots: Bot[] = payload.data?.bots || []
        if (fetchedBots.length > 0) {
          bots.value = fetchedBots
          const firstBot = fetchedBots[0]
          if (firstBot && !fetchedBots.find(b => b._id === activeBotId.value)) {
            switchWorkspace(firstBot._id)
          } else if (activeBotId.value) {
            fetchDocuments(activeBotId.value)
            fetchChatHistory(activeBotId.value)
          }
        } else {
          bots.value = []
          activeBotId.value = ''
          documents.value = []
          chatHistory.value = []
        }
      }
    } catch (e) {
      console.error('Failed to fetch bots:', e)
    }
  }

  const createBot = async (payload: { name: string; systemPrompt: string }) => {
    if (!isAuthenticated.value) return null
    try {
      const res = await fetch(`${API_BASE}/api/bots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        const newBot = data.data?.bot
        if (newBot && newBot._id) {
          bots.value.unshift(newBot)
          switchWorkspace(newBot._id)
          return newBot._id as string
        }
        return null
      }
      return null
    } catch (e) {
      console.error('Failed to create bot:', e)
      return null
    }
  }

  const fetchDocuments = async (botId: string) => {
    if (!isAuthenticated.value || !botId) return
    try {
      const res = await fetch(`${API_BASE}/api/documents?botId=${botId}`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      if (res.ok) {
        const data = await res.json()
        documents.value = data.data?.documents || []
      }
    } catch (e) {
      console.error('Failed to fetch documents:', e)
    }
  }

  const fetchChatHistory = async (botId?: string) => {
    const targetBotId = botId || activeBotId.value
    if (!isAuthenticated.value || !targetBotId) return
    try {
      const url = `${API_BASE}/api/chat?botId=${targetBotId}`
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      if (res.ok) {
        const data = await res.json()
        chatHistory.value = data.chats || []
      }
    } catch (e) {
      console.error('Failed to fetch chat history:', e)
    }
  }

  const switchWorkspace = async (botId: string) => {
    activeBotId.value = botId
    currentChatId.value = null
    currentMessages.value = []
    await fetchDocuments(botId)
    await fetchChatHistory(botId)
  }

  const startNewChat = () => {
    currentChatId.value = null
    currentMessages.value = []
  }

  const loadChat = async (chatId: string) => {
    if (!isAuthenticated.value) return
    try {
      isLoading.value = true
      const res = await fetch(`${API_BASE}/api/chat/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      if (res.ok) {
        const data = await res.json()
        currentChatId.value = chatId
        currentMessages.value = data.chat?.messages || []
      }
    } catch (e) {
      console.error('Failed to load chat:', e)
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (message: string) => {
    if (!isAuthenticated.value || !message.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: message }
    currentMessages.value.push(userMsg)

    const botMsgId = Date.now().toString()
    currentMessages.value.push({ id: botMsgId, role: 'assistant', content: '...' })
    isLoading.value = true

    try {
      const payload: any = {
        message,
        botId: activeBotId.value
      }
      if (currentChatId.value) {
        payload.chatId = currentChatId.value
      }

      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(payload)
      })

      if (res.status === 401) {
        logout()
        return
      }

      if (res.ok) {
        const data = await res.json()
        if (!currentChatId.value && data.chatId) {
          currentChatId.value = data.chatId
          await fetchChatHistory()
        }

        const idx = currentMessages.value.findIndex(m => m.id === botMsgId)
        if (idx !== -1 && currentMessages.value[idx]) {
          currentMessages.value[idx] = {
            id: botMsgId,
            role: 'assistant',
            content: data.reply || data.response || 'No response',
            hasContext: data.hasContext
          }
        }
      } else {
        throw new Error('API Error')
      }
    } catch (e) {
      console.error('Failed to send message:', e)
      const idx = currentMessages.value.findIndex(m => m.id === botMsgId)
      if (idx !== -1 && currentMessages.value[idx]) {
        const targetMsg = currentMessages.value[idx]
        if (targetMsg) {
          targetMsg.content = 'No response received — try rephrasing or resending your message'
          targetMsg.isError = true
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  const uploadPdf = async (file: File, botId: string) => {
    if (!isAuthenticated.value) return false
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('botId', botId)

      const res = await fetch(`${API_BASE}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        body: formData
      })

      if (res.status === 401) {
        logout()
        return false
      }

      const success = res.status === 201 || res.ok
      if (success) {
        await fetchDocuments(botId)
      }
      return success
    } catch (e) {
      console.error('Failed to upload document:', e)
      return false
    }
  }

  const ingestUrl = async (url: string, botId: string) => {
    if (!isAuthenticated.value) return false
    try {
      const res = await fetch(`${API_BASE}/api/documents/ingest-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ url, botId })
      })

      if (res.status === 401) {
        logout()
        return false
      }

      const success = res.status === 201 || res.ok
      if (success) {
        await fetchDocuments(botId)
      } else {
        const err = await res.json().catch(() => ({}))
        console.error('Ingest URL failed:', err?.message || 'Unknown error')
      }
      return success
    } catch (e) {
      console.error('Failed to ingest URL:', e)
      return false
    }
  }

  const deleteDocument = async (documentId: string, botId: string) => {
    if (!isAuthenticated.value) return false
    try {
      const res = await fetch(`${API_BASE}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      if (res.ok) {
        await fetchDocuments(botId)
        return true
      }
    } catch (e) {
      console.error('Failed to delete document:', e)
    }
    return false
  }

  const deleteThread = async (threadId: string) => {
    if (!isAuthenticated.value) return false
    try {
      const res = await fetch(`${API_BASE}/api/chat/${threadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      if (res.ok) {
        chatHistory.value = chatHistory.value.filter(chat => chat._id !== threadId)
        if (currentChatId.value === threadId) {
          startNewChat()
        }
        return true
      }
    } catch (e) {
      console.error('Failed to delete thread:', e)
    }
    return false
  }

  const bulkDeleteThreads = async (threadIds: string[]) => {
    if (!isAuthenticated.value || threadIds.length === 0) return false
    try {
      const res = await fetch(`${API_BASE}/api/chat/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ threadIds })
      })
      if (res.ok) {
        chatHistory.value = chatHistory.value.filter(chat => !threadIds.includes(chat._id))
        if (currentChatId.value && threadIds.includes(currentChatId.value)) {
          startNewChat()
        }
        return true
      }
    } catch (e) {
      console.error('Failed to bulk delete threads:', e)
    }
    return false
  }

  const deleteBot = async (botId: string) => {
    if (!isAuthenticated.value) return false
    try {
      const res = await fetch(`${API_BASE}/api/bots/${botId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      if (res.ok) {
        bots.value = bots.value.filter(b => b._id !== botId)
        if (activeBotId.value === botId) {
          const firstBot = bots.value[0]
          if (firstBot) {
            switchWorkspace(firstBot._id)
          } else {
            activeBotId.value = ''
            chatHistory.value = []
            documents.value = []
            currentMessages.value = []
            currentChatId.value = null
          }
        }
        return true
      }
    } catch (e) {
      console.error('Failed to delete workspace:', e)
    }
    return false
  }

  return {
    token,
    isAuthenticated,
    bots,
    activeBotId,
    documents,
    chatHistory,
    currentChatId,
    currentMessages,
    isLoading,
    setToken,
    logout,
    fetchBots,
    createBot,
    fetchDocuments,
    fetchChatHistory,
    switchWorkspace,
    startNewChat,
    loadChat,
    sendMessage,
    uploadPdf,
    ingestUrl,
    deleteDocument,
    deleteThread,
    bulkDeleteThreads,
    deleteBot
  }
})
