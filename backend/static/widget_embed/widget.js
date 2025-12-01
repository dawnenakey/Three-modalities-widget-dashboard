// const BASE_URL = "http://127.0.0.1:8000" // USE DURING DEV ONLY - otherwise comment this out
// Use localhost while developing, otherwise use the current site origin
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8001"
    : window.location.origin;
// USE YOUR PRODUCTION BASE URL HERE

const INSTRUCTION_VIDEO_SRC = "https://d37zces2ff5ck2.cloudfront.net/media/video/welcome_to_pivot_video_instruction.mp4"
const INSTRUCTION_AUDIO_SRC = "https://d37zces2ff5ck2.cloudfront.net/media/audio/welcome_to_pivot_audio_instruction.mp3"

const URL_WIDGET_SECTIONS = BASE_URL + "/api/v1/widget-sections/"
const BASE_STATIC_PATH = "/static/images/"
const CSS_LINK_HREF = BASE_URL + "/static/widget_embed/widget.css"
const BASE_STATIC = BASE_URL + BASE_STATIC_PATH

const ACCESS_ZANU_LOGO_SRC = BASE_STATIC + "logo.svg"
const PIVOT_TITLE_LOGO_SRC = BASE_STATIC + "pivot_logo_tm.png"
const PIVOT_LOGO_SRC = BASE_STATIC + "pivot_logo.svg"
const PIVOT_ASL_ICON_BUTTON_SRC = BASE_STATIC + "widget_asl_button_icon.svg"
const PIVOT_ACTIVE_ASL_ICON_BUTTON_SRC = BASE_STATIC + "active_widget_asl_button_icon.svg"
const PIVOT_CAPTION_BUTTON_ICON_SRC = BASE_STATIC + "caption_button_icon.svg"
const PIVOT_ACTIVE_CAPTION_BUTTON_ICON_SRC = BASE_STATIC + "active_caption_button_icon.svg"
const PIVOT_AUDIO_BUTTON_ICON_SRC = BASE_STATIC + "audio_button_icon.svg"
const PIVOT_ACTIVE_AUDIO_BUTTON_ICON_SRC = BASE_STATIC + "active_audio_button_icon.svg"
const PIVOT_SETTINGS_BUTTON_ICON_SRC = BASE_STATIC + "setting_button_icon.svg"
const PIVOT_ACTIVE_SETTINGS_BUTTON_ICON_SRC = BASE_STATIC + "active_setting_button_icon.svg"
const PIVOT_INFO_BUTTON_ICON_SRC = BASE_STATIC + "info_button_icon.svg"
const PIVOT_ACTIVE_INFO_BUTTON_ICON_SRC = BASE_STATIC + "active_info_button_icon.svg"
const PIVOT_WIDGET_GROW_ICON_SRC = BASE_STATIC + "plus.svg"
const PIVOT_WIDGET_SHRINK_ICON_SRC = BASE_STATIC + "minus.svg"
const PIVOT_INFO_VIDEO_POSTER_PLACEHOLDER = BASE_STATIC + "pivot_info_video_poster_placeholder.png"
const PIVOT_PILL_ICON_SRC = BASE_STATIC + "pivotpillicon.svg"

const ID_WIDGET_ICON_BUTTON = "widget-icon-button"
const ID_CLOSE_WIDGET_BUTTON = "close-pivot-widget-button"
const ID_PIVOT_BUTTON_ASL = "pivot-asl-button"
const ID_PIVOT_BUTTON_CC = "pivot-cc-button"
const ID_PIVOT_BUTTON_AUDIO = "pivot-audio-button"
const ID_CLOSE_SETTINGS_BUTTON = "pivot-close-settings"
const ID_OPEN_SETTINGS_BUTTON = "pivot-toggle-settings"
const ID_OPEN_INFO_BUTTON = "pivot-toggle-info"
const ID_CLOSE_INFO_BUTTON = "pivot-close-info"
const ID_PREV_CONTENT_BUTTON = "pivot-prev-content"
const ID_NEXT_CONTENT_BUTTON = "pivot-next-content"
const ID_OPEN_LANGUAGE_SELECTIONS_BUTTON = "pivot-open-language-selection"
const ID_CLOSE_LANGUAGE_SELECTIONS_BUTTON = "pivot-close-language-selection"
const ID_WIDGET_HANDLE_ID = "pivot-widget-handle"
const ID_WIDGET_TOP_BAR = "pivot-secondary-widget-handle"
const ID_WIDGET_GROW_BUTTON = "pivot-widget-grow-button"
const ID_WIDGET_SHRINK_BUTTON = "pivot-widget-shrink-button"
const ID_MULTIPLE_TARGET_TEXT_SWITCHER_BUTTON = "pivot-multiple-target-text-switcher"
const ID_ACTIVE_ASL_ICON = "pivot-asl-active-icon"
const ID_ACTIVE_CC_ICON = "pivot-cc-active-icon"
const ID_ACTIVE_AUDIO_ICON = "pivot-audio-active-icon"
const ID_DEFAULT_ASL_ICON = "pivot-asl-default-icon"
const ID_DEFAULT_CC_ICON = "pivot-cc-default-icon"
const ID_DEFAULT_AUDIO_ICON = "pivot-audio-default-icon"

const ID_CONTENT_PAGE = "pivot-content-wrapper"
const ID_ASL_CONTENT_CONTAINER = "pivot-asl-content-container"
const ID_CAPTION_CONTENT_CONTAINER = "pivot-caption-content-container"
const ID_AUDIO_CONTENT_CONTAINER = "pivot-audio-content-container"
const ID_PIVOT_INFO_PAGE = "pivot-info-container"
const ID_PIVOT_SETTINGS_PAGE = "pivot-settings-container"
const ID_LANGUAGE_SELECTION_PAGE = "pivot-language-selection-container"
const ID_INSTRUCTION_PAGE = "pivot-instruction-page-container"
const ID_BOTTOM_BUTTON_CONTAINER = "pivot-bottom-button-container"
const ID_HINT_CONTAINER = "pivot-hint-container"

const ID_INSTRUCTION_VIDEO = "pivot-video-instruction-container"
const ID_INSTRUCTION_AUDIO = "pivot-audio-instruction-container"
const ID_INSTRUCTION_CAPTION = "pivot-caption-instruction-container"

const ID_INSTRUCTION_VIDEO_ELEMENT = "pivot-video-instruction"
const ID_INSTRUCTION_AUDIO_ELEMENT = "pivot-audio-instruction"

const ID_ASL_SRC = "pivot-asl-src"
const ID_CAPTIONS = "pivot-captions"
const ID_AUDIO_SRC = "pivot-audio-src"
const ID_SELECT_SIGN_LANGUAGE = "pivot-select-sign-language"
const ID_SELECT_TRANSCRIPT_LANGUAGE = "pivot-select-transcript-language"
const ID_SELECT_AUDIO_LANGUAGE = "pivot-select-audio-language"
const ID_TEXT_SIZE_INPUT = "pivot-text-size-input"
const ID_CONTRAST_INPUT = "pivot-contrast-input"
const ID_DARK_MODE_INPUT = "pivot-dark-mode-input"

const ID_WIDGET = "pivot-widget"

// add non content pages to this list after defining above
const NON_CONTENT_PAGE_IDS = [ID_PIVOT_SETTINGS_PAGE, ID_PIVOT_INFO_PAGE, ID_LANGUAGE_SELECTION_PAGE]

const NO_CAPTIONS_MESSAGE = "NO CAPTIONS FOUND"
const NO_AUDIO_MESSAGE = "NO AUDIO FOUND"
const NO_ASL_MESSAGE = "NO ASL VIDEO FOUND"

var checkedForContent = false
var widgetActivatedForTheFirstTime = false
var appendedInstructionContent = false
var instructionsShownForTheFirstTime = false

var currentResult = []
var currentResultIndex = 0

var target_caption_font_class = "text-lg"

var current_sign_language = ""
var current_transcript_language = ""
var current_audio_language = ""
var add_contrast_classes = false
var found_text = ""
var dark_mode = false


// --------------------------------------------------------------------------------------------------
// ----- HTML Element variables -----
// --------------------------------------------------------------------------------------------------

var widgetIconButton = convertStringToHTML(`
    <button id=${ID_WIDGET_ICON_BUTTON} aria-label="PIVOT" class="fixed z-[99999] bottom-0 right-0 bg-[#051a1f] w-[80px] h-[80px] mb-[35px] mr-[35px] border-2 border-[#21d4b4] rounded-full">
        <img class="w-full h-auto pt-1" src="${PIVOT_PILL_ICON_SRC}" alt="Pill Icon">
    </button>
`)


var widget = convertStringToHTML(`
    <div id="pivot-widget-fixed-container">
        <div id=${ID_WIDGET} class="items-stretch hidden flex flex-col bg-white shadow-xl border-[#212121] border-4 rounded-lg">
            <div class="pivot-resizable-handle pivot-nw"></div>
            <div class="hidden pivot-resizable-handle pivot-ne"></div>
            <div class="hidden pivot-resizable-handle pivot-sw"></div>
            <div class="hidden pivot-resizable-handle pivot-se"></div>
            
            <div class="flex flex-col h-full justify-between">
                <div id=${ID_WIDGET_TOP_BAR} class="min-h-[50px] items-stretch w-full flex flex-row bg-[#212121] justify-between p-2 pt-2">
                    <div class="p-2 h-[40px] w-auto flex items-center">
                        <img class="h-[25px] w-auto object-contain" src="${PIVOT_TITLE_LOGO_SRC}" alt="Pivot Title Logo">
                    </div>
                    <div class="w-full flex flex-row gap-x-2 items-center justify-between">
                        <button id=${ID_WIDGET_SHRINK_BUTTON} class="mobile-resize-button cursor-pointer rounded-full h-full w-3/5">
                            <img class="w-full h-full object-contain pt-1" src="${PIVOT_WIDGET_SHRINK_ICON_SRC}" alt="shrink widget button">
                        </button>
                        <button id=${ID_WIDGET_GROW_BUTTON} class="mobile-resize-button cursor-pointer rounded-full h-full w-3/5">
                            <img class="w-full h-full object-contain pt-1" src="${PIVOT_WIDGET_GROW_ICON_SRC}" alt="grow widget button">
                        </button>
                        <button id=${ID_OPEN_SETTINGS_BUTTON} class="flex items-center cursor-pointer rounded-full h-full w-3/5">
                            <img class="w-full h-full object-contain pt-1" src="${PIVOT_SETTINGS_BUTTON_ICON_SRC}" alt="settings button">
                            <img id="settings-icon-default" class="w-full h-full object-contain pt-1" src="${PIVOT_SETTINGS_BUTTON_ICON_SRC}" alt="settings button">
                            <img id="settings-icon-active" class="hidden w-full h-full object-contain pt-1" src="${PIVOT_ACTIVE_SETTINGS_BUTTON_ICON_SRC}" alt="active settings button">
                        </button>
                        <button id=${ID_OPEN_INFO_BUTTON} class=" flex items-center cursor-pointer rounded-full h-full w-3/5">
                            <img class="w-full h-full object-contain pt-1" src="${PIVOT_INFO_BUTTON_ICON_SRC}" alt="settings button">
                            <img id="info-icon-default" class="w-full h-full object-contain pt-1" src="${PIVOT_INFO_BUTTON_ICON_SRC}" alt="info button">
                            <img id="info-icon-active" class="hidden w-full h-full object-contain pt-1" src="${PIVOT_ACTIVE_INFO_BUTTON_ICON_SRC}" alt="active info button">
                        </button>
                        <button id=${ID_CLOSE_WIDGET_BUTTON} class="w-3/5 h-full flex items-center text-lg text-white cursor-pointer">
                            <svg class="w-full h-full object-contain pt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>   
                    </div>
                </div>
                <div class="w-full h-full py-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                    <div id=${ID_PIVOT_INFO_PAGE} class="hidden pivot-widget-page flex flex-col gap-y-1 h-fit px-4">
                        <div class="w-full flex flex-row justify-between">
                            <div class="leading-none">
                                <p class="text-xs font-bold">How to use this?</p>
                                <p class="text-xs">Video, audio, and text instructions below.</p>
                            </div>
                            <button id=${ID_CLOSE_INFO_BUTTON} class="float-right cursor-pointer">&#10005;</button>
                        </div>
                        <div class="flex flex-col">
                            <div class="pivot-widget-page w-full">
                                <div class="h-full w-auto py-1">
                                    <video id=${ID_INSTRUCTION_VIDEO_ELEMENT} controls playsInline src=${INSTRUCTION_VIDEO_SRC} class="w-full" poster=${PIVOT_INFO_VIDEO_POSTER_PLACEHOLDER}></video>
                                </div>
                                <div class="h-1/5 w-full px-4">
                                    <audio id=${ID_INSTRUCTION_AUDIO_ELEMENT} controls src=${INSTRUCTION_AUDIO_SRC} class="w-full pivot-audio"></audio>
                                </div>
                                <div id=${ID_INSTRUCTION_CAPTION} class="h-max w-full px-2 py-3 flex flex-col gap-y-2">
                                    <p>Welcome to PIVOT!</p>
                                    <p>Your language access technology designed to enhance your experience on this website. PIVOT offers three modules: video, transcript, and audio.</p>
                                    <p>To get started, simply select any text blurb, and the translation will appear here in video, audio, or text formats.</p>
                                    <p>You can move, resize, or customize me. You can adjust more features such as color contrast, font size, and language preferences using the settings button, the one with gear icon.</p>
                                    <p>We're here to make your browsing experience seamless and accessible—enjoy exploring!</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <p class="text-lg font-bold">Share your feedback!</p>
                            <p>
                                Have feedback on how we can improve your user experience? Let us know!
                                <a class="underline" href="mailto:feedback@accesszanu.com">feedback@accesszanu.com</a>
                            </p>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <p class="text-lg font-bold">Help Center</p>
                            <p>
                                Questions, comments, or need assistance navigating? Get in touch here
                                <a class="underline" href="mailto:support@accesszanu.com">support@accesszanu.com</a>
                            </p>
                        </div>
                    </div>
                    <div id=${ID_PIVOT_SETTINGS_PAGE} class="hidden pivot-widget-page flex flex-col gap-y-2 h-full my-1 px-4">
                        <div class="w-full">
                            <div id=${ID_CLOSE_SETTINGS_BUTTON} class="float-right cursor-pointer">&#10005;</div>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <p class="text-lg font-bold">Settings</p>
                            <p>Here you can adjust settings to fit your needs.</p>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <p class="text-lg font-bold">Text</p>
                            <div class="flex flex-row justify-between">
                                <p class="tex-sm">Aa</p>
                                <p class="text-lg">Aa</p>
                                <p class="text-xl">Aa</p>
                                <p class="text-2xl">Aa</p>
                            </div>
                            <input id=${ID_TEXT_SIZE_INPUT} value="2" type="range" min="1" max="4" step="1" />
                        </div>
                        <div class="flex flex-col gap-y-4 pb-4">
                            <p class="text-lg font-bold">Color</p>
                            <div>
                                <input type="checkbox" id=${ID_CONTRAST_INPUT} name="contrast" />
                                <label for="contrast">High Contrast</label>
                            <p class="text-lg font-bold">Modes</p>
                            <div class="flex items-center justify-between">
                                <label for=${ID_DARK_MODE_INPUT} class="cursor-pointer">Dark Mode</label>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id=${ID_DARK_MODE_INPUT} name="dark_mode" class="sr-only peer" />
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#21d4b4]"></div>
                                </label>
                            </div>
                            <div>
                                <input type="checkbox" id=${ID_DARK_MODE_INPUT} name="dark_mode" />
                                <label for="dark_mode" >Dark Mode</label>
                            <div class="flex items-center justify-between">
                                <label for=${ID_CONTRAST_INPUT} class="cursor-pointer">High Contrast</label>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id=${ID_CONTRAST_INPUT} name="contrast" class="sr-only peer" />
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#21d4b4]"></div>
                                </label>
                            </div>
                        </div>
                        <div class="flex flex-col gap-y-2 mt-auto">
                            <p class="text-lg font-bold">Modality</p>
                            <p class="text-sm text-gray-600">Select which content types to display:</p>
                            <div class="flex flex-col gap-y-2">
                                <div class="flex items-center gap-x-2">
                                    <input type="checkbox" id="settings-asl-toggle" class="content-type-checkbox" />
                                    <label for="settings-asl-toggle" class="cursor-pointer">Video</label>
                                </div>
                                <div class="flex items-center gap-x-2">
                                    <input type="checkbox" id="settings-audio-toggle" class="content-type-checkbox" />
                                    <label for="settings-audio-toggle" class="cursor-pointer">Audio</label>
                                </div>
                                <div class="flex items-center gap-x-2">
                                    <input type="checkbox" id="settings-text-toggle" class="content-type-checkbox" />
                                    <label for="settings-text-toggle" class="cursor-pointer">Text</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id=${ID_LANGUAGE_SELECTION_PAGE} class="hidden pivot-widget-page flex flex-col gap-y-2 bg-transparent h-full my-1 p-4">
                        <div class="w-full">
                            <div id=${ID_CLOSE_LANGUAGE_SELECTIONS_BUTTON} class="float-right cursor-pointer">&#10005;</div>
                        </div>
                        <div class="flex flex-col gap-y-2 mb-2">
                            <p class="text-lg font-bold">Available Language Selections:</p>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <p class="text-lg font-bold">Video</p>
                            <select id=${ID_SELECT_SIGN_LANGUAGE} class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-transparent py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                            </select>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <p class="text-lg font-bold">Transcript</p>
                            <p class="text-lg font-bold">Text</p>
                            <select id=${ID_SELECT_TRANSCRIPT_LANGUAGE} class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-transparent py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                            </select>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <p class="text-lg font-bold">Audio</p>
                            <select id=${ID_SELECT_AUDIO_LANGUAGE} class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-transparent py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                            </select>
                        </div>
                    </div>
                    <div id=${ID_CONTENT_PAGE} class="pivot-widget-page w-full h-full">
                        <div id=${ID_HINT_CONTAINER} class="h-[100%] flex flex-col items-center justify-between">
                            <div class="hint-message-bubble hint-left-triangle">
                                <div class="hint-message-content">
                                    Click text on the page to get started.
                                </div>
                            </div>
                            <div class="hint-message-bubble hint-bottom-center-triangle">
                                <div class="hint-message-content">
                                    Select which media module(s) you would like to use.
                                </div>
                            </div>
                        </div>
                        <div id=${ID_ASL_CONTENT_CONTAINER} class="hidden w-full min-h-[40%] flex justify-center pb-2"></div>
                        <div id=${ID_CAPTION_CONTENT_CONTAINER} class="hidden h-fit w-full p-4"></div>
                        <div id=${ID_AUDIO_CONTENT_CONTAINER} class="hidden w-full p-4 min-[10%]"></div>
                    </div>
                </div>
                <div id=${ID_BOTTOM_BUTTON_CONTAINER} class="w-full pivot-widget-bottom-button-container">
                    <div class="h-[55%] w-full p-2 flex flex-row justify-between items-stretch gap-x-0.5 md:gap-x-2">
                        <button id=${ID_PREV_CONTENT_BUTTON} class="cursor-pointer aspect-square w-1/5" style="visibility: hidden;">
                            <div class="flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                                <p class="text-xs">prev</p>
                            </div>
                        </button>
                        <button id=${ID_PIVOT_BUTTON_ASL} class="rounded-full cursor-pointer aspect-square h-4/5 md:h-full w-1/5 bg-[#0d1c1c]">
                            <img id=${ID_DEFAULT_ASL_ICON} class="w-full h-full pt-1" src="${PIVOT_ASL_ICON_BUTTON_SRC}" alt="sign language button icon">
                            <img id=${ID_ACTIVE_ASL_ICON} class="hidden w-full h-full pt-1" src="${PIVOT_ACTIVE_ASL_ICON_BUTTON_SRC}" alt="active sign language button icon">
                        </button>
                        <button id=${ID_PIVOT_BUTTON_CC} class="rounded-full cursor-pointer aspect-square h-4/5 md:h-full w-1/5 bg-[#0d1c1c]">
                            <img id=${ID_DEFAULT_CC_ICON} class="w-full h-full pt-1" src="${PIVOT_CAPTION_BUTTON_ICON_SRC}" alt="caption button icon">
                            <img id=${ID_ACTIVE_CC_ICON} class="hidden w-full h-full pt-1" src="${PIVOT_ACTIVE_CAPTION_BUTTON_ICON_SRC}" alt="active caption button icon">
                        </button>
                        <button id=${ID_PIVOT_BUTTON_AUDIO} class="rounded-full cursor-pointer aspect-square h-4/5 md:h-full w-1/5 bg-[#0d1c1c]">
                            <img id=${ID_DEFAULT_AUDIO_ICON} class="w-full h-full pt-1" src="${PIVOT_AUDIO_BUTTON_ICON_SRC}" alt="audio button icon">
                            <img id=${ID_ACTIVE_AUDIO_ICON} class="hidden w-full h-full pt-1" src="${PIVOT_ACTIVE_AUDIO_BUTTON_ICON_SRC}" alt="active audio button icon">
                        </button>
                        <button id=${ID_NEXT_CONTENT_BUTTON} class="cursor-pointer aspect-square w-1/5" style="visibility: hidden;">
                            <div class="flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                                <p class="text-xs">next</p>
                            </div>
                        </button>
                    </div>
                    <div class="h-[35%] items-stretch w-full flex justify-center p-2">
                        <div class="w-full h-full flex items-stretch justify-center">
                            <button id=${ID_OPEN_LANGUAGE_SELECTIONS_BUTTON} class="flex items-center justify-center h-full w-9/12 cursor-pointer rounded-full bg-[#051a1f] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1ed2b3] hover:text-[#051a1f]">
                                
                                <p id="open_language_button_text">
                                    Language Selections
                                </p>
            
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`)


// --------------------------------------------------------------------------------------------------
// INITIALIZATIONS
// --------------------------------------------------------------------------------------------------

const hostElement = document.createElement('div')
hostElement.id = 'pivot-shadow-host'
document.documentElement.appendChild(hostElement)


const linkCss = document.createElement('link')
linkCss.rel = 'stylesheet'
linkCss.type = 'text/css'
linkCss.href = CSS_LINK_HREF


// For Shadow DOM reference refer to: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM
const shadow = hostElement.attachShadow({ mode: "open" }) // shadow DOM

// Elements are appended to the shadow instead of the DOM to allow the widget logic and styling to be encapsulated
shadow.append(linkCss)
shadow.append(widgetIconButton)
shadow.append(widget)


// widget UI color
// updates the dark mode variable depending on the theme preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    dark_mode = true
} else {
    dark_mode = false
}
updateDarkModeStyling()

// widget drag and resize functionality
dragWidget(ID_WIDGET, ID_WIDGET)
enableWidgetResizeFunctionality(ID_WIDGET)


// --------------------------------------------------------------------------------------------------
// ----- SHADOW DOM Event Listeners -----
// --------------------------------------------------------------------------------------------------

hostElement.shadowRoot.querySelector("#" + ID_CLOSE_WIDGET_BUTTON).addEventListener("click", function () {
    closeWidget()
    toggleHiddenOnExistingHighlightedSpan()
})


hostElement.shadowRoot.querySelector("#" + ID_WIDGET_ICON_BUTTON).addEventListener("click", function () {
    openWidget()
    toggleHiddenOnExistingHighlightedSpan()
    checkIfShowInstructionPage()
})


hostElement.shadowRoot.querySelector("#" + ID_OPEN_INFO_BUTTON).addEventListener("click", function () {
    openTargetPageHideContent(ID_PIVOT_INFO_PAGE)
    // Activate info icon
    hostElement.shadowRoot.querySelector("#info-icon-default").classList.add("hidden")
    hostElement.shadowRoot.querySelector("#info-icon-active").classList.remove("hidden")
    // Deactivate settings icon
    hostElement.shadowRoot.querySelector("#settings-icon-default").classList.remove("hidden")
    hostElement.shadowRoot.querySelector("#settings-icon-active").classList.add("hidden")
})


hostElement.shadowRoot.querySelector("#" + ID_CLOSE_INFO_BUTTON).addEventListener("click", function () {
    closeInfoPageAndPauseMediaIfPlaying()
    // Deactivate info icon
    hostElement.shadowRoot.querySelector("#info-icon-default").classList.remove("hidden")
    hostElement.shadowRoot.querySelector("#info-icon-active").classList.add("hidden")
})

// Sync checkboxes when buttons are toggled
const syncSettingsCheckboxes = () => {
    const aslButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_ASL);
    const audioButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_AUDIO);
    const textButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_CC);
    const aslCheckbox = hostElement.shadowRoot.querySelector("#settings-asl-toggle");
    const audioCheckbox = hostElement.shadowRoot.querySelector("#settings-audio-toggle");
    const textCheckbox = hostElement.shadowRoot.querySelector("#settings-text-toggle");
    
    if (aslButton && aslCheckbox) {
        aslCheckbox.checked = aslButton.classList.contains("active-pivot-button");
    }
    if (audioButton && audioCheckbox) {
        audioCheckbox.checked = audioButton.classList.contains("active-pivot-button");
    }
    if (textButton && textCheckbox) {
        textCheckbox.checked = textButton.classList.contains("active-pivot-button");
    }
};

hostElement.shadowRoot.querySelector("#" + ID_OPEN_SETTINGS_BUTTON).addEventListener("click", function () {
    openTargetPageHideContent(ID_PIVOT_SETTINGS_PAGE)
    setTimeout(syncSettingsCheckboxes, 100);
    // Activate settings icon
    hostElement.shadowRoot.querySelector("#settings-icon-default").classList.add("hidden")
    hostElement.shadowRoot.querySelector("#settings-icon-active").classList.remove("hidden")
    // Deactivate info icon
    hostElement.shadowRoot.querySelector("#info-icon-default").classList.remove("hidden")
    hostElement.shadowRoot.querySelector("#info-icon-active").classList.add("hidden")
})


hostElement.shadowRoot.querySelector("#" + ID_CLOSE_SETTINGS_BUTTON).addEventListener("click", function () {
    closeTargetPageShowContent(ID_PIVOT_SETTINGS_PAGE)
    // Deactivate settings icon
    hostElement.shadowRoot.querySelector("#settings-icon-default").classList.remove("hidden")
    hostElement.shadowRoot.querySelector("#settings-icon-active").classList.add("hidden")
})

// Settings page content type checkboxes
hostElement.shadowRoot.querySelector("#settings-asl-toggle").addEventListener("change", function () {
    const aslButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_ASL);
    const isActive = aslButton.classList.contains("active-pivot-button");
    if (this.checked && !isActive) {
        aslButton.click();
    } else if (!this.checked && isActive) {
        aslButton.click();
    }
});
hostElement.shadowRoot.querySelector("#settings-audio-toggle").addEventListener("change", function () {
    const audioButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_AUDIO);
    const isActive = audioButton.classList.contains("active-pivot-button");
    if (this.checked && !isActive) {
        audioButton.click();
    } else if (!this.checked && isActive) {
        audioButton.click();
    }
});
hostElement.shadowRoot.querySelector("#settings-text-toggle").addEventListener("change", function () {
    const textButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_CC);
    const isActive = textButton.classList.contains("active-pivot-button");
    if (this.checked && !isActive) {
        textButton.click();
    } else if (!this.checked && isActive) {
        textButton.click();
    }
});

hostElement.shadowRoot.querySelector("#" + ID_OPEN_LANGUAGE_SELECTIONS_BUTTON).addEventListener("click", function () {
    openTargetPageHideContent(ID_LANGUAGE_SELECTION_PAGE)
    updateLanguageSettingSelectOptions()
})


hostElement.shadowRoot.querySelector("#" + ID_CLOSE_LANGUAGE_SELECTIONS_BUTTON).addEventListener("click", function () {
    closeTargetPageShowContent(ID_LANGUAGE_SELECTION_PAGE)
})


hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_ASL).addEventListener("click", function () {
    handleASLButtonClick()
    toggleActiveButtonStyling(this)
})


hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_CC).addEventListener("click", function () {
    handleCCButtonClick()
    toggleActiveButtonStyling(this)
})


hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_AUDIO).addEventListener("click", function () {
    handleAudioButtonClick()
    toggleActiveButtonStyling(this)
})


hostElement.shadowRoot.querySelector("#" + ID_PREV_CONTENT_BUTTON).addEventListener("click", function () {
    loadPrevContent()
    hideOrShowPrevAndNextButtons()
})


hostElement.shadowRoot.querySelector("#" + ID_NEXT_CONTENT_BUTTON).addEventListener("click", function () {
    loadNextContent()
    hideOrShowPrevAndNextButtons()
})


hostElement.shadowRoot.querySelector("#" + ID_WIDGET_SHRINK_BUTTON).addEventListener("click", function () {
    handleWidgetSizeChange("shrink")
})


hostElement.shadowRoot.querySelector("#" + ID_WIDGET_GROW_BUTTON).addEventListener("click", function () {
    handleWidgetSizeChange("grow")
})


hostElement.shadowRoot.querySelector("#" + ID_SELECT_SIGN_LANGUAGE).addEventListener("change", function () {
    getLanguageSelectionValue(this.id)
    updateNewContentFromResultIndex(currentResultIndex)
})


hostElement.shadowRoot.querySelector("#" + ID_SELECT_TRANSCRIPT_LANGUAGE).addEventListener("change", function () {
    getLanguageSelectionValue(this.id)
    updateNewContentFromResultIndex(currentResultIndex)
})


hostElement.shadowRoot.querySelector("#" + ID_SELECT_AUDIO_LANGUAGE).addEventListener("change", function () {
    getLanguageSelectionValue(this.id)
    updateNewContentFromResultIndex(currentResultIndex)
})


hostElement.shadowRoot.querySelector("#" + ID_TEXT_SIZE_INPUT).addEventListener("change", function () {
    handleFontSizeChange(this.value)
})


hostElement.shadowRoot.querySelector("#" + ID_CONTRAST_INPUT).addEventListener("change", function () {
    handleHighContrastInputSelection(this)
    updateContrastStyling()
})


hostElement.shadowRoot.querySelector("#" + ID_DARK_MODE_INPUT).addEventListener("change", function () {
    handleDarkModeInputSelection(this)
    updateDarkModeStyling()
})


// --------------------------------------------------------------------------------------------------
// ----- DOCUMENT Event Listeners -----
// --------------------------------------------------------------------------------------------------

// attempt to match the text from click to text from section data
document.body.addEventListener("click", function (event) {
    if (event.target.shadowRoot == null) {
        let blurbElement = event.target
        let blurbText = blurbElement.textContent

        // use parent element if blurbElement is an anchor tag
        if (event.target.tagName == "A") {
            blurbElement = event.target.parentElement
        }

        // if widget is open (doesnt contain hidden class) then execute the search logic
        if (hostElement.shadowRoot.querySelector("#" + ID_WIDGET).classList.contains("hidden") == false) {
            if (currentResult.length > 0) {
                let dataFromMatch = attemptTextBlurbSectionMatch(currentResult, blurbElement, blurbText)
                if (dataFromMatch != null) {
                    let matchedElement = dataFromMatch["matchedElement"]
                    let matchedIndex = dataFromMatch["matchedIndex"]
                    addTempHighlightStyle(matchedElement)
                    loadContentFromIndex(matchedIndex)
                    hideOrShowPrevAndNextButtons()
                    initialActivationOfContentAndButtons()
                    closeInfoPageAndPauseMediaIfPlaying()
                }
            }
        }
    }
})


// --------------------------------------------------------------------------------------------------
// ----- Functions -----
// --------------------------------------------------------------------------------------------------

/**
 * Converts a string representation of an html element into an html element via DOMParser and then it returns the parsed element's body
 * @param {string} stringElement 
 * @returns 
 */
function convertStringToHTML(stringElement) {
    var parser = new DOMParser
    var parsedElement = parser.parseFromString(stringElement, 'text/html')

    return parsedElement.body.firstChild
}


/**
 * Checks if container has the class 'active-pivot-container'
 * @param {string} container_id 
 * @returns boolean
 */
function isContainerActive(container_id) {
    return hostElement.shadowRoot.querySelector("#" + container_id).classList.contains("active-pivot-container")
}


/**
 * Makes a request using the passed in parameters and calls the passed in function (function_handle_response) on the result if there is no error
 * @param {string} request_type 
 * @param {string} url 
 * @param {formData} form_data 
 * @param {funciton} function_handle_response 
 */
function serverRequest(request_type, url, form_data, function_handle_response) {
    var requestOptions = {
        method: request_type,
        body: form_data,
        redirect: 'follow',
        content_type: false
    };

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(result => function_handle_response(result))
        .catch(error => console.log('error', error));
}


function getCurrentPageUrl() {
    let pageUrl = window.location.href
    return pageUrl
}


/**
 * Shows the widget and hides the icon button
 */
function openWidget() {
    hostElement.shadowRoot.querySelector(`#${ID_WIDGET}`).classList.toggle("hidden")
    hostElement.shadowRoot.querySelector(`#${ID_WIDGET_ICON_BUTTON}`).classList.toggle("hidden")

    if (checkedForContent == false) {
        updateCurrentResultData()
    }
}


/**
 * Hides the widget and shows the icon button
*/
function closeWidget() {
    hostElement.shadowRoot.querySelector(`#${ID_WIDGET}`).classList.toggle("hidden")
    hostElement.shadowRoot.querySelector(`#${ID_WIDGET_ICON_BUTTON}`).classList.toggle("hidden")

    pauseMediaIfPlaying()

    // unselect video/captions/audio if any or all are selected
    // resetContentToggleButtons([ID_PIVOT_BUTTON_ASL, ID_PIVOT_BUTTON_CC, ID_PIVOT_BUTTON_AUDIO])

    // clear all container
    // resetAllContainers([ID_ASL_CONTENT_CONTAINER, ID_CAPTION_CONTENT_CONTAINER, ID_AUDIO_CONTENT_CONTAINER])
}

/**
 * Pauses widget audio and/or video if it is playing
 */
function pauseMediaIfPlaying() {
    let video_element = hostElement.shadowRoot.querySelector("#" + ID_ASL_SRC)
    let audio_element = hostElement.shadowRoot.querySelector("#" + ID_AUDIO_SRC)

    let videoIsPlaying
    try {
        videoIsPlaying = video_element.duration > 0 && !video_element.paused
    } catch {
        videoIsPlaying = false
    }

    let audioIsPlaying
    try {
        audioIsPlaying = audio_element.duration > 0 && !audio_element.paused
    } catch {
        audioIsPlaying = false
    }

    if (audioIsPlaying) {
        audio_element.pause()
    }

    if (videoIsPlaying) {
        video_element.pause()
    }
}


/**
 * Resets all toggle button styling and image icon
 * @param {Array} button_id_list 
 */
function resetContentToggleButtons(button_id_list) {
    for (let i = 0; i < button_id_list.length; i++) {
        let button_element = hostElement.shadowRoot.querySelector("#" + button_id_list[i])
        let button_img = hostElement.shadowRoot.querySelector("#" + button_id_list[i] + " img")

        if (button_element.classList.contains("active-pivot-button")) {
            button_element.classList.remove("active-pivot-button")

            // toggle active button image depending on ID
            if (button_element.id == ID_PIVOT_BUTTON_ASL) {
                toggleActiveButtonImage(button_element, ID_DEFAULT_ASL_ICON, ID_ACTIVE_ASL_ICON)
            }

            if (button_element.id == ID_PIVOT_BUTTON_CC) {
                toggleActiveButtonImage(button_element, ID_DEFAULT_CC_ICON, ID_ACTIVE_CC_ICON)
            }

            if (button_element.id == ID_PIVOT_BUTTON_AUDIO) {
                toggleActiveButtonImage(button_element, ID_DEFAULT_AUDIO_ICON, ID_ACTIVE_AUDIO_ICON)
            }
        }
    }
}


/**
 * Resets all containers by calling {@link resetContainer} on each one
 * @param {Array} container_ids 
 */
function resetAllContainers(container_ids) {
    for (let i = 0; i < container_ids.length; i++) {
        resetContainer(container_ids[i])
    }
}


/**
 * resets a container by clearing the innerHTML, removing the active class, and hides the container
 * @param {string} container_id 
 */
function resetContainer(container_id) {
    let container = hostElement.shadowRoot.querySelector("#" + container_id)
    if (container.classList.contains("active-pivot-container")) {
        container.innerHTML = ""
        container.classList.remove("active-pivot-container")
        container.classList.toggle("hidden")
    }
}


/**
 * Sets the elements innerHtml equal to ""
 * @param {string} element_id 
 */
function clearContainer(element_id) {
    hostElement.shadowRoot.querySelector("#" + element_id).innerHTML = ""
}


/**
 * Clears container's inner HTML and appends new_element via {@link updateContainerContent} and then toggles container visibility and 'active-pivot-container' class
 * @param {Element} new_element 
 * @param {string} container_id 
 */
function toggleContainerContent(new_element, container_id) {
    updateContainerContent(new_element, container_id)
    hostElement.shadowRoot.querySelector("#" + container_id).classList.toggle("hidden")
    hostElement.shadowRoot.querySelector("#" + container_id).classList.toggle("active-pivot-container")

    // toggle hint page if content media modules are all inactive
    hideOrShowHintContainer()
}


/**
 * Clears Container and appends new_element
 * @param {*} new_element 
 * @param {*} container_id 
 */
function updateContainerContent(new_element, container_id) {
    let container = hostElement.shadowRoot.querySelector("#" + container_id)
    container.innerHTML = ""
    container.append(new_element)

    // if new_element is an audio element then set event listener on audio element
    if (new_element.tagName == "AUDIO") {
        addAudioEndedEventListener(container)
        new_element.addEventListener("pause", () => {
            pauseMediaIfPlaying()
        })
    }

    if (new_element.tagName == "VIDEO") {
        new_element.addEventListener("pause", () => {
            pauseMediaIfPlaying()
        })
    }
}


/**
 * If all media modules are inactive then the hint container is shown, otherwise the hint container is hidden
 */
function hideOrShowHintContainer() {
    let hintContainer = hostElement.shadowRoot.querySelector("#" + ID_HINT_CONTAINER)

    let isVideoActive = isContainerActive(ID_ASL_CONTENT_CONTAINER)
    let isCaptionActive = isContainerActive(ID_CAPTION_CONTENT_CONTAINER)
    let isAudioActive = isContainerActive(ID_AUDIO_CONTENT_CONTAINER)


    if (isVideoActive == false && isCaptionActive == false && isAudioActive == false) { // if all containers are inactive
        // if not already shown then show hint container
        if (hintContainer.classList.contains("hidden")) {
            hintContainer.classList.remove("hidden")
        }
    } else { // if not all containers are inactive
        // if not already hidden then hide the hint container
        if (hintContainer.classList.contains("hidden") == false) {
            hintContainer.classList.add("hidden")
        }
    }
}

/**
 * Toggles a border around the button and calls the function to toggle the button image
 * @param {Element} button_element 
 */
function toggleActiveButtonStyling(button_element) {
    button_element.classList.toggle("active-pivot-button")

    if (button_element.id == ID_PIVOT_BUTTON_ASL) {
        toggleActiveButtonImage(button_element, ID_DEFAULT_ASL_ICON, ID_ACTIVE_ASL_ICON)
    }

    if (button_element.id == ID_PIVOT_BUTTON_CC) {
        toggleActiveButtonImage(button_element, ID_DEFAULT_CC_ICON, ID_ACTIVE_CC_ICON)
    }

    if (button_element.id == ID_PIVOT_BUTTON_AUDIO) {
        toggleActiveButtonImage(button_element, ID_DEFAULT_AUDIO_ICON, ID_ACTIVE_AUDIO_ICON)
    }
}


/**
 * Toggles the active image or default image for the pivot button
 * @param {Element} button_element 
 * @param {string} default_img_id
 * @param {string} active_img_id
 */
function toggleActiveButtonImage(button_element, default_img_id, active_img_id) {
    let active_button_icon = hostElement.shadowRoot.querySelector("#" + active_img_id)
    let default_button_icon = hostElement.shadowRoot.querySelector("#" + default_img_id)

    if (button_element.classList.contains("active-pivot-button")) {
        active_button_icon.classList.remove("hidden")
        default_button_icon.classList.add("hidden")
    } else if (button_element.classList.contains("active-pivot-button") == false) {
        active_button_icon.classList.add("hidden")
        default_button_icon.classList.remove("hidden")
    }
}


/**
 * - Sets container's innerHTML = "" 
 * - removes active-pivot-container class
 * - and hides the container
 * @param {string} container_id 
 */
function deactivateContainer(container_id) {
    hostElement.shadowRoot.querySelector("#" + container_id).innerHTML = ""
    hostElement.shadowRoot.querySelector("#" + container_id).classList.remove("active-pivot-container")
    hostElement.shadowRoot.querySelector("#" + container_id).classList.toggle("hidden")

    // toggle hint page if content media modules are all inactive
    hideOrShowHintContainer()
}


/**
 * Checks if the ASL content container is not active then it will make a request and update the container with the request content via {@link toggleContainerContent}, 
 * otherwise if the container is already active then it will deactivate it and hide the container via {@link deactivateContainer} 
 */
function handleASLButtonClick() {
    let isActive = hostElement.shadowRoot.querySelector("#" + ID_ASL_CONTENT_CONTAINER).classList.contains("active-pivot-container")
    if (isActive == false) {
        if (currentResult.length > 0) {
            found_text = currentResult[currentResultIndex]["text"] // update global found text

            let video_src = getVideoSource(current_sign_language)

            let video_element = createNewAslVideoElement(video_src, true)

            customFindText(found_text)
            toggleContainerContent(video_element, ID_ASL_CONTENT_CONTAINER)
            hideOrShowPrevAndNextButtons()
        } else {
            addTempNoContentFoundMessage(ID_CONTENT_PAGE)
        }
    } else {
        deactivateContainer(ID_ASL_CONTENT_CONTAINER)
    }
}


/**
 * Checks if the Caption content container is not active then it will make a request and update the container with the request content via {@link toggleContainerContent}, 
 * otherwise if the container is already active then it will deactivate it and hide the container via {@link deactivateContainer} 
 */
function handleCCButtonClick() {
    let isActive = hostElement.shadowRoot.querySelector("#" + ID_CAPTION_CONTENT_CONTAINER).classList.contains("active-pivot-container")
    if (isActive == false) {
        if (currentResult.length > 0) {
            found_text = currentResult[currentResultIndex]["text"] // update global found text
            let caption_text = getCaptions(current_transcript_language)
            let textarea_class = target_caption_font_class + " leading-[1.2] block w-full h-[100%] rounded-md bg-transparent px-3 py-1.5 text-inherit outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            let textarea_class = target_caption_font_class + " leading-[1.2] block w-full h-[100%] rounded-md bg-transparent px-3 py-1.5 text-inherit outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 overflow-y-auto"
            let caption_element = convertStringToHTML(`
                <textarea readonly rows="4" id=${ID_CAPTIONS} class="${textarea_class}">${caption_text}</textarea>
                <textarea readonly rows="5" id=${ID_CAPTIONS} class="${textarea_class}" style="overflow-y: auto;">${caption_text}</textarea>
            `)
            customFindText(found_text)
            toggleContainerContent(caption_element, ID_CAPTION_CONTENT_CONTAINER)
            hideOrShowPrevAndNextButtons()
        } else {
            addTempNoContentFoundMessage(ID_CONTENT_PAGE)
        }
    } else {
        deactivateContainer(ID_CAPTION_CONTENT_CONTAINER)
    }
}


/**
 * Checks if the Caption content container is not active then it will make a request and update the container with the request content via {@link toggleContainerContent}, 
 * otherwise if the container is already active then it will deactivate it and hide the container via {@link deactivateContainer} 
 */
function handleAudioButtonClick() {
    let isActive = hostElement.shadowRoot.querySelector("#" + ID_AUDIO_CONTENT_CONTAINER).classList.contains("active-pivot-container")
    if (isActive == false) {
        if (currentResult.length > 0) {
            found_text = currentResult[currentResultIndex]["text"] // update global found text
            let audio_src = getAudioSource(current_audio_language)

            let audio_element = convertStringToHTML(`
                <audio autoplay id=${ID_AUDIO_SRC} controls src=${audio_src} class="w-full pivot-audio"></audio>
            `)
            if (dark_mode == true) {
                audio_element = convertStringToHTML(`
                    <audio autoplay id=${ID_AUDIO_SRC} controls src=${audio_src} class="w-full pivot-audio pivot-dark-mode"></audio>
                `)
            }
            if (audio_src == "") {
                audio_element = convertStringToHTML(`<p class="w-full rounded-lg bg-gray-200 text-center">${NO_AUDIO_MESSAGE}</p>`)
            }
            customFindText(found_text)
            toggleContainerContent(audio_element, ID_AUDIO_CONTENT_CONTAINER)
            hideOrShowPrevAndNextButtons()
        } else {
            addTempNoContentFoundMessage(ID_CONTENT_PAGE)
        }
    } else {
        deactivateContainer(ID_AUDIO_CONTENT_CONTAINER)
    }
}


/**
 * Updates the language settings page for the current section
 * 
 */
function updateLanguageSettingSelectOptions() {
    updateAudioLanguageSelectOptions()
    updateCaptionLanguageSelectOptions()
    updateVideoLanguageSelectOptions()
}


function updateAudioLanguageSelectOptions() {
    let audio_captions_language_result_settings = currentResult[currentResultIndex]["audio"]

    let audio_select_element = hostElement.shadowRoot.querySelector("#" + ID_SELECT_AUDIO_LANGUAGE)

    // this clears the select innerHTML so that there are no duplicated option elements
    audio_select_element.innerHTML = ""

    for (let i = 0; i < audio_captions_language_result_settings.length; i++) {
        let language = audio_captions_language_result_settings[i]["audio_language"]
        let audio_language_option_element = convertStringToHTML(`<option value="${language}">${language}</option>`)

        // this is done so that select UI reflects the current language selection for the audio
        if (language == current_audio_language) {
            audio_language_option_element = convertStringToHTML(`<option selected value=${language}>${language}</option>`)
        }

        audio_select_element.appendChild(audio_language_option_element)
    }
}


function updateCaptionLanguageSelectOptions() {
    let captions_language_result_settings = currentResult[currentResultIndex]["captions"]

    let caption_select_element = hostElement.shadowRoot.querySelector("#" + ID_SELECT_TRANSCRIPT_LANGUAGE)

    // this clears the select innerHTML so that there are no duplicated option elements
    caption_select_element.innerHTML = ""

    for (let i = 0; i < captions_language_result_settings.length; i++) {
        let language = captions_language_result_settings[i]["caption_language"]
        let caption_language_option_element = convertStringToHTML(`<option value="${language}">${language}</option>`)

        // this is done so that select UI reflects the current language selection for the transcripts
        if (language == current_transcript_language) {
            caption_language_option_element = convertStringToHTML(`<option selected value=${language}>${language}</option>`)
        }

        caption_select_element.appendChild(caption_language_option_element)
    }
}


function updateVideoLanguageSelectOptions() {
    let video_language_result_settings = currentResult[currentResultIndex]["video"]

    let video_select_element = hostElement.shadowRoot.querySelector("#" + ID_SELECT_SIGN_LANGUAGE)

    // this clears the select innerHTML so that there are no duplicated option elements
    video_select_element.innerHTML = ""

    for (let i = 0; i < video_language_result_settings.length; i++) {
        let language = video_language_result_settings[i]["video_language"]

        let video_language_option_element = document.createElement("option")
        video_language_option_element.value = language
        video_language_option_element.innerHTML = language

        // this is done so that select UI reflects the current language selection for the audio
        if (language == current_sign_language) {
            video_language_option_element.selected = true
        }

        video_select_element.appendChild(video_language_option_element)
    }
}


function loadPrevContent() {
    if (currentResultIndex > 0) {
        currentResultIndex -= 1
        updateNewContentFromResultIndex(currentResultIndex)
        updateLanguageSettingSelectOptions()
        customFindText(found_text)
    }
}


function loadNextContent() {
    if (currentResultIndex < currentResult.length - 1) {
        currentResultIndex += 1
        updateNewContentFromResultIndex(currentResultIndex)
        updateLanguageSettingSelectOptions()
        customFindText(found_text)
    }
}

/**
 * Loads the content from {@link currentResult} at the targetIndex
 * @param {number} targetIndex 
 */
function loadContentFromIndex(targetIndex) {
    // if the target index is valid and there are results to load from
    if (targetIndex < currentResult.length && currentResult.length > 0) {
        currentResultIndex = targetIndex
        updateNewContentFromResultIndex(targetIndex)
        updateLanguageSettingSelectOptions()
    }
}


/**
 * Updates the content from the result if the container is 'active'
 * @param {number} result_index
 */
function updateNewContentFromResultIndex(result_index) {
    let new_asl_src = getVideoSource(current_sign_language)
    let new_audio_src = getAudioSource(current_audio_language)
    let new_captions = getCaptions(current_transcript_language)
    found_text = currentResult[result_index]["text"]

    // update content
    if (isContainerActive(ID_ASL_CONTENT_CONTAINER)) {

        let video_element = createNewAslVideoElement(new_asl_src, true)

        updateContainerContent(video_element, ID_ASL_CONTENT_CONTAINER)
    }
    if (isContainerActive(ID_CAPTION_CONTENT_CONTAINER)) {
        hostElement.shadowRoot.querySelector("#" + ID_CAPTIONS).value = new_captions
    }
    if (isContainerActive(ID_AUDIO_CONTENT_CONTAINER)) {
        let audio_element = convertStringToHTML(`
            <audio autoplay id=${ID_AUDIO_SRC} controls src=${new_audio_src} class="w-full pivot-audio"></audio>
        `)
        if (dark_mode == true) {
            audio_element = convertStringToHTML(`
                <audio autoplay id=${ID_AUDIO_SRC} controls src=${new_audio_src} class="w-full pivot-audio pivot-dark-mode"></audio>
            `)
        }
        if (new_audio_src == "") {
            audio_element = convertStringToHTML(`<p class="w-full rounded-lg bg-gray-200 text-center">${NO_AUDIO_MESSAGE}</p>`)
        }
        updateContainerContent(audio_element, ID_AUDIO_CONTENT_CONTAINER)
    }
}

/**
 * Creates a new asl video element with an "ended" event listener
 * @param {string} new_asl_src 
 * @param {boolean} autoplay
 * @returns 
 */
function createNewAslVideoElement(new_asl_src, autoplay) {
    let video_element = document.createElement("video")
    video_element.id = ID_ASL_SRC
    video_element.classList = "h-[100%]"
    video_element.src = new_asl_src
    video_element.controls = "true"
    video_element.autoplay = autoplay
    video_element.playsInline = true

    video_element.addEventListener("ended", function () {
        loadNextOnLastEndedContentType()
    })

    return video_element
}


function addAudioEndedEventListener(container) {
    if (container.querySelector("audio")) { // if an audio element exists within the container already
        hostElement.shadowRoot.querySelector("#" + ID_AUDIO_SRC).addEventListener("ended", function () {
            loadNextOnLastEndedContentType()
        })
    }
}


/**
 * Will load next section when the media module ends if it is the only one playing or load next if both are playing and they both finish.
 */
function loadNextOnLastEndedContentType() {
    let videoContainerActive = isContainerActive(ID_ASL_CONTENT_CONTAINER)
    let audioContainerActive = isContainerActive(ID_AUDIO_CONTENT_CONTAINER)

    let video_element = hostElement.shadowRoot.querySelector("#" + ID_ASL_SRC)
    let audio_element = hostElement.shadowRoot.querySelector("#" + ID_AUDIO_SRC)

    let videoIsPlaying
    try {
        videoIsPlaying = video_element.duration > 0 && !video_element.paused
    } catch {
        videoIsPlaying = false
    }

    let audioIsPlaying
    try {
        audioIsPlaying = audio_element.duration > 0 && !audio_element.paused
    } catch {
        audioIsPlaying = false
    }

    if (audioContainerActive == false || videoContainerActive == false) {
        autoLoadNextContent()
    } else if (videoContainerActive && audioContainerActive) {
        if (audioIsPlaying == false && videoIsPlaying == false) {
            autoLoadNextContent()
        }
    }
}


function autoLoadNextContent() {
    loadNextContent()
    hideOrShowPrevAndNextButtons()
}


/**
 * Gets the audio src from the current result data and the current audio language setting 
 * @param {string} language 
 * @returns 
 */
function getAudioSource(language) {
    let audio_src = ""
    let current_section_audio_data = currentResult[currentResultIndex]["audio"]
    for (let i = 0; i < current_section_audio_data.length; i++) {
        let section_language = String(current_section_audio_data[i]["audio_language"])
        if (section_language == language) {
            audio_src = current_section_audio_data[i]["audio"]
        } else {
            audio_src = current_section_audio_data[0]["audio"]
        }
    }
    return audio_src
}


/**
 * Gets the video src from the current result data and the current audio language setting 
 * @param {string} language 
 * @returns 
 */
function getVideoSource(language) {
    let video_src = ""
    let current_section_video_data = currentResult[currentResultIndex]["video"]
    for (let i = 0; i < current_section_video_data.length; i++) {
        let section_language = String(current_section_video_data[i]["video_language"])
        if (section_language == language) {
            video_src = current_section_video_data[i]["video"]
            return video_src
        } else {
            video_src = current_section_video_data[0]["video"]
        }
    }
    return video_src
}


function getCaptions(language) {
    let captions = NO_CAPTIONS_MESSAGE
    let current_section_caption_data = currentResult[currentResultIndex]["captions"]
    for (let i = 0; i < current_section_caption_data.length; i++) {
        let section_language = String(current_section_caption_data[i]["caption_language"])
        if (section_language == language) {
            captions = current_section_caption_data[i]["captions"]
            return captions
        } else {
            captions = current_section_caption_data[0]["captions"]
        }
    }
    return captions
}


function openTargetPageHideContent(target_page_id) {
    let target_page = hostElement.shadowRoot.querySelector("#" + target_page_id)

    let widgetTopBar = hostElement.shadowRoot.querySelector("#" + ID_WIDGET_TOP_BAR)
    let contentPage = hostElement.shadowRoot.querySelector("#" + ID_CONTENT_PAGE)
    let bottomButtonContainer = hostElement.shadowRoot.querySelector("#" + ID_BOTTOM_BUTTON_CONTAINER)

    // hides the other non content pages
    for (let i = 0; i < NON_CONTENT_PAGE_IDS.length; i++) {
        if (NON_CONTENT_PAGE_IDS[i] != target_page_id) {
            let page_element = hostElement.shadowRoot.querySelector("#" + NON_CONTENT_PAGE_IDS[i])
            if (page_element.classList.contains("hidden") == false) {
                page_element.classList.add("hidden")
            }
        }
    }

    // shows the target page if hidden and hides the content page
    if (target_page.classList.contains("hidden") == true) {
        // show target page
        target_page.classList.remove("hidden")

        // hide non target page elements
        // widgetTopBar.classList.add("hidden")
        widgetTopBar.classList.add("h-[60px]")
        contentPage.classList.add("hidden")
        bottomButtonContainer.classList.add("hidden")
    }
}


function closeTargetPageShowContent(target_page_id) {
    let target_page = hostElement.shadowRoot.querySelector("#" + target_page_id)

    let widgetTopBar = hostElement.shadowRoot.querySelector("#" + ID_WIDGET_TOP_BAR)
    let contentPage = hostElement.shadowRoot.querySelector("#" + ID_CONTENT_PAGE)
    let bottomButtonContainer = hostElement.shadowRoot.querySelector("#" + ID_BOTTOM_BUTTON_CONTAINER)

    if (target_page.classList.contains("hidden") == false) {
        // hide target page
        target_page.classList.add("hidden")

        // show non target page elements
        // widgetTopBar.classList.remove("hidden")
        widgetTopBar.classList.remove("h-[60px]")
        contentPage.classList.remove("hidden")
        bottomButtonContainer.classList.remove("hidden")
    }
}


function closeInfoPageAndPauseMediaIfPlaying() {
    let infoPage = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_INFO_PAGE)
    let instructionVideo = hostElement.shadowRoot.querySelector("#" + ID_INSTRUCTION_VIDEO_ELEMENT)
    let instructionAudio = hostElement.shadowRoot.querySelector("#" + ID_INSTRUCTION_AUDIO_ELEMENT)

    if (infoPage.classList.contains("hidden") == false) {
        closeTargetPageShowContent(ID_PIVOT_INFO_PAGE)
    }

    if (!instructionAudio.paused) {
        instructionAudio.pause()
    }

    if (!instructionVideo.paused) {
        instructionVideo.pause()
    }
}


/**
 * Hides or shows the previous and or next buttons while also preserving space
 */
function hideOrShowPrevAndNextButtons() {
    let prev_button = hostElement.shadowRoot.querySelector("#" + ID_PREV_CONTENT_BUTTON)
    let next_button = hostElement.shadowRoot.querySelector("#" + ID_NEXT_CONTENT_BUTTON)

    if (currentResult.length > 0) {
        if (currentResultIndex == 0) {
            prev_button.style.visibility = "hidden"
        } else {
            if (prev_button.style.visibility == "hidden") {
                prev_button.style.visibility = "visible"
            }
        }

        if (currentResultIndex == currentResult.length - 1) {
            next_button.style.visibility = "hidden"
        } else {
            if (next_button.style.visibility == "hidden") {
                next_button.style.visibility = "visible"
            }
        }
    }
}


/**
 * Updates the global variables for current_transcript_language/current_audio_language based off the select value
 * then Sets that value to the current select value
 * @param {string} select_element_id 
 */
function getLanguageSelectionValue(select_element_id) {
    let select_value = hostElement.shadowRoot.querySelector("#" + select_element_id).value
    if (select_element_id == ID_SELECT_TRANSCRIPT_LANGUAGE) {
        current_transcript_language = select_value
    } else if (select_element_id == ID_SELECT_AUDIO_LANGUAGE) {
        current_audio_language = select_value
    } else if (select_element_id == ID_SELECT_SIGN_LANGUAGE) {
        current_sign_language = select_value
    }
}


function handleFontSizeChange(target_key) {
    let widget = hostElement.shadowRoot.querySelector("#" + ID_WIDGET)
    let captions = hostElement.shadowRoot.querySelector("#" + ID_CAPTIONS)

    let font_size_options = {
        1: ["text-sm", "w-[210px]", "md:w-[310px]"],
        2: ["text-lg", "w-[220px]", "md:w-[320px]"],
        3: ["text-xl", "w-[230px]", "md:w-[330px]"],
        4: ["text-2xl", "w-[240px]", "md:w-[340px]"]
    }

    // updates font size for captions regardless of whether or not the captions exist yet
    // this is done so that when captions are selected it will have the correct size
    target_caption_font_class = font_size_options[target_key][0]
    if (captions != null) {
        try {
            updateCaptionsTextAndFontSize() // can fail if there is no caption element yet
        } catch (error) {
            console.error(error)
        }
    }


    for (const [key, value] of Object.entries(font_size_options)) {
        for (let i = 0; i < value.length; i++) {
            if (widget.classList.contains(value[i])) {
                widget.classList.remove(value[i])
            }
        }
        if (target_key == key) {
            for (let i = 0; i < value.length; i++) {
                widget.classList.add(value[i])
            }
        }
    }
}


function updateCaptionsTextAndFontSize() {
    let caption_text = getCaptions(current_transcript_language)
    let textarea_class = target_caption_font_class + " leading-[1.2] block w-full h-[100%] rounded-md bg-transparent px-3 py-1.5 text-inherit outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
    let textarea_class = target_caption_font_class + " leading-[1.2] block w-full h-[100%] rounded-md bg-transparent px-3 py-1.5 text-inherit outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 overflow-y-auto"
    let caption_element = convertStringToHTML(`
        <textarea readonly rows="4" id=${ID_CAPTIONS} class="${textarea_class}">${caption_text}</textarea>
        <textarea readonly rows="5" id=${ID_CAPTIONS} class="${textarea_class}" style="overflow-y: auto;">${caption_text}</textarea>
    `)
    updateContainerContent(caption_element, ID_CAPTION_CONTENT_CONTAINER)
}


/**
 * grow_or_shrink = "grow" or = "shrink"
 * @param {string} grow_or_shrink 
 */
function handleWidgetSizeChange(grow_or_shrink) {
    let widget = hostElement.shadowRoot.querySelector("#" + ID_WIDGET)

    let current_widget_width = widget.offsetWidth
    let current_widget_height = widget.offsetHeight

    let max_widget_width = window.innerWidth - 10
    let max_widget_height = window.innerWidth + 100 // this should keep the widget with a consistent 3:2 h:w ratio

    let min_widget_width = 200
    let min_widget_height = 410

    let widget_width_step = 10
    let widget_height_step = 10

    if (grow_or_shrink == "grow") {
        // width
        if (current_widget_width < max_widget_width) {
            current_widget_width += widget_width_step
        }

        // height
        if (current_widget_height < max_widget_height) {
            current_widget_height += widget_height_step
        }
    } else if (grow_or_shrink == "shrink") {
        // width
        if (current_widget_width > min_widget_width) {
            current_widget_width -= widget_width_step
        }

        // height
        if (current_widget_height > min_widget_height) {
            current_widget_height -= widget_height_step
        }
    }

    // update widget width
    widget.style.width = `${current_widget_width}px`

    // upadte widget height
    widget.style.height = `${current_widget_height}px`
}


function customFindText(text_to_find) {
    if (text_to_find) {
        let cleaned_text_to_find = condenseText(text_to_find)
        let cleaned_text_to_find_re = new RegExp(cleaned_text_to_find)

        let elements_with_the_target_text = []


        // loop from top of the document downward
        for (const element of document.body.querySelectorAll("*")) {
            let cleaned_element_text = condenseText(element.textContent)
            if (cleaned_element_text == cleaned_text_to_find) { // find exact/best match
                elements_with_the_target_text.push(element)
                break // break since this is the best match and there is no need to search anymore
            } else if (cleaned_element_text.match(cleaned_text_to_find_re)) { // find potential next best matches
                elements_with_the_target_text.push(element)
            }
        }

        if (elements_with_the_target_text.length > 0) {
            let repeated_potential_targets = []

            let target_element = elements_with_the_target_text.pop()
            let condensedTarget = condenseText(target_element.textContent)

            // find repeated textContent matches
            for (let i = 0; i < elements_with_the_target_text.length; i++) {
                let condensedPotentialMatch = condenseText(elements_with_the_target_text[i].textContent)
                if (condensedPotentialMatch == condensedTarget) {
                    repeated_potential_targets.push(elements_with_the_target_text[i])
                }

            }

            // removeMultipleScrollToElement() // must be called before calling appendMultipleScrollToElement()

            // handle repeated matches
            if (repeated_potential_targets.length > 0) {
                repeated_potential_targets.push(target_element) // add back the target at the end since it was popped off earlier
                target_element = repeated_potential_targets[0] // sets the potential target to be the first (topmost) element
            }
            scrollToAndHighlightElement(target_element)
        } else {
            console.log("Unable to find text.")
        }

    } else {
        console.log("No valid text to find.")
    }
}


function scrollToAndHighlightElement(target_element) {
    customScrollToElement(target_element)
    addTempHighlightStyle(target_element)
}


/**
 * Removes spaces and newlines
 * @param {string} text 
 * @returns 
 */
function condenseText(text) {
    let condensedText = text.replace(/\s+/g, '')
    return condensedText
}


/**
 * Scrolls viewport to a target_element
 * @param {Element} target_element 
 */
function customScrollToElement(target_element) {
    if (target_element) {
        // getting the boundingClientRect based off of the window being at 0,0
        let target_element_coords = target_element.getBoundingClientRect()

        let adjusted_x = target_element_coords.x + window.scrollX
        let adjusted_y = (target_element_coords.y - target_element_coords.height) + window.scrollY

        // scrollTo target coordinates with a y offset so the element isn't cut off
        window.scrollTo(adjusted_x, adjusted_y)

    }
}


/**
 * Temporarily adds a border highlight to the target element
 * @param {Element} target_element 
 */
function addTempHighlightStyle(target_element) {
    if (target_element) {

        removeExistingHighlightedSpan()

        let original_target_innerHTML = target_element.innerHTML
        let temp_target_innerHTML = '<span id="pivot-highlight-span" style="background-color: #DDF84D;">' + original_target_innerHTML + '</span>'

        if (target_element.querySelector(":scope > span") == null) { // this prevents spamming of the styling which can break the original style of the element
            target_element.innerHTML = temp_target_innerHTML
        }

    }
}

/**
 * Remove the element with the id 'pivot-highlight-span' if it exists
 */
function removeExistingHighlightedSpan() {
    if (document.querySelector("#pivot-highlight-span")) {
        let existing_highlighted_span = document.querySelector("#pivot-highlight-span")
        existing_highlighted_span.replaceWith(...existing_highlighted_span.childNodes)
    }
}


/**
 * Toggles the 'bg-[#DDF84D]' class on the element with the id 'pivot-highlight-span' if it exists
 */
function toggleHiddenOnExistingHighlightedSpan() {
    if (document.querySelector("#pivot-highlight-span")) {
        let existing_highlighted_span = document.querySelector("#pivot-highlight-span")
        existing_highlighted_span.classList.toggle("bg-[#DDF84D]")
    }
}


/**
 * Appends arrow buttons to scroll back and forth between duplicated target. Similiar to the browsers ctrl+f
 * @param {Array} repeated_potential_targets 
 * @param {string} element_id_to_append_to 
 */
function appendMultipleScrollToElement(repeated_potential_targets, element_id_to_append_to) {
    let current_target_index = 0
    let element_to_append_to = hostElement.shadowRoot.querySelector("#" + element_id_to_append_to)
    let switchBetweenTargetsElement = convertStringToHTML(`
        <div id=${ID_MULTIPLE_TARGET_TEXT_SWITCHER_BUTTON} class="flex flex-row w-[60px] h-[25px] bg-green-500">
            <div id="back_button_potential_target" class="w-1/2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                </svg>
            </div>
            <div>
                <p>${current_target_index}/${repeated_potential_targets.length - 1}</p>
            </div>
            <div id="forward_button_potential_target" class="w-1/2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                </svg>
            </div>
        </div>
    `)

    element_to_append_to.append(switchBetweenTargetsElement)

    // backward button event handler
    hostElement.shadowRoot.querySelector("#back_button_potential_target").addEventListener("click", function () {
        if (current_target_index == 0) {
            current_target_index = repeated_potential_targets.length - 1
        } else {
            current_target_index -= 1
        }
        scrollToAndHighlightElement(repeated_potential_targets[current_target_index])
        // console.log(current_target_index)
    })

    // forward button event handler
    hostElement.shadowRoot.querySelector("#forward_button_potential_target").addEventListener("click", function () {
        if (current_target_index == repeated_potential_targets.length - 1) {
            current_target_index = 0
        } else {
            current_target_index += 1
        }
        scrollToAndHighlightElement(repeated_potential_targets[current_target_index])
        // console.log(current_target_index)
    })
}


/**
 * Removes the old multipleScrollToElement if it is not null when query selecting it
 */
function removeMultipleScrollToElement() {
    let multipleScrollToElement = hostElement.shadowRoot.querySelector("#" + ID_MULTIPLE_TARGET_TEXT_SWITCHER_BUTTON)
    if (multipleScrollToElement != null) {
        multipleScrollToElement.remove()
    }
}


/**
 * Gets the input of the high contrast checkbox and then updates the add_contrast_class variable
 * @param {Element} checkbox_input 
 */
function handleHighContrastInputSelection(checkbox_input) {
    if (checkbox_input.checked == true) {
        add_contrast_classes = true
    } else if (checkbox_input.checked == false) {
        add_contrast_classes = false
    }
}


/**
 * Adds or removes contrast class to widget element and input elements
 * - In order for the classes to be added correctly you must update this functions "inputs" list to include any new elements that you want to have the additional high contrast styling
 */
function updateContrastStyling() {
    let widget = hostElement.shadowRoot.querySelector("#" + ID_WIDGET)
    let contrast_class = "contrast-150"

    let inputs = [ID_ASL_CONTENT_CONTAINER, ID_AUDIO_CONTENT_CONTAINER, ID_CAPTION_CONTENT_CONTAINER]

    if (add_contrast_classes == true) {
        widget.classList.add(contrast_class)
        for (let i = 0; i < inputs.length; i++) {
            let current_input = hostElement.shadowRoot.querySelector("#" + inputs[i])
            current_input.classList.add("border-solid", "border-black", "border-b-2")
        }
    } else if (add_contrast_classes == false) {
        widget.classList.remove(contrast_class)
        for (let i = 0; i < inputs.length; i++) {
            let current_input = hostElement.shadowRoot.querySelector("#" + inputs[i])
            current_input.classList.remove("border-solid", "border-black", "border-b-2")
        }
    }
}


function handleDarkModeInputSelection(checkbox_input) {
    if (checkbox_input.checked == true) {
        dark_mode = true
    } else if (checkbox_input.checked == false) {
        dark_mode = false
    }
}


function updateDarkModeStyling() {
    let widget = hostElement.shadowRoot.querySelector("#" + ID_WIDGET)
    let captions_textarea = hostElement.shadowRoot.querySelector("#" + ID_CAPTION_CONTENT_CONTAINER)
    let audio_element = hostElement.shadowRoot.querySelector("#" + ID_AUDIO_SRC)
    let language_selects = hostElement.shadowRoot.querySelectorAll(".pivot-widget-page select")
    let open_language_select_button = hostElement.shadowRoot.querySelector("#" + ID_OPEN_LANGUAGE_SELECTIONS_BUTTON)

    let dark_mode_bg = "bg-[#212121]"
    let dark_mode_text = "text-white"

    let light_mode_bg = "bg-white"
    let light_mode_text = "text-black"

    if (dark_mode == true) {
        hostElement.shadowRoot.querySelector("#" + ID_DARK_MODE_INPUT).checked = true

        // add dark styling
        widget.classList.add(dark_mode_bg)
        widget.classList.add(dark_mode_text)
        captions_textarea.classList.add(dark_mode_text)

        open_language_select_button.classList.add("pivot-dark-mode")

        // remove light styling
        widget.classList.remove(light_mode_bg)
        widget.classList.remove(light_mode_text)
        captions_textarea.classList.remove(light_mode_text)

        if (audio_element) {
            audio_element.classList.add("pivot-dark-mode")
        }

        if (language_selects) {
            language_selects.forEach(element => {
                element.classList.add("pivot-dark-mode")
            });
        }

    } else if (dark_mode == false) {
        // add light styling
        widget.classList.add(light_mode_bg)
        widget.classList.add(light_mode_text)
        captions_textarea.classList.add(light_mode_text)

        // remove dark styling
        widget.classList.remove(dark_mode_bg)
        widget.classList.remove(dark_mode_text)
        captions_textarea.classList.remove(dark_mode_text)

        open_language_select_button.classList.remove("pivot-dark-mode")

        if (audio_element) {
            audio_element.classList.remove("pivot-dark-mode")
        }

        if (language_selects) {
            language_selects.forEach(element => {
                element.classList.remove("pivot-dark-mode")
            });
        }

    }
}


function addTempNoContentFoundMessage(target_container_id) {
    let target_container = hostElement.shadowRoot.querySelector("#" + target_container_id)
    let no_content_found_element = convertStringToHTML(`
        <div class="bg-black text-white bg-opacity-80 w-full m-auto py-2 px-4 border-lg fixed z-[999999]">
            <p>No content found for this page.</p>
        </div>
    `)

    target_container.prepend(no_content_found_element)

    setTimeout(() => {
        no_content_found_element.remove()
    }, 2000);
}


/**
 * Adds functionality to an element to be able to be dragged around within the window.
 * @param {*} handle_id 
 * @param {*} element_id_to_move 
 */
function dragWidget(handle_id, element_id_to_move) {
    let element_to_move = hostElement.shadowRoot.querySelector("#" + element_id_to_move)
    var deltaMouseX = 0
    var deltaMouseY = 0
    var mouseX = 0
    var mouseY = 0;
    if (hostElement.shadowRoot.querySelector("#" + handle_id)) {
        hostElement.shadowRoot.querySelector("#" + handle_id).addEventListener("mousedown", dragMouseDown)
    }

    function dragMouseDown(e) {
        // composedPath()[0] is used to get the target element from the ShadowDOM
        if (e.composedPath()[0].id != ID_CAPTIONS) { // stop the drag functionality of overriding the textarea resize functionality
            // get the mouse cursor position at startup:
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.onmouseup = closeDragElement // added to document and not the ShadowDOM because this needs to execute at document level

            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag // added to document and not the ShadowDOM because this needs to execute at document level
        }
    }

    function elementDrag(e) {
        // calculate the new cursor position:
        deltaMouseX = mouseX - e.clientX;
        deltaMouseY = mouseY - e.clientY;

        mouseX = e.clientX;
        mouseY = e.clientY;

        let element_rect = element_to_move.getBoundingClientRect()

        let moving_left = false
        let moving_right = false
        let moving_up = false
        let moving_down = false

        // Determine which direction the widget is moving
        if (deltaMouseY > 0) {
            moving_up = true
        } else {
            moving_up = false
        }

        if (deltaMouseY < 0) {
            moving_down = true
        } else {
            moving_down = false
        }

        if (deltaMouseX > 0) {
            moving_left = true
        } else {
            moving_left = false
        }

        if (deltaMouseX < 0) {
            moving_right = true
        } else {
            moving_right = false
        }


        // Handle moving up
        if (moving_up && element_rect.top < 0) {
            element_to_move.style.top = (element_to_move.offsetTop) + "px" // stop moving up if at the top
        } else if (moving_up && element_rect.top > 0) {
            element_to_move.style.top = (element_to_move.offsetTop - deltaMouseY) + "px"
        }

        // Handle moving down
        if (moving_down && element_rect.bottom > window.innerHeight) {
            element_to_move.style.top = (element_to_move.offsetTop) + "px" // stop moving down if at the botton
        } else if (moving_down && element_rect.bottom < window.innerHeight) {
            element_to_move.style.top = (element_to_move.offsetTop - deltaMouseY) + "px"
        }

        // Handle moving left
        if (moving_left && element_rect.left < 0) {
            element_to_move.style.left = (element_to_move.offsetLeft) + "px" // stop moving left if at left edge of window
        } else if (moving_left && element_rect.left > 0) {
            element_to_move.style.left = (element_to_move.offsetLeft - deltaMouseX) + "px"
        }

        // Handle moving right
        if (moving_right && element_rect.right > window.innerWidth) {
            element_to_move.style.left = (element_to_move.offsetLeft) + "px" // stop moving right if at the right edge of the window
        } else if (moving_right && element_rect.right < window.innerWidth) {
            element_to_move.style.left = (element_to_move.offsetLeft - deltaMouseX) + "px"
        }
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null // removes event listener from document level because the listener was added at the document
        document.onmousemove = null // removes event listener from document level because the listener was added at the document

    }
}


/**
 * Adds functionality to resize an element from its top left (north east) corner
 * @param {*} element_id 
 */
function enableWidgetResizeFunctionality(element_id) {
    const element_to_resize = hostElement.shadowRoot.querySelector("#" + element_id)

    const resizers = hostElement.shadowRoot.querySelectorAll(".pivot-resizable-handle")
    let currentResizer

    for (let resizer of resizers) {
        resizer.addEventListener("mousedown", mousedown)

        function mousedown(e) {
            e.preventDefault()
            e.stopImmediatePropagation() // stop the dragElement functionality from being called when trying to resize
            currentResizer = e.target

            let prevX = e.clientX
            let prevY = e.clientY

            hostElement.shadowRoot.addEventListener("mousemove", mousemove)
            hostElement.shadowRoot.addEventListener("mouseup", mouseup)

            function mousemove(e) {
                // e.preventDefault()
                const rect = element_to_resize.getBoundingClientRect()

                let width_resizing = false
                let height_resizing = false

                // check if width is resizing
                if (prevX - e.clientX > 0) {
                    width_resizing = true
                } else {
                    width_resizing = false
                }

                // check if height is resizing
                if (prevY - e.clientY > 0) {
                    height_resizing = true
                } else {
                    height_resizing = false
                }

                // handle resize from nw handle
                if (currentResizer.classList.contains("pivot-nw")) {
                    // limit width: resize width as long as rect is within screen left bounds
                    if (width_resizing && rect.left < 0) {
                        element_to_resize.style.width = rect.width + "px"
                    } else {
                        element_to_resize.style.width = rect.width + (prevX - e.clientX) + "px"
                    }

                    // limit height: resize top as long rect is within screen top bounds
                    if (height_resizing && rect.top < 0) {
                        element_to_resize.style.height = rect.height + "px"
                    } else {
                        element_to_resize.style.height = rect.height + (prevY - e.clientY) + "px"
                    }

                    prevX = e.clientX
                    prevY = e.clientY
                }

            }

            function mouseup() {
                hostElement.shadowRoot.removeEventListener("mousemove", mousemove)
                hostElement.shadowRoot.removeEventListener("mouseup", mouseup)
            }
        }
    }
}


/**
 * Searches for a match between the blurb text from the DOM and the section text data from the currentResult.
 * @param {object} currentResult 
 * @param {Element} blurbElement 
 * @param {string} blurbText 
 * @returns 
 */
function attemptTextBlurbSectionMatch(currentResult, blurbElement, blurbText) {
    let condensedBlurbText = condenseText(blurbText)

    let currentResultIndex = 0
    let exactMatchFound = false
    let matchFound = false

    let matchedElement = null
    let matchedIndex = null


    // attempt to find best match, if found break
    for (let i = 0; i < currentResult.length; i++) {
        let sectionText = currentResult[i]["text"]
        let condensedSectionText = condenseText(sectionText)

        if (condensedBlurbText == condensedSectionText) {
            matchedElement = blurbElement
            matchedIndex = i
            exactMatchFound = true
            break
        }
    }

    // if no best match then find next best match by looping
    if (exactMatchFound == false) {
        while (currentResultIndex < currentResult.length && matchFound == false) {
            let sectionText = currentResult[currentResultIndex]["text"]
            let condensedSectionText = condenseText(sectionText)

            if (condensedBlurbText.includes(condensedSectionText)) {
                matchedElement = blurbElement
                matchedIndex = currentResultIndex
                matchFound = true
            } else if (condensedSectionText.includes(condensedBlurbText)) {
                matchedElement = blurbElement
                matchedIndex = currentResultIndex
                matchFound = true
            }

            currentResultIndex++
        }
    }

    if (matchedElement != null && matchedIndex != null) {
        let dataFromMatch = {
            "matchedElement": matchedElement,
            "matchedIndex": matchedIndex,
        }
        return dataFromMatch
    } else {
        return null
    }

}



function updateCurrentResultData() {
    if (currentResult.length == 0 && checkedForContent == false) { // update currentResult if it is empty        
        checkedForContent = true // to prevent this logic from being called more than once

        let pageUrl = getCurrentPageUrl()
        let formdata = new FormData();
        formdata.append("page_url", pageUrl);

        serverRequest("POST", URL_WIDGET_SECTIONS, formdata, handleResponse)

        function handleResponse(result) {
            if (result.length > 0) {
                currentResult = result
                found_text = result[currentResultIndex]["text"] // update global found text
                return currentResult
            } else {
                addTempNoContentFoundMessage(ID_CONTENT_PAGE)
            }
        }
    }
}


/**
 * Simulates all content buttons being clicked, thus activating the content containers. This is called only once when the content is activated for the first time.
 */
function initialActivationOfContentAndButtons() {
    if (widgetActivatedForTheFirstTime == false) {
        widgetActivatedForTheFirstTime = true

        let signLanguageButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_ASL)
        let ccButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_CC)
        let audioButton = hostElement.shadowRoot.querySelector("#" + ID_PIVOT_BUTTON_AUDIO)


        // update the content of the content containers

        // video
        let video_src = getVideoSource(current_sign_language)
        let video_element = createNewAslVideoElement(video_src, true)

        // captions
        let caption_text = getCaptions(current_transcript_language)
        let textarea_class = target_caption_font_class + " leading-[1.2] block w-full h-full rounded-md bg-transparent px-3 py-1.5 text-inherit outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
        let textarea_class = target_caption_font_class + " leading-[1.2] block w-full h-full rounded-md bg-transparent px-3 py-1.5 text-inherit outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 overflow-y-auto"
        let caption_element = convertStringToHTML(`
            <textarea readonly rows="4" id=${ID_CAPTIONS} class="${textarea_class}">${caption_text}</textarea>
            <textarea readonly rows="5" id=${ID_CAPTIONS} class="${textarea_class}" style="overflow-y: auto;">${caption_text}</textarea>
        `)

        // audio
        let audio_src = getAudioSource(current_audio_language)
        let audio_element = convertStringToHTML(`
            <audio autoplay id=${ID_AUDIO_SRC} controls src=${audio_src} class="w-full pivot-audio"></audio>
        `)
        if (dark_mode == true) {
            audio_element = convertStringToHTML(`
                <audio autoplay id=${ID_AUDIO_SRC} controls src=${audio_src} class="w-full pivot-audio pivot-dark-mode"></audio>
            `)
        }
        if (audio_src == "") {
            audio_element = convertStringToHTML(`<p class="w-full rounded-lg bg-gray-200 text-center">${NO_AUDIO_MESSAGE}</p>`)
        }

        // toggle content and container if not already active
        if (isContainerActive(ID_ASL_CONTENT_CONTAINER) == false) {
            toggleContainerContent(video_element, ID_ASL_CONTENT_CONTAINER)
            toggleActiveButtonStyling(signLanguageButton)
        }
        if (isContainerActive(ID_CAPTION_CONTENT_CONTAINER) == false) {
            toggleContainerContent(caption_element, ID_CAPTION_CONTENT_CONTAINER)
            toggleActiveButtonStyling(ccButton)
        }
        if (isContainerActive(ID_AUDIO_CONTENT_CONTAINER) == false) {
            toggleContainerContent(audio_element, ID_AUDIO_CONTENT_CONTAINER)
            toggleActiveButtonStyling(audioButton)
        }

        hideOrShowPrevAndNextButtons()

    }

}


/**
 * Checks if the instruction page needs to be shown for the first time. Once shown the instruction page will no longer auto open on widget open unless page is refreshed.
 */
function checkIfShowInstructionPage() {
    if (instructionsShownForTheFirstTime == false) {
        instructionsShownForTheFirstTime = true
        openTargetPageHideContent(ID_PIVOT_INFO_PAGE)
    }
}
0 commit comments
Comments
0
 (0)
Comment
You're not receiving notifications from this thread.

