/**
 * PIVOT Accessibility Widget v2.0
 * Complete redesign matching Figma specifications
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiBaseUrl: (() => {
      // Get the script source URL to determine the API base URL
      const scriptSrc = document.currentScript?.src || '';
      if (scriptSrc.includes('localhost')) {
        return 'http://localhost:8001/api';
      }
      // If loaded from R2 CDN, use the page's hostname instead
      if (scriptSrc.includes('r2.dev')) {
        return `${window.location.protocol}//${window.location.hostname}/api`;
      }
      // Extract domain from script source (where widget.js is hosted)
      const scriptUrl = new URL(scriptSrc);
      return `${scriptUrl.protocol}//${scriptUrl.hostname}/api`;
    })(),
    websiteId: document.currentScript?.getAttribute('data-website-id') || '',
    position: 'bottom-right'
  };

  // State
  let isOpen = false;
  let currentView = 'content'; // 'content', 'settings', 'help', 'languages'
  let currentModality = 'video'; // 'video', 'audio', 'text'
  let contentData = null;
  let currentSectionIndex = 0;
  let selectedLanguage = 'ASL (American Sign Language)';
  let playbackSpeed = 1.0;
  let textSize = 16;
  let darkMode = true;
  let highContrast = false;

  // Language data
  const SIGN_LANGUAGES = [
    {code: 'ASL', name: 'ASL (American)', flag: '🇺🇸'},
    {code: 'BSL', name: 'BSL (British)', flag: '🇬🇧'},
    {code: 'LSF', name: 'LSF (French)', flag: '🇫🇷'},
    {code: 'Auslan', name: 'Auslan (Australian)', flag: '🇦🇺'},
    {code: 'JSL', name: 'JSL (Japanese)', flag: '🇯🇵'},
    {code: 'LIBRAS', name: 'LIBRAS (Brazilian)', flag: '🇧🇷'}
  ];

  const SPOKEN_LANGUAGES = [
    {code: 'EN', name: 'English', flag: '🇺🇸'},
    {code: 'ES', name: 'Spanish', flag: '🇪🇸'},
    {code: 'FR', name: 'French', flag: '🇫🇷'},
    {code: 'DE', name: 'German', flag: '🇩🇪'},
    {code: 'ZH', name: 'Chinese', flag: '🇨🇳'},
    {code: 'JA', name: 'Japanese', flag: '🇯🇵'},
    {code: 'PT', name: 'Portuguese', flag: '🇵🇹'},
    {code: 'AR', name: 'Arabic', flag: '🇸🇦'}
  ];

  // Styles
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    .pivot-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      z-index: 999998;
      transition: all 0.2s ease;
    }
    .pivot-widget-button img {
      height: 60px;
      width: auto;
      display: block;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
    }
    .pivot-widget-button:hover {
      transform: translateY(-2px);
    }
    .pivot-widget-button:hover img {
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    }
    .pivot-widget-button.hidden {
      display: none;
    }

    /* Modal Styles */
    .pivot-widget-modal {
      position: fixed;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      width: 420px;
      max-height: 85vh;
      background: #0f0f0f;
      z-index: 999999;
      display: none;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 2px solid #00CED1;
      overflow: hidden;
    }
    .pivot-widget-modal.open {
      display: flex;
    }
    
    @media (max-width: 768px) {
      .pivot-widget-modal {
        width: 90vw;
        max-width: 420px;
        right: 5vw;
      }
    }

    /* Header */
    .pivot-header {
      padding: 16px 24px;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #00CED1;
    }
    .pivot-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .pivot-header-logo {
      font-size: 20px;
      font-weight: 800;
      color: white;
      letter-spacing: 1px;
    }
    .pivot-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .pivot-icon-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(0, 206, 209, 0.1);
      color: #00CED1;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: all 0.2s;
    }
    .pivot-icon-btn:hover {
      background: #00CED1;
      color: #1a1a1a;
    }

    /* Main Content Area */
    .pivot-main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #0f0f0f;
    }

    /* Video Container */
    .pivot-video-container {
      width: 100%;
      max-width: 100%;
      margin: 16px auto 0;
      aspect-ratio: 5 / 7;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }
    .pivot-video-player {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .pivot-no-video {
      width: 100%;
      margin: 16px auto 0;
      padding: 40px 20px;
      background: #1a1a1a;
      border-radius: 8px;
      text-align: center;
      color: #999;
      font-size: 14px;
    }
    .pivot-video-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      padding: 16px;
    }
    .pivot-progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.3);
      border-radius: 2px;
      margin-bottom: 12px;
      cursor: pointer;
    }
    .pivot-progress-fill {
      height: 100%;
      background: #00CED1;
      border-radius: 2px;
      width: 0%;
    }
    .pivot-playback-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pivot-play-btn {
      width: 40px;
      height: 40px;
      background: #00CED1;
      border: none;
      border-radius: 50%;
      color: #000;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pivot-time {
      color: white;
      font-size: 14px;
      font-weight: 500;
    }
    .pivot-speed-controls {
      display: flex;
      gap: 8px;
    }
    .pivot-speed-btn {
      padding: 4px 12px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .pivot-speed-btn.active {
      background: #00CED1;
      color: #000;
      border-color: #00CED1;
    }

    /* Text Content */
    .pivot-text-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: white;
      color: #1a1a1a;
      margin: 16px 16px 0;
      border-radius: 8px 8px 0 0;
      max-height: 200px;
    }
    .pivot-text-content p {
      font-size: 14px;
      line-height: 1.7;
      margin-bottom: 12px;
      transition: all 0.3s ease;
    }
    .pivot-text-content p.highlighted {
      background: rgba(224, 247, 250, 0.8);
      border-left: 4px solid #00CED1;
      padding-left: 12px;
      color: #1a1a1a;
    }

    /* Bottom Navigation */
    .pivot-bottom-nav {
      padding: 12px 16px;
      background: #1a1a1a;
      border-top: 2px solid #00CED1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .pivot-nav-row-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .pivot-nav-arrow {
      width: 40px;
      height: 40px;
      background: rgba(0, 206, 209, 0.1);
      border: 2px solid #00CED1;
      color: #00CED1;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .pivot-nav-arrow:hover {
      background: #00CED1;
      color: #1a1a1a;
    }
    .pivot-nav-arrow:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .pivot-modality-icons {
      display: flex;
      gap: 8px;
      flex: 1;
      justify-content: center;
    }
    .pivot-modality-btn {
      width: 44px;
      height: 44px;
      background: rgba(0, 206, 209, 0.1);
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .pivot-modality-btn.active {
      border-color: #00CED1;
      background: rgba(0, 206, 209, 0.2);
    }
    .pivot-modality-btn svg {
      width: 22px;
      height: 22px;
      color: #00CED1;
    }
    .pivot-language-btn {
      width: 100%;
      padding: 10px 16px;
      background: linear-gradient(135deg, #6B46C1 0%, #805AD5 100%);
      border: none;
      color: white;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pivot-language-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(107, 70, 193, 0.4);
    }

    /* Settings View */
    .pivot-settings-view {
      padding: 20px;
      overflow-y: auto;
    }
    .pivot-settings-section {
      margin-bottom: 32px;
    }
    .pivot-settings-title {
      color: white;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .pivot-settings-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #1a1a1a;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .pivot-settings-label {
      color: #e0e0e0;
      font-size: 15px;
    }
    .pivot-toggle {
      width: 48px;
      height: 24px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      position: relative;
      cursor: pointer;
    }
    .pivot-toggle.active {
      background: #00CED1;
    }
    .pivot-toggle-slider {
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: all 0.2s;
    }
    .pivot-toggle.active .pivot-toggle-slider {
      left: 26px;
    }
    .pivot-slider-container {
      padding: 16px;
      background: #1a1a1a;
      border-radius: 8px;
    }
    .pivot-slider {
      width: 100%;
      height: 6px;
      background: rgba(255,255,255,0.2);
      border-radius: 3px;
      -webkit-appearance: none;
      appearance: none;
    }
    .pivot-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: #00CED1;
      border-radius: 50%;
      cursor: pointer;
    }

    /* Help View */
    .pivot-help-view {
      padding: 20px;
      overflow-y: auto;
      color: white;
    }
    .pivot-help-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 24px;
      color: #00CED1;
    }
    .pivot-help-section {
      margin-bottom: 24px;
    }
    .pivot-help-section h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .pivot-help-section p {
      font-size: 15px;
      line-height: 1.7;
      color: #e0e0e0;
      margin-bottom: 12px;
    }
    .pivot-help-footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
      text-align: center;
    }
    .pivot-help-footer p {
      font-size: 14px;
      color: #999;
    }

    /* Language Sections */
    .pivot-lang-section {
      margin-bottom: 20px;
      padding: 16px;
      background: #1a1a1a;
      border-radius: 8px;
    }
    .pivot-lang-selector {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .pivot-lang-flag {
      font-size: 28px;
      flex-shrink: 0;
    }
    .pivot-lang-dropdown {
      flex: 1;
      padding: 10px 12px;
      background: #2a2a2a;
      border: 1px solid rgba(0, 206, 209, 0.3);
      border-radius: 6px;
      color: white;
      font-size: 14px;
      cursor: pointer;
    }
    .pivot-lang-dropdown:focus {
      outline: none;
      border-color: #00CED1;
    }

    /* Getting Started Steps */
    .pivot-getting-started-steps {
      padding: 20px 0;
    }
    .pivot-step {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: flex-start;
    }
    .pivot-step-number {
      width: 36px;
      height: 36px;
      background: #00CED1;
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .pivot-step-text {
      flex: 1;
      color: #e0e0e0;
      font-size: 14px;
      line-height: 1.6;
    }
    .pivot-step-text strong {
      color: white;
    }

    /* Video Speed Dropdown */
    .pivot-video-speed-selector {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 10;
    }
    .pivot-speed-dropdown {
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      color: white;
      font-size: 13px;
      cursor: pointer;
    }
    .pivot-speed-dropdown:focus {
      outline: none;
      border-color: #00CED1;
    }

    /* Audio Player */
    .pivot-audio-player {
      padding: 12px 16px;
      background: #1a1a1a;
      margin: 0 16px;
    }
    .pivot-audio-player audio {
      width: 100%;
      height: 40px;
    }

    /* Loading State */
    .pivot-loading {
      text-align: center;
      padding: 48px;
      color: #00CED1;
      font-size: 16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .pivot-video-container {
        max-width: 90%;
      }
      .pivot-text-content {
        margin: 16px;
      }
      .pivot-bottom-nav {
        flex-wrap: wrap;
        gap: 12px;
      }
      .pivot-modality-icons {
        order: 1;
        width: 100%;
      }
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // PIVOT Brand Assets from CDN
  const CDN_URL = 'https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev';
  
  // SVG Icons
  const handIcon = `<img src="${CDN_URL}/widget_asl_button_icon.svg" alt="ASL" style="width: 20px; height: 20px;" />`;
  const textIcon = `<img src="${CDN_URL}/caption_button_icon.svg" alt="Captions" style="width: 20px; height: 20px;" />`;
  const audioIcon = `<img src="${CDN_URL}/audio_button_icon.svg" alt="Audio" style="width: 20px; height: 20px;" />`;

  // Create floating button
  const button = document.createElement('button');
  button.className = 'pivot-widget-button';
  button.setAttribute('aria-label', 'Open PIVOT accessibility options');
  
  button.innerHTML = `
    <img src="${CDN_URL}/newpivotpill.png" alt="PIVOT Language Translation" />
  `;
  button.onclick = openWidget;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'pivot-widget-modal';
  modal.innerHTML = `
    <div class="pivot-header">
      <div class="pivot-header-left">
        <div class="pivot-header-logo">PI<span class="pivot-logo-v">V</span>OT</div>
      </div>
      <div class="pivot-header-right">
        <button class="pivot-icon-btn pivot-settings-btn" aria-label="Settings">⚙️</button>
        <button class="pivot-icon-btn pivot-help-btn" aria-label="Help">?</button>
        <button class="pivot-icon-btn pivot-close-btn" aria-label="Close">×</button>
      </div>
    </div>
    <div class="pivot-main-content" id="pivot-main-content">
      <div class="pivot-loading">Loading content...</div>
    </div>
  `;

  // Append to body
  document.body.appendChild(button);
  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('.pivot-close-btn').onclick = closeWidget;
  modal.querySelector('.pivot-settings-btn').onclick = showSettings;
  modal.querySelector('.pivot-help-btn').onclick = showHelp;

  // Functions
  let firstOpen = true;
  
  function openWidget() {
    isOpen = true;
    button.classList.add('hidden');
    modal.classList.add('open');
    
    if (firstOpen) {
      showGettingStarted();
      firstOpen = false;
      if (!contentData) {
        loadContent();
      }
    } else if (!contentData) {
      loadContent();
    } else {
      renderContent();
    }
  }

  function closeWidget() {
    isOpen = false;
    button.classList.remove('hidden');
    modal.classList.remove('open');
    currentView = 'content';
  }

  function showSettings() {
    currentView = 'settings';
    renderSettings();
  }

  function showHelp() {
    currentView = 'help';
    showGettingStarted();
  }

  function renderContent() {
    const mainContent = document.getElementById('pivot-main-content');
    
    if (!contentData || !contentData.sections || contentData.sections.length === 0) {
      mainContent.innerHTML = '<div class="pivot-loading">No content available for this page</div>';
      return;
    }

    const section = contentData.sections[currentSectionIndex];
    
    // Show ALL three modalities together
    const videoHTML = section.videos && section.videos.length > 0 ? `
      <div class="pivot-video-container">
        <video class="pivot-video-player" id="pivot-video" controls>
          <source src="${section.videos[0].video_url}" type="video/mp4">
        </video>
        <div class="pivot-video-speed-selector">
          <select id="speed-select" class="pivot-speed-dropdown">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>Normal</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </div>
    ` : '<div class="pivot-no-video">No video available</div>';

    const textHTML = `
      <div class="pivot-text-content" id="pivot-text-content">
        <p id="pivot-text-paragraph">${section.text_content || 'No text content available'}</p>
      </div>
    `;

    const audioHTML = section.audios && section.audios.length > 0 ? `
      <div class="pivot-audio-player">
        <audio id="pivot-audio" controls>
          <source src="${section.audios[0].audio_url}" type="audio/mpeg">
        </audio>
      </div>
    ` : '';

    const navHTML = `
      <div class="pivot-bottom-nav">
        <div class="pivot-nav-row-top">
          <button class="pivot-nav-arrow" onclick="window.PIVOTWidget.prevSection()" ${currentSectionIndex === 0 ? 'disabled' : ''}>←</button>
          <div class="pivot-modality-icons">
            <button class="pivot-modality-btn active">
              ${handIcon}
            </button>
            <button class="pivot-modality-btn active">
              ${textIcon}
            </button>
            <button class="pivot-modality-btn active">
              ${audioIcon}
            </button>
          </div>
          <button class="pivot-nav-arrow" onclick="window.PIVOTWidget.nextSection()" ${currentSectionIndex >= contentData.sections.length - 1 ? 'disabled' : ''}>→</button>
        </div>
        <button class="pivot-language-btn" onclick="window.PIVOTWidget.showLanguages()">Language Selections</button>
      </div>
    `;

    mainContent.innerHTML = videoHTML + textHTML + audioHTML + navHTML;
    
    // Setup video speed control and text highlighting
    setTimeout(() => {
      const speedSelect = document.getElementById('speed-select');
      const video = document.getElementById('pivot-video');
      const audio = document.getElementById('pivot-audio');
      const textParagraph = document.getElementById('pivot-text-paragraph');
      
      // Video speed control
      if (speedSelect && video) {
        speedSelect.onchange = () => {
          video.playbackRate = parseFloat(speedSelect.value);
        };
      }
      
      // Text highlighting during video playback
      if (video && textParagraph) {
        video.onplay = () => {
          textParagraph.style.background = 'rgba(224, 247, 250, 0.8)';
          textParagraph.style.borderLeft = '4px solid #00CED1';
          textParagraph.style.paddingLeft = '12px';
          textParagraph.style.transition = 'all 0.3s ease';
          textParagraph.style.color = '#1a1a1a';
        };
        
        video.onpause = () => {
          textParagraph.style.background = 'transparent';
          textParagraph.style.borderLeft = 'none';
          textParagraph.style.paddingLeft = '0';
          textParagraph.style.color = '#1a1a1a';
        };
      }
      
      // Text highlighting during audio playback
      if (audio && textParagraph) {
        audio.onplay = () => {
          textParagraph.style.background = 'rgba(224, 247, 250, 0.8)';
          textParagraph.style.borderLeft = '4px solid #00CED1';
          textParagraph.style.paddingLeft = '12px';
          textParagraph.style.transition = 'all 0.3s ease';
          textParagraph.style.color = '#1a1a1a';
        };
        
        audio.onpause = () => {
          textParagraph.style.background = 'transparent';
          textParagraph.style.borderLeft = 'none';
          textParagraph.style.paddingLeft = '0';
          textParagraph.style.color = '#1a1a1a';
        };
      }
    }, 0);
  }

  function renderSettings() {
    const mainContent = document.getElementById('pivot-main-content');
    mainContent.innerHTML = `
      <div class="pivot-settings-view">
        <div class="pivot-settings-section">
          <h3 class="pivot-settings-title">Text Size</h3>
          <div class="pivot-slider-container">
            <input type="range" class="pivot-slider" min="12" max="24" value="${textSize}" id="text-size-slider">
            <p style="color: white; margin-top: 8px; font-size: ${textSize}px;">Sample Text (${textSize}px)</p>
          </div>
        </div>
        
        <div class="pivot-settings-section">
          <h3 class="pivot-settings-title">Display Modes</h3>
          <div class="pivot-settings-option">
            <span class="pivot-settings-label">Dark Mode</span>
            <div class="pivot-toggle ${darkMode ? 'active' : ''}" onclick="window.PIVOTWidget.toggleDarkMode()">
              <div class="pivot-toggle-slider"></div>
            </div>
          </div>
          <div class="pivot-settings-option">
            <span class="pivot-settings-label">High Contrast</span>
            <div class="pivot-toggle ${highContrast ? 'active' : ''}" onclick="window.PIVOTWidget.toggleHighContrast()">
              <div class="pivot-toggle-slider"></div>
            </div>
          </div>
        </div>

        <div class="pivot-settings-section">
          <h3 class="pivot-settings-title">Enable Modalities</h3>
          <div class="pivot-settings-option">
            <span class="pivot-settings-label">Video (ASL)</span>
            <div class="pivot-toggle active">
              <div class="pivot-toggle-slider"></div>
            </div>
          </div>
          <div class="pivot-settings-option">
            <span class="pivot-settings-label">Audio</span>
            <div class="pivot-toggle active">
              <div class="pivot-toggle-slider"></div>
            </div>
          </div>
          <div class="pivot-settings-option">
            <span class="pivot-settings-label">Text</span>
            <div class="pivot-toggle active">
              <div class="pivot-toggle-slider"></div>
            </div>
          </div>
        </div>

        <button class="pivot-language-btn" style="width: 100%; margin-top: 24px;" onclick="window.PIVOTWidget.backToContent()">Back to Content</button>
      </div>
    `;

    // Add event listener for text size slider
    setTimeout(() => {
      const slider = document.getElementById('text-size-slider');
      if (slider) {
        slider.oninput = function() {
          textSize = parseInt(this.value);
          this.nextElementSibling.style.fontSize = textSize + 'px';
          this.nextElementSibling.textContent = `Sample Text (${textSize}px)`;
        };
      }
    }, 0);
  }

  function renderHelp() {
    const mainContent = document.getElementById('pivot-main-content');
    mainContent.innerHTML = `
      <div class="pivot-help-view">
        <h2 class="pivot-help-title">Getting Started with PIVOT</h2>
        
        <div class="pivot-help-section">
          <h3>What is PIVOT?</h3>
          <p>PIVOT provides accessibility features in three modalities:</p>
          <p><strong>Video:</strong> American Sign Language (ASL) and other sign languages</p>
          <p><strong>Audio:</strong> Text-to-speech narration in multiple languages</p>
          <p><strong>Text:</strong> Translations and captions</p>
        </div>

        <div class="pivot-help-section">
          <h3>How to Use</h3>
          <p>1. Click on any modality icon at the bottom to switch between Video, Audio, and Text</p>
          <p>2. Use the arrows to navigate between content sections</p>
          <p>3. Click "Language Selections" to choose your preferred language</p>
          <p>4. Adjust settings using the gear icon in the header</p>
        </div>

        <div class="pivot-help-section">
          <h3>Video Controls</h3>
          <p>• Click play/pause button to control video playback</p>
          <p>• Select playback speed (0.5x to 1.5x)</p>
          <p>• Drag the progress bar to skip to different parts</p>
        </div>

        <div class="pivot-help-footer">
          <p>Need help? Contact us at <strong>support@gopivot.me</strong></p>
          <p style="margin-top: 16px;">Powered by <strong>dozanu innovations</strong></p>
        </div>

        <button class="pivot-language-btn" style="width: 100%; margin-top: 24px;" onclick="window.PIVOTWidget.backToContent()">Back to Content</button>
      </div>
    `;
  }

  function showGettingStarted() {
    const mainContent = document.getElementById('pivot-main-content');
    mainContent.innerHTML = `
      <div class="pivot-help-view">
        <h2 class="pivot-help-title">Getting Started:</h2>
        
        <div class="pivot-getting-started-steps">
          <div class="pivot-step">
            <div class="pivot-step-number">1</div>
            <div class="pivot-step-text">
              <strong>Select which modality below you want to display:</strong><br>
              Video, Audio, Text
            </div>
          </div>
          
          <div class="pivot-step">
            <div class="pivot-step-number">2</div>
            <div class="pivot-step-text">
              <strong>Click on 'Language Selections' button below</strong><br>
              to pick your language combinations.
            </div>
          </div>
          
          <div class="pivot-step">
            <div class="pivot-step-number">3</div>
            <div class="pivot-step-text">
              <strong>Click on any text on the webpage</strong><br>
              to your left and get started.
            </div>
          </div>
        </div>

        <div class="pivot-bottom-nav" style="margin-top: 24px;">
          <div class="pivot-nav-row-top">
            <button class="pivot-nav-arrow" disabled>←</button>
            <div class="pivot-modality-icons">
              <button class="pivot-modality-btn active">${handIcon}</button>
              <button class="pivot-modality-btn active">${textIcon}</button>
              <button class="pivot-modality-btn active">${audioIcon}</button>
            </div>
            <button class="pivot-nav-arrow" onclick="window.PIVOTWidget.backToContent()">→</button>
          </div>
          <button class="pivot-language-btn" onclick="window.PIVOTWidget.showLanguages()">Language Selections</button>
        </div>

        <div class="pivot-help-footer" style="margin-top: 24px;">
          <p>Email <strong>support@gopivot.me</strong> for feedback and/or support.</p>
          <p style="margin-top: 12px;">Powered by <strong>dozanu innovations</strong></p>
        </div>
      </div>
    `;
  }

  function showLanguages() {
    const mainContent = document.getElementById('pivot-main-content');
    
    let html = `
      <div style="padding: 20px; overflow-y: auto; max-height: 70vh;">
        <h3 style="color: white; margin-bottom: 20px; font-size: 18px;">Available Language Selections</h3>
        
        <div class="pivot-lang-section">
          <h4 style="color: white; font-size: 16px; margin-bottom: 12px;">Video:</h4>
          <div class="pivot-lang-selector">
            <span class="pivot-lang-flag">🇺🇸</span>
            <select class="pivot-lang-dropdown">
              <option>American Sign Language (ASL)</option>
              <option>British Sign Language (BSL)</option>
              <option>French Sign Language (LSF)</option>
              <option>Australian Sign Language (Auslan)</option>
            </select>
          </div>
        </div>

        <div class="pivot-lang-section">
          <h4 style="color: white; font-size: 16px; margin-bottom: 12px;">Text:</h4>
          <div class="pivot-lang-selector">
            <span class="pivot-lang-flag">🇪🇸</span>
            <select class="pivot-lang-dropdown">
              <option>English</option>
              <option selected>Español (Spanish)</option>
              <option>Français (French)</option>
              <option>Deutsch (German)</option>
              <option>中文 (Chinese)</option>
            </select>
          </div>
        </div>

        <div class="pivot-lang-section">
          <h4 style="color: white; font-size: 16px; margin-bottom: 12px;">Audio:</h4>
          <div class="pivot-lang-selector">
            <span class="pivot-lang-flag">🇺🇸</span>
            <select class="pivot-lang-dropdown">
              <option selected>AI English (English)</option>
              <option>AI Spanish (Spanish)</option>
              <option>AI French (French)</option>
              <option>AI German (German)</option>
              <option>AI Chinese (Chinese)</option>
            </select>
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
          <p style="color: #999; font-size: 14px;">Email <strong style="color: #00CED1;">support@gopivot.me</strong> for feedback and/or support.</p>
          <p style="color: #999; font-size: 12px; margin-top: 8px;">Powered by <strong>dozanu innovations</strong></p>
        </div>

        <button class="pivot-language-btn" style="width: 100%; margin-top: 20px;" onclick="window.PIVOTWidget.backToContent()">Back to Content</button>
      </div>
    `;
    
    mainContent.innerHTML = html;
  }

  async function loadContent() {
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}/widget/${CONFIG.websiteId}/content?page_url=${encodeURIComponent(window.location.href)}`);
      contentData = await response.json();
      renderContent();
    } catch (error) {
      console.error('Failed to load content:', error);
      document.getElementById('pivot-main-content').innerHTML = '<div class="pivot-loading">Unable to load content</div>';
    }
  }

  // Global API
  window.PIVOTWidget = {
    prevSection: () => {
      if (currentSectionIndex > 0) {
        currentSectionIndex--;
        renderContent();
      }
    },
    nextSection: () => {
      if (contentData && currentSectionIndex < contentData.sections.length - 1) {
        currentSectionIndex++;
        renderContent();
      }
    },
    showLanguages,
    showGettingStarted,
    selectLanguage: (lang) => {
      selectedLanguage = lang;
      renderContent();
    },
    backToContent: () => {
      currentView = 'content';
      renderContent();
    },
    toggleDarkMode: () => {
      darkMode = !darkMode;
      renderSettings();
    },
    toggleHighContrast: () => {
      highContrast = !highContrast;
      renderSettings();
    }
  };

})();
