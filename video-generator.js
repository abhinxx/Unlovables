// Standalone Video Generation Script for ByteDance ModelArk
class VideoGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('bytedance_api_key') || '';
        // Use the proxy API endpoints instead of direct ByteDance API
        this.baseUrl = window.location.origin; // Use current domain
        this.apiUrl = `${this.baseUrl}/api/video`;
        this.statusUrl = `${this.baseUrl}/api/video-status`;
    }

    // Save prompt to text file
    savePromptToFile(prompt) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `prompt_${timestamp}.txt`;
        
        const blob = new Blob([prompt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`Prompt saved to: ${filename}`);
        return filename;
    }

    // Convert image file to base64 data URI
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Main video generation function
    async generateVideo(prompt, publicImageUrl, imageDescription, onProgress) {
        try {
            console.log('Starting video generation with public URL:', publicImageUrl);
            console.log('Using proxy API:', this.apiUrl);
            
            // Save prompt to file
            this.savePromptToFile(prompt);
            
            // Payload for proxy API
            const payload = {
                apiKey: this.apiKey,
                model: "seedance-1-0-lite-i2v-250428",
                content: [
                    {
                        type: "text",
                        text: `${prompt} --resolution 720p --duration 5 --camerafixed false`
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: publicImageUrl
                        }
                    }
                ]
            };

            console.log('Making API call through proxy...');

            // Call proxy API instead of ByteDance directly
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Proxy API Error:', errorData);
                throw new Error(`API Error ${response.status}: ${errorData}`);
            }

            const taskData = await response.json();
            console.log('Task created:', taskData);

            // Poll for completion
            return await this.pollTaskStatus(taskData.id, onProgress);

        } catch (error) {
            console.error('Video generation failed:', error);
            throw error;
        }
    }

    // Poll task status until completion
    async pollTaskStatus(taskId, onProgress) {
        const maxAttempts = 60; // 5 minutes max
        let attempts = 0;
        
        console.log(`Polling task ${taskId}...`);

        while (attempts < maxAttempts) {
            try {
                // Use proxy API for status checking
                const response = await fetch(`${this.statusUrl}?taskId=${taskId}&apiKey=${this.apiKey}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Status check failed: ${response.status} - ${errorText}`);
                }

                const status = await response.json();
                const currentStatus = (status && status.status) ? status.status.trim().toLowerCase() : '';
                console.log(`Attempt ${attempts + 1}: Received status='${status.status}', normalized to='${currentStatus}'`);

                if (onProgress) {
                    onProgress(status);
                }

                if (currentStatus === 'succeeded') {
                    console.log('Video generation completed!', JSON.stringify(status, null, 2));
                    
                    // Try multiple possible locations for the video URL
                    let videoUrl = null;
                    
                    // Option 1: status.result.files[0].url
                    if (status.result && status.result.files && status.result.files.length > 0) {
                        videoUrl = status.result.files[0].url;
                        console.log('Found video URL in result.files[0].url:', videoUrl);
                    }
                    // Option 2: status.result.video_url
                    else if (status.result && status.result.video_url) {
                        videoUrl = status.result.video_url;
                        console.log('Found video URL in result.video_url:', videoUrl);
                    }
                    // Option 3: status.result.url
                    else if (status.result && status.result.url) {
                        videoUrl = status.result.url;
                        console.log('Found video URL in result.url:', videoUrl);
                    }
                    // Option 4: status.video_url
                    else if (status.video_url) {
                        videoUrl = status.video_url;
                        console.log('Found video URL in status.video_url:', videoUrl);
                    }
                    // Option 5: Look for any property containing 'url' in the result
                    else if (status.result) {
                        const resultKeys = Object.keys(status.result);
                        for (const key of resultKeys) {
                            if (key.toLowerCase().includes('url') && status.result[key]) {
                                videoUrl = status.result[key];
                                console.log(`Found video URL in result.${key}:`, videoUrl);
                                break;
                            }
                        }
                    }
                    
                    if (!videoUrl) {
                        console.error('Video URL not found in response. Full response:', JSON.stringify(status, null, 2));
                        console.error('Available result keys:', status.result ? Object.keys(status.result) : 'No result object');
                    }
                    
                    return { ...status.result, video_url: videoUrl };
                } else if (currentStatus === 'failed') {
                    throw new Error(`Task failed: ${status.error || 'Unknown error'}`);
                }

                // Wait 5 seconds before next check
                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;

            } catch (error) {
                console.error('Error checking status:', error);
                throw error;
            }
        }

        throw new Error('Task timed out after 5 minutes');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoGenerator;
}

// Make available globally
window.VideoGenerator = VideoGenerator; 