// Standalone Video Generation Script for ByteDance ModelArk
class VideoGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('bytedance_api_key') || '';
        this.apiUrl = 'https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks';
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
    async generateVideo(prompt, imageFile, imageDescription) {
        try {
            console.log('Starting video generation...');
            console.log('API URL:', this.apiUrl);
            console.log('API Key:', this.apiKey);
            
            // Save prompt to file
            this.savePromptToFile(prompt);

            // Convert image to base64
            const imageUrl = await this.imageToBase64(imageFile);
            console.log('Image converted to base64, length:', imageUrl.length);
            
            // Simple payload exactly like curl example
            const payload = {
                model: "seedance-1-0-lite-i2v-250428",
                content: [
                    {
                        type: "text",
                        text: `${prompt} --resolution 720p --duration 5 --camerafixed false`
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageUrl
                        }
                    }
                ]
            };

            console.log('Making API call...');

            // Simple fetch exactly like curl
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('API Error:', errorData);
                throw new Error(`API Error ${response.status}: ${errorData}`);
            }

            const taskData = await response.json();
            console.log('Task created:', taskData);

            // Poll for completion
            return await this.pollTaskStatus(taskData.id);

        } catch (error) {
            console.error('Video generation failed:', error);
            throw error;
        }
    }

    // Poll task status until completion
    async pollTaskStatus(taskId) {
        const maxAttempts = 60; // 5 minutes max
        let attempts = 0;
        
        console.log(`Polling task ${taskId}...`);

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${this.apiUrl}/${taskId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Status check failed: ${response.status} - ${errorText}`);
                }

                const status = await response.json();
                console.log(`Attempt ${attempts + 1}: Status = ${status.status}`);

                if (status.status === 'completed') {
                    console.log('Video generation completed!');
                    return status.result;
                } else if (status.status === 'failed') {
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