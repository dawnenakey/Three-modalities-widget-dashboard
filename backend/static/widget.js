/**
 * PIVOT Accessibility Widget - Complete Redesign
 * Matches PIVOT brand design with logo, icons, and language grid
 * Version: 3.0.0
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiBaseUrl: window.location.hostname === 'localhost' 
      ? 'http://localhost:8001/api' 
      : 'https://your-production-domain.com/api',
    websiteId: document.currentScript?.getAttribute('data-website-id') || '',
    position: 'bottom-right'
  };

  // State
  let isOpen = false;
  let showLanguageGrid = false;
  let currentTab = 'video';
  let contentData = null;
  let currentSectionIndex = 0;
  let selectedLanguage = 'ASL (American Sign Language)';

  // Language data with flags (using emoji flags)
  const SIGN_LANGUAGES = [
    {code: 'ASL', name: 'ASL (American Sign Language)', flag: '🇺🇸'},
    {code: 'NZSL', name: 'NZSL (New Zealand)', flag: '🇳🇿'},
    {code: 'ISL', name: 'ISL (Icelandic)', flag: '🇮🇸'},
    {code: 'LSF', name: 'LSF (French)', flag: '🇫🇷'},
    {code: 'Auslan', name: 'Auslan (Australian)', flag: '🇦🇺'},
    {code: 'USL', name: 'USL (Ukrainian)', flag: '🇺🇦'},
    {code: 'LSM', name: 'LSM (Mexican)', flag: '🇲🇽'},
    {code: 'AFSL', name: 'AFSL (Afghanistan)', flag: '🇦🇫'},
    {code: 'RSL', name: 'RSL (Russian)', flag: '🇷🇺'},
    {code: 'BSL', name: 'BSL (British)', flag: '🇬🇧'},
    {code: 'ZGS', name: 'ZGS (Zimbabwe)', flag: '🇿🇼'},
    {code: 'KSL', name: 'KSL (Korean)', flag: '🇰🇷'},
    {code: 'LSQ', name: 'LSQ (Quebec)', flag: '🇨🇦'},
    {code: 'JSL', name: 'JSL (Japanese)', flag: '🇯🇵'},
    {code: 'TSP', name: 'TSP (Taiwan)', flag: '🇹🇼'},
    {code: 'LIBRAS', name: 'LIBRAS (Brazilian)', flag: '🇧🇷'},
    {code: 'IPSL', name: 'IPSL (Indo-Pakistani)', flag: '🇮🇳'},
    {code: 'IS', name: 'IS (Indonesian)', flag: '🇮🇩'}
  ];

  const SPOKEN_LANGUAGES = [
    {code: 'AR', name: 'Arabic', flag: '🇸🇦'},
    {code: 'ES', name: 'Spanish', flag: '🇪🇸'},
    {code: 'PT', name: 'Portuguese', flag: '🇵🇹'},
    {code: 'DE', name: 'German', flag: '🇩🇪'},
    {code: 'NO', name: 'Norwegian', flag: '🇳🇴'},
    {code: 'ZH', name: 'Chinese', flag: '🇨🇳'},
    {code: 'KO', name: 'Korean', flag: '🇰🇷'},
    {code: 'HI', name: 'Hindi', flag: '🇮🇳'},
    {code: 'ZU', name: 'Zulu', flag: '🇿🇦'},
    {code: 'RO', name: 'Romanian', flag: '🇷🇴'},
    {code: 'FR', name: 'French', flag: '🇫🇷'},
    {code: 'RU', name: 'Russian', flag: '🇷🇺'},
    {code: 'BN', name: 'Bengali', flag: '🇧🇩'},
    {code: 'UK', name: 'Ukrainian', flag: '🇺🇦'},
    {code: 'NL', name: 'Dutch', flag: '🇳🇱'},
    {code: 'HT', name: 'Haitian Creole', flag: '🇭🇹'},
    {code: 'TL', name: 'Tagalog', flag: '🇵🇭'},
    {code: 'UR', name: 'Urdu', flag: '🇵🇰'},
    {code: 'CY', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿'},
    {code: 'CS', name: 'Czech', flag: '🇨🇿'},
    {code: 'JA', name: 'Japanese', flag: '🇯🇵'},
    {code: 'VI', name: 'Vietnamese', flag: '🇻🇳'},
    {code: 'SW', name: 'Swahili', flag: '🇰🇪'},
    {code: 'SE', name: 'Swedish', flag: '🇸🇪'},
    {code: 'ID', name: 'Indonesian', flag: '🇮🇩'},
    {code: 'EN', name: 'English', flag: '🇺🇸'},
    {code: 'PL', name: 'Polish', flag: '🇵🇱'},
    {code: 'IT', name: 'Italian', flag: '🇮🇹'},
    {code: 'EL', name: 'Greek', flag: '🇬🇷'},
    {code: 'GA', name: 'Irish', flag: '🇮🇪'},
    {code: 'DA', name: 'Danish', flag: '🇩🇰'},
    {code: 'HE', name: 'Hebrew', flag: '🇮🇱'},
    {code: 'FI', name: 'Finnish', flag: '🇫🇮'},
    {code: 'GD', name: 'Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿'},
    {code: 'TR', name: 'Turkish', flag: '🇹🇷'}
  ];

  // Styles with PIVOT branding
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    .pivot-widget-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border: 2px solid #00CED1;
      border-radius: 30px;
      padding: 12px 20px;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 8px 24px rgba(0, 206, 209, 0.4);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: 'Inter', sans-serif;
    }
    .pivot-widget-button:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 206, 209, 0.6);
    }
    .pivot-logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .pivot-icons-row {
      display: flex;
      gap: 12px;
      margin-bottom: 4px;
    }
    .pivot-icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #00CED1;
      background: rgba(0, 206, 209, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.2s;
    }
    .pivot-icon-circle:hover {
      background: #00CED1;
      transform: scale(1.1);
    }
    .pivot-logo-text {
      font-size: 24px;
      font-weight: 800;
      color: white;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(0, 206, 209, 0.5);
    }
    .pivot-logo-v {
      color: #00CED1;
    }
    .pivot-logo-subtitle {
      font-size: 9px;
      color: #999;
      letter-spacing: 1px;
      margin-top: -4px;
    }
    
    .pivot-widget-modal {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 450px;
      max-width: calc(100vw - 48px);
      max-height: 700px;
      background: #1a1a1a;
      border-radius: 20px;
      border: 2px solid #00CED1;
      box-shadow: 0 20px 60px rgba(0, 206, 209, 0.4);
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
        transform: translateY(30px) scale(0.95);
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
      padding: 20px;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #00CED1;
    }
    .pivot-modal-title {
      font-size: 20px;
      font-weight: 800;
      margin: 0;
      color: white;
      letter-spacing: 2px;
    }
    .pivot-modal-title .v {
      color: #00CED1;
    }
    .pivot-close-btn {
      background: rgba(0, 206, 209, 0.1);
      border: 1px solid #00CED1;
      color: #00CED1;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-weight: 600;
    }
    .pivot-close-btn:hover {
      background: #00CED1;
      color: #1a1a1a;
      transform: rotate(90deg);
    }
    
    .pivot-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: #0f0f0f;
    }
    .pivot-content::-webkit-scrollbar {
      width: 8px;
    }
    .pivot-content::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    .pivot-content::-webkit-scrollbar-thumb {
      background: #00CED1;
      border-radius: 4px;
    }
    
    .pivot-section-text {
      font-size: 15px;
      line-height: 1.7;
      color: #e0e0e0;
      margin-bottom: 20px;
      padding: 16px;
      background: #1a1a1a;
      border-radius: 12px;
      border-left: 3px solid #00CED1;
    }
    
    .pivot-language-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 12px;
      margin: 20px 0;
    }
    .pivot-lang-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      background: #1a1a1a;
      border: 2px solid #333;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pivot-lang-item:hover {
      border-color: #00CED1;
      background: rgba(0, 206, 209, 0.1);
      transform: translateY(-2px);
    }
    .pivot-lang-item.active {
      border-color: #00CED1;
      background: rgba(0, 206, 209, 0.2);
    }
    .pivot-lang-flag {
      font-size: 32px;
      margin-bottom: 6px;
    }
    .pivot-lang-code {
      font-size: 11px;
      font-weight: 600;
      color: #999;
    }
    .pivot-lang-item.active .pivot-lang-code {
      color: #00CED1;
    }
    
    .pivot-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }
    .pivot-tab {
      flex: 1;
      padding: 14px 20px;
      background: #1a1a1a;
      border: 2px solid #333;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      transition: all 0.2s;
      text-align: center;
    }
    .pivot-tab:hover {
      border-color: #00CED1;
      color: #00CED1;
    }
    .pivot-tab.active {
      background: #00CED1;
      border-color: #00CED1;
      color: #1a1a1a;
      box-shadow: 0 4px 12px rgba(0, 206, 209, 0.4);
    }
    
    .pivot-video-player {
      width: 100%;
      border-radius: 12px;
      background: #000;
      border: 2px solid #2d2d2d;
      margin-bottom: 16px;
    }
    .pivot-audio-player {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .pivot-section-nav {
      display: flex;
      gap: 10px;
      margin-top: 24px;
    }
    .pivot-nav-btn {
      flex: 1;
      padding: 14px 20px;
      background: #1a1a1a;
      color: #00CED1;
      border: 2px solid #00CED1;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .pivot-nav-btn:hover {
      background: #00CED1;
      color: #1a1a1a;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 206, 209, 0.4);
    }
    .pivot-nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }
    .pivot-nav-btn:disabled:hover {
      background: #1a1a1a;
      color: #00CED1;
      box-shadow: none;
    }
    
    .pivot-section-counter {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 12px;
      font-weight: 500;
    }
    
    .pivot-empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    .pivot-empty-state svg {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      stroke: #00CED1;
      opacity: 0.5;
    }
    .pivot-empty-state p {
      font-size: 14px;
      color: #888;
    }
    
    .pivot-loading {
      text-align: center;
      padding: 60px 20px;
      color: #00CED1;
      font-size: 16px;
    }
    
    .pivot-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 16px;
      border-radius: 12px;
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .pivot-lang-selector-btn {
      width: 100%;
      padding: 14px 20px;
      background: #1a1a1a;
      border: 2px solid #00CED1;
      border-radius: 12px;
      color: #00CED1;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 20px;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .pivot-lang-selector-btn:hover {
      background: #00CED1;
      color: #1a1a1a;
    }
    
    @media (max-width: 480px) {
      .pivot-widget-modal {
        width: calc(100vw - 32px);
        right: 16px;
      }
      .pivot-widget-button {
        right: 16px;
        bottom: 16px;
      }
      .pivot-icon-circle {
        width: 32px;
        height: 32px;
        font-size: 14px;
      }
      .pivot-logo-text {
        font-size: 20px;
      }
      .pivot-language-grid {
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        gap: 8px;
      }
    }
  `;

  // Create and inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget button with logo and icons
  const button = document.createElement('button');
  button.className = 'pivot-widget-button';
  button.setAttribute('aria-label', 'Open PIVOT accessibility options');
  button.innerHTML = `
    <div class="pivot-logo-container">
      <div class="pivot-icons-row">
        <div class="pivot-icon-circle">👋</div>
        <div class="pivot-icon-circle">📄</div>
        <div class="pivot-icon-circle">🔊</div>
      </div>
      <div class="pivot-logo-text">PI<span class="pivot-logo-v">V</span>OT</div>
      <div class="pivot-logo-subtitle">Language Translation</div>
    </div>
  `;
  button.onclick = toggleWidget;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'pivot-widget-modal';
  modal.innerHTML = `
    <div class="pivot-modal-header">
      <h3 class="pivot-modal-title">PI<span class="v">V</span>OT*</h3>
      <button class="pivot-close-btn" aria-label="Close">&times;</button>
    </div>
    <div class="pivot-content">
      <div class="pivot-loading">Loading content...</div>
    </div>
  `;

  // Event listeners
  modal.querySelector('.pivot-close-btn').onclick = toggleWidget;

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

  function showLanguageSelector() {
    showLanguageGrid = true;
    renderLanguageGrid();
  }

  function renderLanguageGrid() {
    const contentEl = modal.querySelector('.pivot-content');
    const currentMode = currentTab;
    const languages = currentMode === 'video' ? SIGN_LANGUAGES : SPOKEN_LANGUAGES;
    
    let html = '<h3 style="color: #00CED1; margin-bottom: 16px; font-size: 16px;">Select Language</h3>';
    html += '<div class="pivot-language-grid">';
    
    languages.forEach(lang => {
      const isActive = selectedLanguage.includes(lang.code) || selectedLanguage.includes(lang.name);
      html += `
        <div class="pivot-lang-item ${isActive ? 'active' : ''}" data-lang="${lang.name}" data-code="${lang.code}">
          <div class="pivot-lang-flag">${lang.flag}</div>
          <div class="pivot-lang-code">${lang.code}</div>
        </div>
      `;
    });
    
    html += '</div>';
    html += `
      <button class="pivot-nav-btn" style="margin-top: 20px;" onclick="window.PIVOTWidget.backToContent()">
        ← Back to Content
      </button>
    `;
    
    contentEl.innerHTML = html;
    
    // Add click listeners
    contentEl.querySelectorAll('.pivot-lang-item').forEach(item => {
      item.onclick = () => {
        selectedLanguage = item.dataset.lang;
        showLanguageGrid = false;
        renderContent();
      };
    });
  }

  async function loadContent() {
    const contentEl = modal.querySelector('.pivot-content');
    
    if (!CONFIG.websiteId) {
      contentEl.innerHTML = '<div class="pivot-error">⚠️ Widget not configured. Missing website ID.</div>';
      return;
    }

    try {
      const currentUrl = window.location.href;
      const response = await fetch(
        `${CONFIG.apiBaseUrl}/widget/${CONFIG.websiteId}/content?page_url=${encodeURIComponent(currentUrl)}`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      contentData = data;
      renderContent();
    } catch (error) {
      console.error('PIVOT Error:', error);
      contentEl.innerHTML = `
        <div class="pivot-error">⚠️ Unable to load content</div>
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
    if (showLanguageGrid) {
      renderLanguageGrid();
      return;
    }
    
    const contentEl = modal.querySelector('.pivot-content');
    
    if (!contentData || !contentData.sections || contentData.sections.length === 0) {
      contentEl.innerHTML = `
        <div class="pivot-empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p>No content available</p>
        </div>
      `;
      return;
    }

    const section = contentData.sections[currentSectionIndex];
    let html = '';

    // Tabs
    html += '<div class="pivot-tabs">';
    html += `<button class="pivot-tab ${currentTab === 'video' ? 'active' : ''}" data-tab="video">👋 ASL</button>`;
    html += `<button class="pivot-tab ${currentTab === 'audio' ? 'active' : ''}" data-tab="audio">🔊 Audio</button>`;
    html += `<button class="pivot-tab ${currentTab === 'text' ? 'active' : ''}" data-tab="text">📝 Text</button>`;
    html += '</div>';

    // Language selector button
    html += `
      <button class="pivot-lang-selector-btn" onclick="window.PIVOTWidget.selectLanguage()">
        🌐 ${selectedLanguage} - Change Language
      </button>
    `;

    // Section text
    html += `<div class="pivot-section-text">${section.selected_text}</div>`;

    // Content based on tab
    if (currentTab === 'video') {
      const videos = section.videos?.filter(v => selectedLanguage.includes(v.language)) || [];
      if (videos.length > 0) {
        videos.forEach(video => {
          html += `
            <video class="pivot-video-player" controls>
              <source src="${CONFIG.apiBaseUrl.replace('/api', '')}${video.video_url}" type="video/mp4">
            </video>
          `;
        });
      } else {
        html += '<div class="pivot-empty-state"><p>No video available for this language</p></div>';
      }
    } else if (currentTab === 'audio') {
      const audios = section.audios?.filter(a => selectedLanguage.includes(a.language)) || [];
      if (audios.length > 0) {
        audios.forEach(audio => {
          html += `
            <audio class="pivot-audio-player" controls>
              <source src="${CONFIG.apiBaseUrl.replace('/api', '')}${audio.audio_url}" type="audio/mpeg">
            </audio>
          `;
        });
      } else {
        html += '<div class="pivot-empty-state"><p>No audio available for this language</p></div>';
      }
    } else {
      html += '<p style="color: #888; text-align: center;">Translation coming soon</p>';
    }

    // Navigation
    if (contentData.sections.length > 1) {
      html += '<div class="pivot-section-nav">';
      html += `<button class="pivot-nav-btn" ${currentSectionIndex === 0 ? 'disabled' : ''} onclick="window.PIVOTWidget.prevSection()">← Prev</button>`;
      html += `<button class="pivot-nav-btn" ${currentSectionIndex === contentData.sections.length - 1 ? 'disabled' : ''} onclick="window.PIVOTWidget.nextSection()">Next →</button>`;
      html += '</div>';
      html += `<div class="pivot-section-counter">Section ${currentSectionIndex + 1} of ${contentData.sections.length}</div>`;
    }

    contentEl.innerHTML = html;

    // Add tab listeners
    contentEl.querySelectorAll('.pivot-tab').forEach(tab => {
      tab.onclick = () => {
        currentTab = tab.dataset.tab;
        renderContent();
      };
    });
  }

  // Public API
  window.PIVOTWidget = {
    open: () => { if (!isOpen) toggleWidget(); },
    close: () => { if (isOpen) toggleWidget(); },
    reload: () => { contentData = null; if (isOpen) loadContent(); },
    selectLanguage: () => showLanguageSelector(),
    backToContent: () => { showLanguageGrid = false; renderContent(); },
    prevSection: () => { currentSectionIndex--; renderContent(); },
    nextSection: () => { currentSectionIndex++; renderContent(); }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('%c🎯 PIVOT Widget v3.0 Initialized', 'color: #00CED1; font-size: 14px; font-weight: bold');
  }

})();