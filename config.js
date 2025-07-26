// API Configuration for Video Generation Dashboard
const CONFIG = {
    // OpenAI Configuration
    OPENAI: {
        BASE_URL: 'https://api.openai.com/v1',
        VISION_MODEL: 'gpt-4-vision-preview',
        TEXT_MODEL: 'gpt-4',
        MAX_TOKENS: {
            VISION: 500,
            TEXT: 800,
            PROMPT_GENERATION: 1000
        }
    },

    // ByteDance ModelArk Configuration
    BYTEDANCE: {
        BASE_URL: 'https://ark.cn-beijing.volces.com',
        MODELS: {
            // Video Generation Models
            SEEDANCE_PRO: 'bytedance-seedance-1-0-pro',
            SEEDANCE_LITE_I2V: 'bytedance-seedance-1-0-lite-i2v',
            SEEDANCE_LITE_T2V: 'bytedance-seedance-1-0-lite-t2v',
        },
        VIDEO_SETTINGS: {
            RESOLUTION: '480p', // Options: 480p, 720p, 1080p
            DURATION: 5, // seconds
            ASPECT_RATIO: '16:9' // Options: 16:9, 4:3, 1:1, 9:21
        }
    },

    // Alternative: FAL.AI (Third-party service for Seedance)
    FAL_AI: {
        BASE_URL: 'https://fal.run/fal-ai/bytedance/seedance/v1/lite',
        ENDPOINTS: {
            TEXT_TO_VIDEO: '/text-to-video',
            IMAGE_TO_VIDEO: '/image-to-video'
        }
    },

    // File Upload Settings
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        MAX_MOOD_BOARD_IMAGES: 10
    },

    // Rate Limiting
    RATE_LIMITS: {
        PARALLEL_IMAGE_ANALYSIS: 3, // Max parallel OpenAI vision requests
        REQUEST_DELAY: 500 // ms between requests
    },

    // UI Settings
    UI: {
        ANIMATION_DURATION: 300, // ms
        PROGRESS_UPDATE_INTERVAL: 1000, // ms
        AUTO_HIDE_SUCCESS_MESSAGES: 5000 // ms
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 