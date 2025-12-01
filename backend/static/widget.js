/**
 * PIVOT Accessibility Widget
 * Embeddable accessibility solution with ASL, Audio, and Text support
 * Version: 1.0.0
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
    primaryColor: document.currentScript?.getAttribute('data-primary-color') || '#1e3a8a',
    accentColor: document.currentScript?.getAttribute('data-accent-color') || '#f97316'
  };

  // State
  let isOpen = false;
  let currentTab = 'video';
  let contentData = null;
  let currentSectionIndex = 0;
  let selectedLanguage = 'ASL (American Sign Language)';

  // Styles
  const styles = `
    .pivot-widget-button {
      position: fixed;
      ${CONFIG.position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
      ${CONFIG.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor};
      color: white;
      border: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      font-size: 24px;
    }
    .pivot-widget-button:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 32px rgba(0,0,0,0.2);
    }
    .pivot-widget-button:active {
      transform: scale(0.95);
    }
    .pivot-widget-modal {
      position: fixed;
      ${CONFIG.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
      ${CONFIG.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      width: 400px;
      max-width: calc(100vw - 48px);
      max-height: 600px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.2);
      z-index: 999998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: pivotSlideIn 0.3s ease-out;
    }
    @keyframes pivotSlideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .pivot-widget-modal.open {
      display: flex;
    }
    .pivot-modal-header {
      padding: 20px;
      background: ${CONFIG.primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pivot-modal-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pivot-close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .pivot-close-btn:hover {
      background: rgba(255,255,255,0.3);
    }
    .pivot-tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .pivot-tab {
      flex: 1;
      padding: 12px 16px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
    }
    .pivot-tab:hover {
      color: ${CONFIG.primaryColor};
      background: white;
    }
    .pivot-tab.active {
      color: ${CONFIG.primaryColor};
      border-bottom-color: ${CONFIG.primaryColor};
      background: white;
    }
    .pivot-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    .pivot-language-selector {
      margin-bottom: 16px;
    }
    .pivot-language-selector select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }
    .pivot-section {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    .pivot-section:last-child {
      border-bottom: none;
    }
    .pivot-section-text {
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 16px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .pivot-video-player {
      width: 100%;
      border-radius: 8px;
      background: #000;
      max-height: 300px;
    }
    .pivot-audio-player {
      width: 100%;
      margin-top: 8px;
    }
    .pivot-empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }
    .pivot-empty-state svg {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      opacity: 0.5;
    }
    .pivot-loading {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }
    .pivot-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .pivot-section-nav {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    .pivot-nav-btn {
      flex: 1;
      padding: 8px 16px;
      background: ${CONFIG.primaryColor};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.2s;
    }
    .pivot-nav-btn:hover {
      opacity: 0.9;
    }
    .pivot-nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .pivot-section-counter {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
    }
    @media (max-width: 480px) {
      .pivot-widget-modal {
        width: calc(100vw - 32px);
        right: 16px;
        left: 16px;
      }
      .pivot-modal-title {
        font-size: 16px;
      }
      .pivot-tab {
        padding: 10px 8px;
        font-size: 12px;
      }
    }
  `;

  // Create and inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget button
  const button = document.createElement('button');
  button.className = 'pivot-widget-button';
  button.setAttribute('aria-label', 'Open accessibility options');
  button.innerHTML = '♿';
  button.onclick = toggleWidget;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'pivot-widget-modal';
  modal.innerHTML = `
    <div class="pivot-modal-header">
      <h3 class="pivot-modal-title">
        ♿ PIVOT Accessibility
      </h3>
      <button class="pivot-close-btn" aria-label="Close">&times;</button>
    </div>
    <div class="pivot-tabs">
      <button class="pivot-tab active" data-tab="video">📹 Video</button>
      <button class="pivot-tab" data-tab="audio">🔊 Audio</button>
      <button class="pivot-tab" data-tab="text">📝 Text</button>
    </div>
    <div class="pivot-content">
      <div class="pivot-loading">Loading content...</div>
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
          ⚠️ Widget configuration error: Missing website ID. Please check your embed code.
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
          ⚠️ Unable to load accessibility content. Please try again later.
        </div>
        <div class="pivot-empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>Content not available for this page</p>
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
          <p>No accessibility content available for this page yet.</p>
        </div>
      `;
      return;
    }

    const sections = contentData.sections;
    const section = sections[currentSectionIndex];

    let content = '';

    // Language selector (for video and audio)
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
              Your browser does not support video playback.
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
              Your browser does not support audio playback.
            </audio>
          `;
          if (audio.captions) {
            content += `<p style="font-size: 12px; color: #64748b; margin-top: 8px;">${audio.captions}</p>`;
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
      content += '<p style="font-size: 14px; color: #64748b; margin-top: 8px;">Text translation coming soon. Currently showing original content.</p>';
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

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('PIVOT Widget initialized');
    console.log('Website ID:', CONFIG.websiteId);
    console.log('Position:', CONFIG.position);
  }

  // Expose public API
  window.PIVOTWidget = {
    open: () => {
      if (!isOpen) toggleWidget();
    },
    close: () => {
      if (isOpen) toggleWidget();
    },
    reload: () => {
      contentData = null;
      if (isOpen) loadContent();
    }
  };

})();