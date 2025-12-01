/**
 * PIVOT Accessibility Widget - Updated Design
 * Dark theme with teal/cyan accents
 * Version: 2.0.0
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiBaseUrl: window.location.hostname === 'localhost' 
      ? 'http://localhost:8001/api' 
      : 'https://your-production-domain.com/api',
    websiteId: document.currentScript?.getAttribute('data-website-id') || '',
    position: document.currentScript?.getAttribute('data-position') || 'bottom-right',
    primaryColor: document.currentScript?.getAttribute('data-primary-color') || '#00CED1',
    darkBg: document.currentScript?.getAttribute('data-dark-bg') || '#1a1a1a'
  };

  // State
  let isOpen = false;
  let currentTab = 'video';
  let contentData = null;
  let currentSectionIndex = 0;
  let selectedLanguage = 'ASL (American Sign Language)';

  // Styles - Dark theme with teal accents
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    .pivot-widget-button {
      position: fixed;
      ${CONFIG.position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
      ${CONFIG.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      min-width: 120px;
      height: 50px;
      padding: 0 20px;
      border-radius: 25px;
      background: ${CONFIG.darkBg};
      border: 2px solid ${CONFIG.primaryColor};
      color: ${CONFIG.primaryColor};
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 8px 24px rgba(0, 206, 209, 0.3);
    }
    .pivot-widget-button:hover {
      background: ${CONFIG.primaryColor};
      color: ${CONFIG.darkBg};
      transform: scale(1.05);
      box-shadow: 0 12px 32px rgba(0, 206, 209, 0.4);
    }
    .pivot-widget-button:active {
      transform: scale(0.98);
    }
    .pivot-logo-text {
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .pivot-widget-modal {
      position: fixed;
      ${CONFIG.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
      ${CONFIG.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      width: 420px;
      max-width: calc(100vw - 48px);
      max-height: 650px;
      background: ${CONFIG.darkBg};
      border-radius: 20px;
      border: 2px solid ${CONFIG.primaryColor};
      box-shadow: 0 20px 60px rgba(0, 206, 209, 0.3);
      z-index: 999998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: pivotSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: 'Inter', sans-serif;
    }
    @keyframes pivotSlideIn {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .pivot-widget-modal.open {
      display: flex;
    }
    .pivot-modal-header {
      padding: 24px 20px;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid ${CONFIG.primaryColor};
    }
    .pivot-modal-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      color: ${CONFIG.primaryColor};
      letter-spacing: 1px;
    }
    .pivot-close-btn {
      background: rgba(0, 206, 209, 0.1);
      border: 1px solid ${CONFIG.primaryColor};
      color: ${CONFIG.primaryColor};
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-weight: 600;
    }
    .pivot-close-btn:hover {
      background: ${CONFIG.primaryColor};
      color: ${CONFIG.darkBg};
      transform: rotate(90deg);
    }
    .pivot-tabs {
      display: flex;
      background: #0f0f0f;
      padding: 8px;
      gap: 8px;
    }
    .pivot-tab {
      flex: 1;
      padding: 12px 16px;
      background: transparent;
      border: 1px solid #333;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: #888;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .pivot-tab:hover {
      color: ${CONFIG.primaryColor};
      border-color: ${CONFIG.primaryColor};
      background: rgba(0, 206, 209, 0.05);
    }
    .pivot-tab.active {
      color: ${CONFIG.darkBg};
      background: ${CONFIG.primaryColor};
      border-color: ${CONFIG.primaryColor};
      box-shadow: 0 4px 12px rgba(0, 206, 209, 0.3);
    }
    .pivot-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #0f0f0f;
    }
    .pivot-content::-webkit-scrollbar {
      width: 8px;
    }
    .pivot-content::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    .pivot-content::-webkit-scrollbar-thumb {
      background: ${CONFIG.primaryColor};
      border-radius: 4px;
    }
    .pivot-language-selector {
      margin-bottom: 16px;
    }
    .pivot-language-selector select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #333;
      border-radius: 10px;
      font-size: 14px;
      background: ${CONFIG.darkBg};
      color: white;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      transition: all 0.2s;
    }
    .pivot-language-selector select:hover,
    .pivot-language-selector select:focus {
      border-color: ${CONFIG.primaryColor};
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 206, 209, 0.1);
    }
    .pivot-language-selector option {
      background: ${CONFIG.darkBg};
      padding: 10px;
    }
    .pivot-section {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #2d2d2d;
    }
    .pivot-section:last-child {
      border-bottom: none;
    }
    .pivot-section-text {
      font-size: 15px;
      line-height: 1.7;
      color: #e0e0e0;
      margin-bottom: 16px;
      padding: 16px;
      background: #1a1a1a;
      border-radius: 12px;
      border-left: 3px solid ${CONFIG.primaryColor};
    }
    .pivot-video-player {
      width: 100%;
      border-radius: 12px;
      background: #000;
      max-height: 300px;
      border: 2px solid #2d2d2d;
    }
    .pivot-audio-player {
      width: 100%;
      margin-top: 8px;
      border-radius: 8px;
    }
    .pivot-empty-state {
      text-align: center;
      padding: 50px 20px;
      color: #666;
    }
    .pivot-empty-state svg {
      width: 60px;
      height: 60px;
      margin: 0 auto 20px;
      stroke: ${CONFIG.primaryColor};
      opacity: 0.5;
    }
    .pivot-empty-state p {
      font-size: 14px;
      color: #888;
    }
    .pivot-loading {
      text-align: center;
      padding: 50px 20px;
      color: ${CONFIG.primaryColor};
    }
    .pivot-loading::after {
      content: '...';
      animation: pivotDots 1.5s infinite;
    }
    @keyframes pivotDots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60%, 100% { content: '...'; }
    }
    .pivot-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 12px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .pivot-section-nav {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .pivot-nav-btn {
      flex: 1;
      padding: 12px 20px;
      background: ${CONFIG.darkBg};
      color: ${CONFIG.primaryColor};
      border: 2px solid ${CONFIG.primaryColor};
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .pivot-nav-btn:hover {
      background: ${CONFIG.primaryColor};
      color: ${CONFIG.darkBg};
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 206, 209, 0.3);
    }
    .pivot-nav-btn:active {
      transform: translateY(0);
    }
    .pivot-nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }
    .pivot-nav-btn:disabled:hover {
      background: ${CONFIG.darkBg};
      color: ${CONFIG.primaryColor};
      box-shadow: none;
    }
    .pivot-section-counter {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 12px;
      font-weight: 500;
    }
    @media (max-width: 480px) {
      .pivot-widget-modal {
        width: calc(100vw - 32px);
        right: 16px;
        left: 16px;
      }
      .pivot-widget-button {
        min-width: 100px;
        height: 45px;
        font-size: 12px;
      }
      .pivot-modal-title {
        font-size: 16px;
      }
      .pivot-tab {
        padding: 10px 8px;
        font-size: 11px;
      }
    }
  `;

  // Create and inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget button (pill shape)
  const button = document.createElement('button');
  button.className = 'pivot-widget-button';
  button.setAttribute('aria-label', 'Open PIVOT accessibility options');
  button.innerHTML = '<span class="pivot-logo-text">PIVOT</span>';
  button.onclick = toggleWidget;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'pivot-widget-modal';
  modal.innerHTML = `
    <div class="pivot-modal-header">
      <h3 class="pivot-modal-title">PIVOT*</h3>
      <button class="pivot-close-btn" aria-label="Close">&times;</button>
    </div>
    <div class="pivot-tabs">
      <button class="pivot-tab active" data-tab="video">👋 ASL</button>
      <button class="pivot-tab" data-tab="audio">🔊 Audio</button>
      <button class="pivot-tab" data-tab="text">📝 Text</button>
    </div>
    <div class="pivot-content">
      <div class="pivot-loading">Loading</div>
    </div>
  `;

  // Event listeners
  modal.querySelector('.pivot-close-btn').onclick = toggleWidget;
  modal.querySelectorAll('.pivot-tab').forEach(tab => {
    tab.onclick = () => switchTab(tab.dataset.tab);
  });

  // Append to body
  document.body.appendChild(button);
  document.body.appendChild(modal);

  // Functions
  function toggleWidget() {
    isOpen = !isOpen;
    modal.classList.toggle('open', isOpen);
    if (isOpen && !contentData) {
      loadContent();
    }
  }

  function switchTab(tab) {
    currentTab = tab;
    modal.querySelectorAll('.pivot-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    renderContent();
  }

  async function loadContent() {
    const contentEl = modal.querySelector('.pivot-content');
    
    if (!CONFIG.websiteId) {
      contentEl.innerHTML = `
        <div class="pivot-error">
          ⚠️ Widget configuration error: Missing website ID
        </div>
      `;
      return;
    }

    try {
      const currentUrl = window.location.href;
      const response = await fetch(
        `${CONFIG.apiBaseUrl}/widget/${CONFIG.websiteId}/content?page_url=${encodeURIComponent(currentUrl)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      contentData = data;
      renderContent();
    } catch (error) {
      console.error('PIVOT Widget Error:', error);
      contentEl.innerHTML = `
        <div class="pivot-error">
          ⚠️ Unable to load content. Please try again.
        </div>
        <div class="pivot-empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>Content not available</p>
        </div>
      `;
    }
  }

  function renderContent() {
    const contentEl = modal.querySelector('.pivot-content');
    
    if (!contentData || !contentData.sections || contentData.sections.length === 0) {
      contentEl.innerHTML = `
        <div class="pivot-empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p>No content available for this page</p>
        </div>
      `;
      return;
    }

    const sections = contentData.sections;
    const section = sections[currentSectionIndex];

    let content = '';

    // Language selector
    if (currentTab === 'video' || currentTab === 'audio') {
      const items = currentTab === 'video' ? section.videos : section.audios;
      if (items && items.length > 0) {
        const languages = [...new Set(items.map(item => item.language))];
        content += `
          <div class="pivot-language-selector">
            <select id="pivot-language-select">
              ${languages.map(lang => `
                <option value="${lang}" ${lang === selectedLanguage ? 'selected' : ''}>
                  ${lang}
                </option>
              `).join('')}
            </select>
          </div>
        `;
      }
    }

    // Section content
    content += '<div class="pivot-section">';
    content += `<div class="pivot-section-text">${section.selected_text}</div>`;

    if (currentTab === 'video') {
      const videos = section.videos?.filter(v => v.language === selectedLanguage) || [];
      if (videos.length > 0) {
        videos.forEach(video => {
          content += `
            <video class="pivot-video-player" controls>
              <source src="${CONFIG.apiBaseUrl.replace('/api', '')}${video.video_url}" type="video/mp4">
              Your browser does not support video.
            </video>
          `;
        });
      } else {
        content += `
          <div class="pivot-empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <p>No ${selectedLanguage} video available</p>
          </div>
        `;
      }
    } else if (currentTab === 'audio') {
      const audios = section.audios?.filter(a => a.language === selectedLanguage) || [];
      if (audios.length > 0) {
        audios.forEach(audio => {
          content += `
            <audio class="pivot-audio-player" controls>
              <source src="${CONFIG.apiBaseUrl.replace('/api', '')}${audio.audio_url}" type="audio/mpeg">
              Your browser does not support audio.
            </audio>
          `;
          if (audio.captions) {
            content += `<p style="font-size: 12px; color: #999; margin-top: 8px;">${audio.captions}</p>`;
          }
        });
      } else {
        content += `
          <div class="pivot-empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
            </svg>
            <p>No ${selectedLanguage} audio available</p>
          </div>
        `;
      }
    } else if (currentTab === 'text') {
      content += '<p style="font-size: 13px; color: #888; margin-top: 12px; text-align: center;">Text translation coming soon</p>';
    }

    content += '</div>';

    // Navigation
    if (sections.length > 1) {
      content += `
        <div class="pivot-section-nav">
          <button class="pivot-nav-btn" id="pivot-prev-btn" ${currentSectionIndex === 0 ? 'disabled' : ''}>
            ← Previous
          </button>
          <button class="pivot-nav-btn" id="pivot-next-btn" ${currentSectionIndex === sections.length - 1 ? 'disabled' : ''}>
            Next →
          </button>
        </div>
        <div class="pivot-section-counter">
          Section ${currentSectionIndex + 1} of ${sections.length}
        </div>
      `;
    }

    contentEl.innerHTML = content;

    // Add event listeners
    const langSelect = contentEl.querySelector('#pivot-language-select');
    if (langSelect) {
      langSelect.onchange = (e) => {
        selectedLanguage = e.target.value;
        renderContent();
      };
    }

    const prevBtn = contentEl.querySelector('#pivot-prev-btn');
    const nextBtn = contentEl.querySelector('#pivot-next-btn');
    if (prevBtn) prevBtn.onclick = () => navigateSection(-1);
    if (nextBtn) nextBtn.onclick = () => navigateSection(1);
  }

  function navigateSection(direction) {
    currentSectionIndex += direction;
    renderContent();
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('%c🎯 PIVOT Widget Initialized', 'color: #00CED1; font-size: 14px; font-weight: bold');
    console.log('Website ID:', CONFIG.websiteId || 'Not configured');
  }

  // Public API
  window.PIVOTWidget = {
    open: () => { if (!isOpen) toggleWidget(); },
    close: () => { if (isOpen) toggleWidget(); },
    reload: () => { contentData = null; if (isOpen) loadContent(); }
  };

})();