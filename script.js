// AI Video Generation Dashboard - Main Script
class VideoGenerationApp {
    constructor() {
        this.apiKeys = {
            openai: localStorage.getItem('openai_api_key') || '',
            bytedance: localStorage.getItem('bytedance_api_key') || ''
        };
        
        this.uploadedImages = [];
        this.moodBoardAnalysis = [];
        this.baseImage = null;
        this.baseImageData = null;
        
        // Output logging
        this.projectId = this.generateProjectId();
        this.apiLogs = [];
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.updateUIState();
        this.loadSavedSettings();
        this.updateProjectDisplay();
    }

    setupEventListeners() {
        // Settings Modal
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.querySelector('.close').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        
        // Script Input
        document.getElementById('scriptInput').addEventListener('input', () => this.updateCharacterCount());
        
        // Mood Board Upload
        this.setupFileUpload('moodBoardUpload', 'moodBoardFiles', (files) => this.handleMoodBoardUpload(files));
        document.getElementById('analyzeMoodBoard').addEventListener('click', () => this.analyzeMoodBoard());
        
        // Base Image Upload
        this.setupFileUpload('baseImageUpload', 'baseImageFile', (files) => this.handleBaseImageUpload(files[0]));
        
        // Final Prompt Generation
        document.getElementById('generatePrompt').addEventListener('click', () => this.generateFinalPrompt());
        document.getElementById('finalPrompt').addEventListener('input', () => this.updatePromptLength());
        
        // Video Generation
        document.getElementById('generateVideo').addEventListener('click', () => this.generateVideo());
        
        // Video Actions
        document.getElementById('downloadVideo').addEventListener('click', () => this.downloadVideo());
        document.getElementById('downloadLog').addEventListener('click', () => this.downloadProjectLog());
        document.getElementById('generateAnother').addEventListener('click', () => this.resetApp());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('settingsModal');
            if (e.target === modal) {
                this.closeSettings();
            }
        });
    }

    setupFileUpload(areaId, inputId, callback) {
        const uploadArea = document.getElementById(areaId);
        const fileInput = document.getElementById(inputId);

        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                callback(files);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('image/')
            );
            
            if (files.length > 0) {
                callback(files);
            }
        });
    }

    // Settings Management
    openSettings() {
        document.getElementById('settingsModal').style.display = 'block';
        document.getElementById('openaiKey').value = this.apiKeys.openai;
        document.getElementById('bytedanceKey').value = this.apiKeys.bytedance;
    }

    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    saveSettings() {
        this.apiKeys.openai = document.getElementById('openaiKey').value.trim();
        this.apiKeys.bytedance = document.getElementById('bytedanceKey').value.trim();
        
        localStorage.setItem('openai_api_key', this.apiKeys.openai);
        localStorage.setItem('bytedance_api_key', this.apiKeys.bytedance);
        
        this.closeSettings();
        this.updateUIState();
        this.showStatus('Settings saved successfully!', 'success');
    }

    loadSavedSettings() {
        const savedOpenAI = localStorage.getItem('openai_api_key');
        const savedByteDance = localStorage.getItem('bytedance_api_key');
        
        if (savedOpenAI) this.apiKeys.openai = savedOpenAI;
        if (savedByteDance) this.apiKeys.bytedance = savedByteDance;
    }

    // UI State Management
    updateUIState() {
        const hasOpenAI = this.apiKeys.openai.length > 0;
        const hasImages = this.uploadedImages.length > 0;
        const hasBaseImage = this.baseImage !== null;
        const hasScript = document.getElementById('scriptInput').value.trim().length > 0;
        const hasMoodBoard = this.moodBoardAnalysis.length > 0;
        const hasFinalPrompt = document.getElementById('finalPrompt').value.trim().length > 0;

        // Enable/disable buttons based on state
        document.getElementById('analyzeMoodBoard').disabled = !hasOpenAI || !hasImages;
        document.getElementById('generatePrompt').disabled = !hasScript || !hasMoodBoard || !hasBaseImage;
        document.getElementById('generateVideo').disabled = !hasOpenAI || !hasFinalPrompt || !hasBaseImage;
    }

    updateCharacterCount() {
        const scriptInput = document.getElementById('scriptInput');
        const charCount = document.querySelector('.character-count');
        charCount.textContent = `${scriptInput.value.length} characters`;
        this.updateUIState();
    }

    updatePromptLength() {
        const finalPrompt = document.getElementById('finalPrompt');
        const promptLength = document.getElementById('promptLength');
        promptLength.textContent = `${finalPrompt.value.length} characters`;
        this.updateUIState();
    }

    // File Upload Handlers
    handleMoodBoardUpload(files) {
        this.uploadedImages = [...this.uploadedImages, ...files];
        this.displayUploadedImages();
        this.updateUIState();
    }

    handleBaseImageUpload(file) {
        this.baseImage = file;
        this.displayBaseImage();
        this.updateUIState();
    }

    displayUploadedImages() {
        const uploadArea = document.getElementById('moodBoardUpload');
        
        // Create uploaded images container if it doesn't exist
        let imagesContainer = uploadArea.querySelector('.uploaded-images');
        if (!imagesContainer) {
            imagesContainer = document.createElement('div');
            imagesContainer.className = 'uploaded-images';
            uploadArea.appendChild(imagesContainer);
        }

        // Clear and rebuild
        imagesContainer.innerHTML = '';
        
        this.uploadedImages.forEach((file, index) => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'uploaded-image';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => this.removeImage(index);
            
            imageDiv.appendChild(img);
            imageDiv.appendChild(removeBtn);
            imagesContainer.appendChild(imageDiv);
        });
    }

    displayBaseImage() {
        const uploadArea = document.getElementById('baseImageUpload');
        
        // Remove existing preview
        const existingPreview = uploadArea.querySelector('.base-image-preview');
        if (existingPreview) {
            existingPreview.remove();
        }

        // Create new preview
        const previewDiv = document.createElement('div');
        previewDiv.className = 'base-image-preview uploaded-image';
        previewDiv.style.marginTop = '15px';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(this.baseImage);
        img.alt = this.baseImage.name;
        img.style.width = '200px';
        img.style.height = '150px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            this.baseImage = null;
            this.baseImageData = null;
            previewDiv.remove();
            this.updateUIState();
        };
        
        previewDiv.appendChild(img);
        previewDiv.appendChild(removeBtn);
        uploadArea.appendChild(previewDiv);
    }

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.displayUploadedImages();
        this.updateUIState();
    }

    // OpenAI API Integration
    async analyzeMoodBoard() {
        if (!this.apiKeys.openai) {
            this.showStatus('Please set your OpenAI API key in settings.', 'error');
            return;
        }

        if (this.uploadedImages.length === 0) {
            this.showStatus('Please upload images first.', 'error');
            return;
        }

        this.showProgress(true, 'Analyzing images...');
        this.moodBoardAnalysis = [];
        
        const analysisContainer = document.getElementById('imageAnalysis');
        analysisContainer.innerHTML = '';

        try {
            // Process images in parallel (but with some delay to avoid rate limits)
            const analysisPromises = this.uploadedImages.map(async (file, index) => {
                // Add delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, index * 1000));
                return this.analyzeImage(file, index);
            });

            const results = await Promise.all(analysisPromises);
            this.moodBoardAnalysis = results.filter(result => result !== null);
            
            await this.compileMoodBoard();
            this.showProgress(false);
            this.showStatus('Mood board analysis completed!', 'success');
            this.updateUIState();
            
        } catch (error) {
            console.error('Error analyzing mood board:', error);
            this.showProgress(false);
            this.showStatus('Error analyzing images. Please try again.', 'error');
        }
    }

    async analyzeImage(file, index) {
        const analysisContainer = document.getElementById('imageAnalysis');
        
        // Create loading item
        const itemDiv = document.createElement('div');
        itemDiv.className = 'image-item';
        itemDiv.innerHTML = `
            <img src="${URL.createObjectURL(file)}" class="image-preview" alt="${file.name}">
            <div class="image-analysis-content">
                <h5>Image ${index + 1}</h5>
                <div class="analysis-text loading">Analyzing vibe and mood...</div>
            </div>
        `;
        analysisContainer.appendChild(itemDiv);

        try {
            const base64Image = await this.fileToBase64(file);
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.openai}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert visual analyst specializing in mood and style analysis for video generation. Analyze images with extreme detail focusing on visual elements that guide video creation: lighting, color palettes, composition, mood, atmosphere, artistic style, and emotional tone."
                        },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "Analyze this image for video generation mood board. Describe in detail: 1) Color palette and lighting style 2) Composition and visual elements 3) Mood and atmosphere 4) Artistic style 5) Emotional tone 6) Visual textures and details. Be extremely specific about visual characteristics that would guide video generation."
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: base64Image
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const analysis = data.choices[0].message.content;

            // Log API call
            this.logApiCall('image_analysis', {
                model: "gpt-4o",
                image: file.name,
                prompt: "Analyze image for mood board"
            }, {
                analysis: analysis
            });

            // Update the item with analysis
            const analysisText = itemDiv.querySelector('.analysis-text');
            analysisText.textContent = analysis;
            analysisText.classList.remove('loading');

            return { file, analysis };
            
        } catch (error) {
            console.error(`Error analyzing image ${index + 1}:`, error);
            const analysisText = itemDiv.querySelector('.analysis-text');
            
            // Show specific error messages
            let errorMessage = 'Error analyzing this image.';
            if (error.message.includes('401')) {
                errorMessage = 'Invalid API key. Check settings.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Rate limit exceeded. Try again later.';
            } else if (error.message.includes('400')) {
                errorMessage = 'Invalid image format or size.';
            }
            
            analysisText.textContent = errorMessage;
            analysisText.classList.remove('loading');
            analysisText.style.color = '#dc3545';
            return null;
        }
    }

    async compileMoodBoard() {
        if (this.moodBoardAnalysis.length === 0) return;

        const finalMoodBoard = document.getElementById('finalMoodBoard');
        finalMoodBoard.textContent = 'Compiling mood board...';

        try {
            const allAnalyses = this.moodBoardAnalysis.map(item => item.analysis).join('\n\n');
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.openai}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert visual style analyst for video generation. Synthesize multiple image analyses into a unified style guide that captures: color palettes, lighting techniques, compositional patterns, mood/atmosphere, artistic style, and visual aesthetic. Focus on elements that directly influence video generation quality and consistency."
                        },
                        {
                            role: "user",
                            content: `Analyze these image descriptions and create a unified mood board for video generation:

${allAnalyses}

Create a comprehensive style description focusing on:
1. Dominant color palette and lighting patterns
2. Consistent compositional elements 
3. Overall mood and emotional tone
4. Artistic style and visual aesthetic
5. Key visual themes across all images
6. Specific details for video generation guidance

Output should be detailed enough to guide consistent video styling and visual coherence.`
                        }
                    ],
                    max_tokens: 800
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const compiledMoodBoard = data.choices[0].message.content;

            // Log API call
            this.logApiCall('mood_board_compilation', {
                model: "gpt-4o",
                input_analyses: this.moodBoardAnalysis.length
            }, {
                compiled_mood_board: compiledMoodBoard
            });

            finalMoodBoard.textContent = compiledMoodBoard;
            this.updateUIState();
            
        } catch (error) {
            console.error('Error compiling mood board:', error);
            finalMoodBoard.textContent = 'Error compiling mood board. Please try again.';
        }
    }

    // Final Prompt Generation
    async generateFinalPrompt() {
        const scriptInput = document.getElementById('scriptInput').value.trim();
        const moodBoardText = document.getElementById('finalMoodBoard').textContent;
        const baseImageDesc = document.getElementById('baseImageDescription').value.trim();
        const finalPromptArea = document.getElementById('finalPrompt');

        if (!scriptInput || !moodBoardText || !baseImageDesc) {
            this.showStatus('Please complete all sections before generating the final prompt.', 'error');
            return;
        }

        finalPromptArea.value = 'Generating detailed video prompt...';
        this.showProgress(true, 'Creating final prompt...');

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.openai}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert AI video generation prompt engineer. Create extremely detailed, cinematic prompts for 5-second image-to-video generation. Focus on: 1) Specific camera movements and angles 2) Detailed lighting and visual effects 3) Precise subject movements and actions 4) Environmental elements and atmosphere 5) Technical specifications for video generation. Always incorporate the base image as the starting frame."
                        },
                        {
                            role: "user",
                            content: `Create a detailed video generation prompt for ByteDance Seedance model based on these inputs:

SCRIPT/NARRATIVE:
${scriptInput}

VISUAL STYLE/MOOD:
${moodBoardText}

BASE IMAGE (starting frame):
${baseImageDesc}

Generate a comprehensive prompt that includes:
- Second-by-second action description (5 seconds)
- Camera movements (pans, zooms, tracking shots)
- Lighting changes and visual effects
- Subject movements and expressions
- Environmental details and atmosphere
- Technical specifications for smooth motion

The base image is the starting frame - describe how it transitions and evolves over 5 seconds while maintaining visual coherence with the mood board style.`
                        }
                    ],
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const finalPrompt = data.choices[0].message.content;

            // Log API call
            this.logApiCall('final_prompt_generation', {
                model: "gpt-4o",
                script: scriptInput.substring(0, 100) + "...",
                base_image_desc: baseImageDesc.substring(0, 100) + "..."
            }, {
                final_prompt: finalPrompt
            });

            finalPromptArea.value = finalPrompt;
            this.updatePromptLength();
            this.showProgress(false);
            this.showStatus('Final prompt generated successfully!', 'success');
            this.updateUIState();
            
        } catch (error) {
            console.error('Error generating final prompt:', error);
            finalPromptArea.value = 'Error generating prompt. Please try again.';
            this.showProgress(false);
            this.showStatus('Error generating prompt. Please try again.', 'error');
        }
    }

    // Video Generation
    async generateVideo() {
        const finalPrompt = document.getElementById('finalPrompt').value.trim();
        if (!finalPrompt || !this.baseImage) {
            this.showStatus('Please ensure you have a final prompt and base image.', 'error');
            return;
        }

        this.showProgress(true, 'Generating video... This may take several minutes.');
        
        try {
            const generator = new VideoGenerator();
            const imageDescription = document.getElementById('baseImageDescription').value.trim();
            
            const result = await generator.generateVideo(finalPrompt, this.baseImage, imageDescription);
            
            this.showProgress(false);
            this.showStatus('Video generation completed!', 'success');
            this.displayGeneratedVideo(result.video_url);
            
        } catch (error) {
            console.error('Error generating video:', error);
            this.showProgress(false);
            this.showStatus(`Error generating video: ${error.message}`, 'error');
        }
    }



    displayGeneratedVideo(videoUrl) {
        const videoElement = document.getElementById('generatedVideo');
        videoElement.src = videoUrl;
        
        document.getElementById('videoResult').style.display = 'block';
        document.getElementById('videoResult').scrollIntoView({ behavior: 'smooth' });
    }

    // Utility Functions
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // FileReader already returns correct format: data:image/png;base64,xxx
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('generationStatus');
        statusDiv.textContent = message;
        statusDiv.className = `generation-status ${type}`;
        statusDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    showProgress(show, text = '') {
        const progressContainer = document.getElementById('progressContainer');
        const progressText = document.getElementById('progressText');
        
        if (show) {
            progressContainer.style.display = 'block';
            progressText.textContent = text;
            this.updateProgress(0);
        } else {
            progressContainer.style.display = 'none';
        }
    }

    updateProgress(percentage, text = '') {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = `${percentage}%`;
        if (text) {
            progressText.textContent = text;
        }
    }

    downloadVideo() {
        const videoElement = document.getElementById('generatedVideo');
        if (videoElement.src) {
            const a = document.createElement('a');
            a.href = videoElement.src;
            a.download = 'generated_video.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.showStatus('Video download started!', 'success');
        } else {
            this.showStatus('No video to download.', 'error');
        }
    }

    resetApp() {
        // Download current project log before reset
        if (this.apiLogs.length > 0) {
            this.downloadProjectLog();
        }
        
        // Reset all data
        this.uploadedImages = [];
        this.moodBoardAnalysis = [];
        this.baseImage = null;
        this.baseImageData = null;
        
        // Start new project
        this.projectId = this.generateProjectId();
        this.apiLogs = [];
        this.updateProjectDisplay();
        
        // Clear UI
        document.getElementById('scriptInput').value = '';
        document.getElementById('baseImageDescription').value = '';
        document.getElementById('finalPrompt').value = '';
        document.getElementById('imageAnalysis').innerHTML = '';
        document.getElementById('finalMoodBoard').textContent = 'Analysis will appear here after processing images...';
        document.getElementById('videoResult').style.display = 'none';
        
        // Remove uploaded image previews
        const uploadedImagesContainer = document.querySelector('.uploaded-images');
        if (uploadedImagesContainer) {
            uploadedImagesContainer.remove();
        }
        
        const baseImagePreview = document.querySelector('.base-image-preview');
        if (baseImagePreview) {
            baseImagePreview.remove();
        }
        
        // Update counters and state
        this.updateCharacterCount();
        this.updatePromptLength();
        this.updateUIState();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.showStatus('App reset successfully!', 'success');
    }

    // Output logging functions
    generateProjectId() {
        const now = new Date();
        return `project_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`;
    }

    updateProjectDisplay() {
        document.getElementById('projectId').textContent = `Project: ${this.projectId}`;
    }

    logApiCall(type, request, response) {
        const timestamp = new Date().toISOString();
        this.apiLogs.push({
            timestamp,
            type,
            request,
            response
        });
    }

    downloadProjectLog() {
        const logContent = this.generateLogContent();
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.projectId}_api_log.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateLogContent() {
        let content = `PROJECT: ${this.projectId}\n`;
        content += `GENERATED: ${new Date().toISOString()}\n`;
        content += `${'='.repeat(50)}\n\n`;
        
        this.apiLogs.forEach((log, index) => {
            content += `[${index + 1}] ${log.type.toUpperCase()}\n`;
            content += `Time: ${log.timestamp}\n`;
            content += `Request: ${JSON.stringify(log.request, null, 2)}\n`;
            content += `Response: ${JSON.stringify(log.response, null, 2)}\n`;
            content += `${'='.repeat(50)}\n\n`;
        });
        
        return content;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.videoApp = new VideoGenerationApp();
}); 