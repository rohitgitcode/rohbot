(() => {
  // Find our script tag to extract bot ID
  const scriptTag = document.currentScript || document.querySelector('script[data-bot-id]');
  const botId = scriptTag ? scriptTag.getAttribute('data-bot-id') : null;

  if (!botId) {
    console.error('RohBot Widget: data-bot-id is missing from the script tag.');
    return;
  }

  // Session ID management
  const sessionKey = `rohbot_session_id_${botId}`;
  let sessionId = localStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(sessionKey, sessionId);
  }

  // Container
  const container = document.createElement('div');
  container.id = 'rohbot-widget-container';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  document.body.appendChild(container);

  // Shadow DOM
  const shadow = container.attachShadow({ mode: 'open' });

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    .widget-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 2;
    }
    
    .widget-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
    }
    
    .widget-btn svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
    }

    .chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      max-height: calc(100vh - 100px);
      background: #0f172a; /* Slate 900 */
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.3s, transform 0.3s;
      transform-origin: bottom right;
      z-index: 1;
    }

    .chat-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .chat-header {
      background: #1e293b;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #334155;
    }

    .chat-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chat-header-icon {
      width: 32px;
      height: 32px;
      background: #4f46e5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .chat-header-icon svg {
      width: 18px;
      height: 18px;
    }

    .chat-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #f8fafc;
    }

    .chat-header p {
      font-size: 12px;
      color: #94a3b8;
    }

    .close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
    }
    .close-btn:hover {
      color: #f8fafc;
    }

    .chat-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #0f172a;
    }

    .message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .message.bot {
      background: #1e293b;
      color: #f1f5f9;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .message.user {
      background: #4f46e5;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    
    .message.bot pre {
      background: #0f172a;
      padding: 8px;
      border-radius: 6px;
      overflow-x: auto;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    
    .message.bot code {
      font-family: monospace;
      font-size: 13px;
    }

    .chat-footer {
      padding: 12px;
      background: #1e293b;
      border-top: 1px solid #334155;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 4px;
    }

    .input-wrapper:focus-within {
      border-color: #4f46e5;
      box-shadow: 0 0 0 1px #4f46e5;
    }

    .chat-input {
      flex: 1;
      background: none;
      border: none;
      padding: 8px 12px;
      color: #f8fafc;
      font-size: 14px;
      outline: none;
    }

    .chat-input::placeholder {
      color: #64748b;
    }

    .send-btn {
      background: #4f46e5;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: background 0.2s;
    }

    .send-btn:hover {
      background: #4338ca;
    }

    .send-btn:disabled {
      background: #334155;
      color: #64748b;
      cursor: not-allowed;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 4px 8px;
    }
    
    .dot {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    /* Scrollbar */
    .chat-body::-webkit-scrollbar {
      width: 6px;
    }
    .chat-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .chat-body::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 3px;
    }
    .chat-body::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }
  `;
  shadow.appendChild(style);

  // Widget Button
  const btn = document.createElement('button');
  btn.className = 'widget-btn';
  btn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      <circle cx="8" cy="9" r="1.5"/>
      <circle cx="12" cy="9" r="1.5"/>
      <circle cx="16" cy="9" r="1.5"/>
    </svg>
  `;
  shadow.appendChild(btn);

  // Chat Window
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chat-window';
  
  chatWindow.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-info">
        <div class="chat-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        </div>
        <div>
          <h3>Assistant</h3>
          <p>We typically reply instantly</p>
        </div>
      </div>
      <button class="close-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="chat-body" id="chat-body">
      <div class="message bot">Hi there! How can I help you today?</div>
    </div>
    <div class="chat-footer">
      <div class="input-wrapper">
        <input type="text" class="chat-input" id="chat-input" placeholder="Type your message..." autocomplete="off">
        <button class="send-btn" id="send-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;
  shadow.appendChild(chatWindow);

  // Elements
  const closeBtn = chatWindow.querySelector('.close-btn');
  const chatBody = chatWindow.querySelector('#chat-body');
  const chatInput = chatWindow.querySelector('#chat-input');
  const sendBtn = chatWindow.querySelector('#send-btn');

  let isOpen = false;

  // Toggle Logic
  const toggleChat = () => {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.add('open');
      btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      setTimeout(() => chatInput.focus(), 300);
    } else {
      chatWindow.classList.remove('open');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          <circle cx="8" cy="9" r="1.5"/>
          <circle cx="12" cy="9" r="1.5"/>
          <circle cx="16" cy="9" r="1.5"/>
        </svg>
      `;
    }
  };

  btn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  const scrollToBottom = () => {
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const addMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    if (sender === 'bot') {
      // Basic markdown parsing for bold and code
      let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      html = html.replace(/\n/g, '<br/>');
      msgDiv.innerHTML = html;
    } else {
      msgDiv.textContent = text;
    }
    
    chatBody.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
  };

  const showTyping = () => {
    const div = document.createElement('div');
    div.className = 'message bot';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="typing-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;
    chatBody.appendChild(div);
    scrollToBottom();
  };

  const removeTyping = () => {
    const indicator = chatBody.querySelector('#typing-indicator');
    if (indicator) indicator.remove();
  };

  // Determine API URL based on script src, fallback to localhost for testing
  let API_BASE = 'http://localhost:5000/api/public/chat';
  try {
    if (scriptTag && scriptTag.src) {
      API_BASE = new URL(scriptTag.src).origin + '/api/public/chat';
    }
  } catch (e) {
    console.warn('RohBot Widget: Invalid script src, defaulting to localhost API.');
  }

  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;

    addMessage(text, 'user');
    showTyping();

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          message: text,
          sessionId
        })
      });
      
      const data = await res.json();
      removeTyping();

      if (res.ok && data.status === 'success') {
        addMessage(data.reply, 'bot');
      } else {
        addMessage('Sorry, I encountered an error. ' + (data.message || ''), 'bot');
      }
    } catch (e) {
      removeTyping();
      addMessage('Network error. Please try again.', 'bot');
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

})();
