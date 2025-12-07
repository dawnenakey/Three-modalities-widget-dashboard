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
  let currentView = 'content'; // 'content', 'settings', 'help', 'languages', 'instructional'
  let currentModality = 'video'; // 'video', 'audio', 'text'
  let contentData = null;
  let currentSectionIndex = 0;
  let selectedLanguage = 'ASL (American Sign Language)';
  let playbackSpeed = 1.0;
  let textSize = 16;
  let darkMode = true;
  let highContrast = false;
  let firstOpen = true;
  
  // Load preferences from localStorage
  const savedPreferences = localStorage.getItem('pivot-widget-preferences');
  let enabledModalities = {
    video: true,
    audio: true,
    text: true
  };
  let selectedLanguages = {
    video: 'ASL',
    audio: 'EN',
    text: 'EN'
  };
  
  if (savedPreferences) {
    try {
      const prefs = JSON.parse(savedPreferences);
      if (prefs.enabledModalities) enabledModalities = prefs.enabledModalities;
      if (prefs.selectedLanguages) selectedLanguages = prefs.selectedLanguages;
      if (prefs.textSize) textSize = prefs.textSize;
      if (prefs.darkMode !== undefined) darkMode = prefs.darkMode;
      if (prefs.highContrast !== undefined) highContrast = prefs.highContrast;
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  }
  
  // Save preferences to localStorage
  function savePreferences() {
    const prefs = {
      enabledModalities,
      selectedLanguages,
      textSize,
      darkMode,
      highContrast
    };
    localStorage.setItem('pivot-widget-preferences', JSON.stringify(prefs));
  }

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

    /* Modal Styles - View-Specific Dimensions */
    .pivot-widget-modal {
      position: fixed;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      width: 280px;
      max-height: 95vh;
      background: #0f0f0f;
      z-index: 999999;
      display: none;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 2px solid #00CED1;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .pivot-widget-modal.open {
      display: flex;
    }
    /* View-specific heights */
    .pivot-widget-modal.instructional-view {
      height: 881px;
    }
    .pivot-widget-modal.settings-view {
      height: 664px;
    }
    .pivot-widget-modal.getting-started-view {
      height: 523px;
    }
    .pivot-widget-modal.languages-view {
      height: 457px;
    }
    .pivot-widget-modal.content-view {
      height: auto;
      min-height: 600px;
    }
    
    @media (max-width: 768px) {
      .pivot-widget-modal {
        width: 280px;
        max-height: 90vh;
        right: 12px;
      }
    }

    /* Header */
    .pivot-header {
      padding: 12px 16px;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #00CED1;
      flex-shrink: 0;
    }
    .pivot-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pivot-header-logo {
      font-size: 18px;
      font-weight: 800;
      color: white;
      letter-spacing: 1px;
    }
    .pivot-header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pivot-icon-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(0, 206, 209, 0.1);
      color: #00CED1;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
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
      margin: 12px auto 0;
      aspect-ratio: 5 / 7;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
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
      padding: 12px;
      background: white;
      color: #1a1a1a;
      margin: 12px 12px 0;
      border-radius: 8px 8px 0 0;
      min-height: 100px;
      max-height: 200px;
    }
    .pivot-text-content::-webkit-scrollbar {
      width: 8px;
    }
    .pivot-text-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    .pivot-text-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }
    .pivot-text-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
    .pivot-text-content p {
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 10px;
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
      padding: 10px 12px;
      background: #1a1a1a;
      border-top: 2px solid #00CED1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0;
    }
    .pivot-nav-row-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .pivot-nav-arrow {
      width: 32px;
      height: 32px;
      background: rgba(0, 206, 209, 0.1);
      border: 2px solid #00CED1;
      color: #00CED1;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
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
      gap: 10px;
      flex: 1;
      justify-content: center;
    }
    .pivot-modality-btn {
      width: 36px;
      height: 36px;
      background: rgba(0, 206, 209, 0.1);
      border: 2px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
      position: relative;
    }
    .pivot-modality-btn.active {
      border-color: #00ff00;
      background: rgba(0, 255, 0, 0.1);
      box-shadow: 0 0 12px rgba(0, 255, 0, 0.4);
    }
    .pivot-modality-btn.active::after {
      content: '';
      position: absolute;
      top: -4px;
      right: -4px;
      width: 16px;
      height: 16px;
      background: #00ff00;
      border-radius: 50%;
      border: 2px solid #0f0f0f;
    }
    .pivot-modality-btn svg {
      width: 18px;
      height: 18px;
      color: #00CED1;
    }
    .pivot-modality-btn img {
      width: 18px;
      height: 18px;
    }
    .pivot-language-btn {
      width: 100%;
      padding: 8px 12px;
      background: linear-gradient(135deg, #6B46C1 0%, #805AD5 100%);
      border: none;
      color: white;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pivot-language-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(107, 70, 193, 0.4);
    }

    /* Settings View */
    .pivot-settings-view {
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .pivot-settings-section {
      margin-bottom: 10px;
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
      padding: 12px;
      background: #1a1a1a;
      border-radius: 8px;
      margin-bottom: 10px;
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
      margin-bottom: 10px;
      padding: 12px;
      background: #1a1a1a;
      border-radius: 8px;
    }
    .pivot-lang-selector {
      display: flex;
      align-items: center;
      gap: 10px;
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
      padding: 10px 0;
    }
    .pivot-step {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
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
      padding: 8px 12px;
      background: #1a1a1a;
      margin: 0 12px;
      flex-shrink: 0;
    }
    .pivot-audio-player audio {
      width: 100%;
      height: 36px;
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
  function openWidget() {
    isOpen = true;
    button.classList.add('hidden');
    modal.classList.add('open');
    
    if (firstOpen) {
      showInstructionalVideo();
      firstOpen = false;
      // Load content in background
      if (!contentData) {
        loadContent();
      }
    } else {
      // Check if all modalities are disabled
      const activeCount = Object.values(enabledModalities).filter(v => v).length;
      if (activeCount === 0) {
        showGettingStarted();
      } else if (!contentData) {
        loadContent();
      } else {
        renderContent();
      }
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

  function showInstructionalVideo() {
    currentView = 'instructional';
    modal.className = 'pivot-widget-modal open instructional-view';
    
    const mainContent = document.getElementById('pivot-main-content');
    mainContent.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; background: #0f0f0f; gap: 10px;">
        <video 
          id="pivot-instructional-video" 
          width="100%" 
          height="auto" 
          controls 
          autoplay
          poster="${CDN_URL}/welcome-to-pivot-video-poster.png"
          style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 206, 209, 0.3);"
        >
          <source src="${CDN_URL}/welcome_to_pivot_video_instruction-NEW.mov" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <p style="color: #999; font-size: 13px; margin: 0; text-align: center;">
          Watch this quick tutorial to learn how to use PIVOT
        </p>
        <button 
          class="pivot-language-btn" 
          style="width: 80%;" 
          onclick="window.PIVOTWidget.skipToGettingStarted()"
        >
          Skip Tutorial
        </button>
      </div>
    `;
    
    // When video ends, automatically show getting started
    setTimeout(() => {
      const video = document.getElementById('pivot-instructional-video');
      if (video) {
        video.onended = () => {
          showGettingStarted();
        };
      }
    }, 100);
  }

  function renderContent() {
    currentView = 'content';
    const mainContent = document.getElementById('pivot-main-content');
    
    if (!contentData || !contentData.sections || contentData.sections.length === 0) {
      modal.className = 'pivot-widget-modal open content-view';
      mainContent.innerHTML = '<div class="pivot-loading">No content available for this page</div>';
      return;
    }

    const section = contentData.sections[currentSectionIndex];
    
    // Count active modalities
    const activeCount = Object.values(enabledModalities).filter(v => v).length;
    
    // If no modalities are enabled, show getting started
    if (activeCount === 0) {
      showGettingStarted();
      return;
    }
    
    // Apply content-view class
    modal.className = 'pivot-widget-modal open content-view';
    
    // Build content based on enabled modalities
    let contentHTML = '';
    
    // Video modality
    if (enabledModalities.video) {
      if (section.videos && section.videos.length > 0) {
        contentHTML += `
          <div class="pivot-video-container">
            <video class="pivot-video-player" id="pivot-video" controls controlsList="nodownload" disablePictureInPicture>
              <source src="${section.videos[0].video_url}" type="video/mp4">
            </video>
            <div class="pivot-video-speed-selector">
              <select id="speed-select" class="pivot-speed-dropdown">
                <option value="0.5">0.5x</option>
                <option value="1" selected>1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          </div>
        `;
      } else {
        contentHTML += '<div class="pivot-no-video">No video available</div>';
      }
    }

    // Text modality
    if (enabledModalities.text) {
      contentHTML += `
        <div class="pivot-text-content" id="pivot-text-content">
          <p id="pivot-text-paragraph">${section.text_content || 'No text content available'}</p>
        </div>
      `;
    }

    // Audio modality
    if (enabledModalities.audio && section.audios && section.audios.length > 0) {
      contentHTML += `
        <div class="pivot-audio-player">
          <audio id="pivot-audio" controls controlsList="nodownload">
            <source src="${section.audios[0].audio_url}" type="audio/mpeg">
          </audio>
        </div>
      `;
    }

    // Bottom navigation
    const navHTML = `
      <div class="pivot-bottom-nav">
        <div class="pivot-nav-row-top">
          <button class="pivot-nav-arrow" onclick="window.PIVOTWidget.prevSection()" ${currentSectionIndex === 0 ? 'disabled' : ''}>←</button>
          <div class="pivot-modality-icons">
            <button class="pivot-modality-btn ${enabledModalities.video ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModality('video')">
              ${handIcon}
            </button>
            <button class="pivot-modality-btn ${enabledModalities.text ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModality('text')">
              ${textIcon}
            </button>
            <button class="pivot-modality-btn ${enabledModalities.audio ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModality('audio')">
              ${audioIcon}
            </button>
          </div>
          <button class="pivot-nav-arrow" onclick="window.PIVOTWidget.nextSection()" ${currentSectionIndex >= contentData.sections.length - 1 ? 'disabled' : ''}>→</button>
        </div>
        <button class="pivot-language-btn" onclick="window.PIVOTWidget.showLanguages()">Language Selections</button>
      </div>
    `;

    mainContent.innerHTML = contentHTML + navHTML;
    
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
    currentView = 'settings';
    modal.className = 'pivot-widget-modal open settings-view';
    
    const mainContent = document.getElementById('pivot-main-content');
    mainContent.innerHTML = `
      <div class="pivot-settings-view" style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
        <div class="pivot-settings-section" style="margin-bottom: 10px;">
          <h3 class="pivot-settings-title">Text Size</h3>
          <div class="pivot-slider-container">
            <input type="range" class="pivot-slider" min="12" max="24" value="${textSize}" id="text-size-slider">
            <p style="color: white; margin-top: 10px; font-size: ${textSize}px;">Sample Text (${textSize}px)</p>
          </div>
        </div>
        
        <div class="pivot-settings-section" style="margin-bottom: 10px;">
          <h3 class="pivot-settings-title">Modes</h3>
          <div class="pivot-settings-option" style="margin-bottom: 10px;">
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

        <div class="pivot-settings-section" style="margin-bottom: 10px;">
          <h3 class="pivot-settings-title">Modality</h3>
          <div class="pivot-settings-option" style="margin-bottom: 10px;">
            <span class="pivot-settings-label">Video (ASL)</span>
            <div class="pivot-toggle ${enabledModalities.video ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModalityInSettings('video')">
              <div class="pivot-toggle-slider"></div>
            </div>
          </div>
          <div class="pivot-settings-option" style="margin-bottom: 10px;">
            <span class="pivot-settings-label">Audio</span>
            <div class="pivot-toggle ${enabledModalities.audio ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModalityInSettings('audio')">
              <div class="pivot-toggle-slider"></div>
            </div>
          </div>
          <div class="pivot-settings-option">
            <span class="pivot-settings-label">Text</span>
            <div class="pivot-toggle ${enabledModalities.text ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModalityInSettings('text')">
              <div class="pivot-toggle-slider"></div>
            </div>
          </div>
        </div>

        <button class="pivot-language-btn" style="width: 100%; margin-top: 10px;" onclick="window.PIVOTWidget.backToContent()">Back to Content</button>
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
    currentView = 'getting-started';
    modal.className = 'pivot-widget-modal open getting-started-view';
    
    const mainContent = document.getElementById('pivot-main-content');
    mainContent.innerHTML = `
      <div class="pivot-help-view" style="padding: 16px;">
        <h2 class="pivot-help-title" style="margin-bottom: 10px;">Getting Started:</h2>
        
        <div class="pivot-getting-started-steps" style="padding: 10px 0;">
          <div class="pivot-step" style="margin-bottom: 10px;">
            <div class="pivot-step-number">1</div>
            <div class="pivot-step-text">
              <strong>Select which modality below you want to display:</strong><br>
              Video, Audio, Text
            </div>
          </div>
          
          <div class="pivot-step" style="margin-bottom: 10px;">
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

        <div class="pivot-bottom-nav" style="margin-top: 10px;">
          <div class="pivot-nav-row-top">
            <button class="pivot-nav-arrow" disabled>←</button>
            <div class="pivot-modality-icons">
              <button class="pivot-modality-btn ${enabledModalities.video ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModality('video')">${handIcon}</button>
              <button class="pivot-modality-btn ${enabledModalities.text ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModality('text')">${textIcon}</button>
              <button class="pivot-modality-btn ${enabledModalities.audio ? 'active' : ''}" onclick="window.PIVOTWidget.toggleModality('audio')">${audioIcon}</button>
            </div>
            <button class="pivot-nav-arrow" onclick="window.PIVOTWidget.backToContent()">→</button>
          </div>
          <button class="pivot-language-btn" onclick="window.PIVOTWidget.showLanguages()">Language Selections</button>
        </div>

        <div class="pivot-help-footer" style="margin-top: 10px;">
          <p style="margin-bottom: 10px;">Email <strong>support@gopivot.me</strong> for feedback and/or support.</p>
          <p>Powered by <strong>dozanu innovations</strong></p>
        </div>
      </div>
    `;
  }

  function showLanguages() {
    currentView = 'languages';
    modal.className = 'pivot-widget-modal open languages-view';
    
    const mainContent = document.getElementById('pivot-main-content');
    
    let html = `
      <div style="padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
        <h3 style="color: white; margin: 0 0 10px 0; font-size: 16px;">Available Language Selections</h3>
        
        <div class="pivot-lang-section" style="margin-bottom: 10px; padding: 12px; background: #1a1a1a; border-radius: 8px;">
          <h4 style="color: white; font-size: 14px; margin-bottom: 10px;">Video:</h4>
          <div class="pivot-lang-selector" style="gap: 10px;">
            <span class="pivot-lang-flag">🇺🇸</span>
            <select class="pivot-lang-dropdown">
              <option>American Sign Language (ASL)</option>
              <option>British Sign Language (BSL)</option>
              <option>French Sign Language (LSF)</option>
              <option>Australian Sign Language (Auslan)</option>
            </select>
          </div>
        </div>

        <div class="pivot-lang-section" style="margin-bottom: 10px; padding: 12px; background: #1a1a1a; border-radius: 8px;">
          <h4 style="color: white; font-size: 14px; margin-bottom: 10px;">Text:</h4>
          <div class="pivot-lang-selector" style="gap: 10px;">
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

        <div class="pivot-lang-section" style="margin-bottom: 10px; padding: 12px; background: #1a1a1a; border-radius: 8px;">
          <h4 style="color: white; font-size: 14px; margin-bottom: 10px;">Audio:</h4>
          <div class="pivot-lang-selector" style="gap: 10px;">
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

        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
          <p style="color: #999; font-size: 12px; margin-bottom: 10px;">Email <strong style="color: #00CED1;">support@gopivot.me</strong> for feedback and/or support.</p>
          <p style="color: #999; font-size: 11px; margin: 0;">Powered by <strong>dozanu innovations</strong></p>
        </div>

        <button class="pivot-language-btn" style="width: 100%; margin-top: 10px;" onclick="window.PIVOTWidget.backToContent()">Back to Content</button>
      </div>
    `;
    
    mainContent.innerHTML = html;
  }

  async function loadContent() {
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}/widget/${CONFIG.websiteId}/content?page_url=${encodeURIComponent(window.location.href)}`);
      contentData = await response.json();
      // Only render if we're in content view (not instructional or getting-started)
      if (currentView === 'content') {
        renderContent();
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      // Only show error if we're in content view
      if (currentView === 'content') {
        document.getElementById('pivot-main-content').innerHTML = '<div class="pivot-loading">Unable to load content</div>';
      }
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
    skipToGettingStarted: () => {
      showGettingStarted();
    },
    selectLanguage: (lang) => {
      selectedLanguage = lang;
      renderContent();
    },
    backToContent: () => {
      currentView = 'content';
      const activeCount = Object.values(enabledModalities).filter(v => v).length;
      if (activeCount === 0) {
        showGettingStarted();
      } else {
        renderContent();
      }
    },
    toggleDarkMode: () => {
      darkMode = !darkMode;
      renderSettings();
    },
    toggleHighContrast: () => {
      highContrast = !highContrast;
      renderSettings();
    },
    toggleModality: (modality) => {
      enabledModalities[modality] = !enabledModalities[modality];
      renderContent();
    },
    toggleModalityInSettings: (modality) => {
      enabledModalities[modality] = !enabledModalities[modality];
      renderSettings();
    }
  };

})();
