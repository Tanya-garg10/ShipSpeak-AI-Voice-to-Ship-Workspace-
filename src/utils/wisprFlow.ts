/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Wispr Flow API utility for voice dictation using WebSocket
 * Documentation: https://api-docs.wisprflow.ai/websocket_api
 */

export interface WisprFlowConfig {
  apiKey?: string;
  language?: string[];
  context?: {
    app?: {
      type?: 'email' | 'ai' | 'other';
      name?: string;
    };
    dictionary_context?: Array<{
      word: string;
      replacement: string;
    }>;
    textbox_contents?: {
      before_text?: string;
      selected_text?: string;
      after_text?: string;
    };
  };
}

export interface WisprFlowResult {
  text: string;
  isFinal: boolean;
  detectedLanguage?: string;
}

export class WisprFlowClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private config: WisprFlowConfig;
  private isRecording: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private onTranscriptCallback: ((result: WisprFlowResult) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private onStatusCallback: ((status: 'connecting' | 'connected' | 'recording' | 'stopped' | 'error') => void) | null = null;

  constructor(apiKey: string, config: WisprFlowConfig = {}) {
    this.apiKey = apiKey;
    this.config = {
      language: ['en'],
      ...config
    };
  }

  /**
   * Initialize the WebSocket connection
   */
  private connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const encodedKey = encodeURIComponent(`Bearer ${this.apiKey}`);
      const wsUrl = `wss://platform-api.wisprflow.ai/api/v1/dash/ws?api_key=${encodedKey}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Wispr Flow WebSocket connected');
        this.onStatusCallback?.('connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('Wispr Flow WebSocket error:', error);
        this.onStatusCallback?.('error');
        this.onErrorCallback?.(new Error('WebSocket connection failed'));
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('Wispr Flow WebSocket closed');
        this.onStatusCallback?.('stopped');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: any) {
    if (message.type === 'partial') {
      // Partial transcription result
      this.onTranscriptCallback?.({
        text: message.text || '',
        isFinal: false,
        detectedLanguage: message.detected_language
      });
    } else if (message.type === 'final') {
      // Final transcription result
      this.onTranscriptCallback?.({
        text: message.text || '',
        isFinal: true,
        detectedLanguage: message.detected_language
      });
    } else if (message.type === 'error') {
      console.error('Wispr Flow API error:', message);
      this.onErrorCallback?.(new Error(message.message || 'Transcription error'));
    }
  }

  /**
   * Start recording and transcribing
   */
  async startRecording(
    onTranscript: (result: WisprFlowResult) => void,
    onError?: (error: Error) => void,
    onStatus?: (status: 'connecting' | 'connected' | 'recording' | 'stopped' | 'error') => void
  ): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError || null;
    this.onStatusCallback = onStatus || null;
    this.audioChunks = [];

    try {
      this.onStatusCallback?.('connecting');

      // Connect to WebSocket
      await this.connectWebSocket();

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16
        }
      });

      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.sendAudioChunk(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.stopRecording();
      };

      // Start recording
      this.mediaRecorder.start(1000); // Send chunks every 1 second
      this.isRecording = true;
      this.onStatusCallback?.('recording');

      // Send start message to Wispr Flow
      this.sendStartMessage();

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onStatusCallback?.('error');
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  /**
   * Send start message to Wispr Flow
   */
  private sendStartMessage() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const startMessage = {
      type: 'start',
      language: this.config.language || ['en'],
      context: this.config.context || {
        app: {
          type: 'ai',
          name: 'ShipSpeak AI'
        }
      }
    };

    this.ws.send(JSON.stringify(startMessage));
  }

  /**
   * Send audio chunk to Wispr Flow
   */
  private async sendAudioChunk(chunk: Blob) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Convert audio to required format (16kHz, single-channel, int16 PCM)
      const audioBuffer = await chunk.arrayBuffer();
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const decodedAudio = await audioContext.decodeAudioData(audioBuffer);

      // Convert to mono if needed
      const numberOfChannels = decodedAudio.numberOfChannels;
      const length = decodedAudio.length;
      const offlineContext = new OfflineAudioContext(1, length, 16000);
      const source = offlineContext.createBufferSource();
      source.buffer = decodedAudio;

      if (numberOfChannels > 1) {
        // Mix down to mono
        const channelData = [];
        for (let i = 0; i < numberOfChannels; i++) {
          channelData.push(decodedAudio.getChannelData(i));
        }
        const monoBuffer = offlineContext.createBuffer(1, length, 16000);
        const monoData = monoBuffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
          let sum = 0;
          for (let j = 0; j < numberOfChannels; j++) {
            sum += channelData[j][i];
          }
          monoData[i] = sum / numberOfChannels;
        }
        source.buffer = monoBuffer;
      }

      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();

      // Convert to base64
      const float32Array = renderedBuffer.getChannelData(0);
      const int16Array = new Int16Array(float32Array.length);
      for (let i = 0; i < float32Array.length; i++) {
        int16Array[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32768));
      }

      const base64 = this.arrayBufferToBase64(int16Array.buffer);

      // Send append message
      const appendMessage = {
        type: 'append',
        audio: base64,
        position: this.audioChunks.length - 1
      };

      this.ws.send(JSON.stringify(appendMessage));

    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  /**
   * Stop recording
   */
  stopRecording() {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;

    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    // Send commit message to Wispr Flow
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const commitMessage = {
        type: 'commit',
        total_packets: this.audioChunks.length
      };
      this.ws.send(JSON.stringify(commitMessage));
    }

    // Close WebSocket after a short delay
    setTimeout(() => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }, 1000);

    this.onStatusCallback?.('stopped');
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    this.stopRecording();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Helper: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * Check if Wispr Flow API key is available
 */
export function hasWisprFlowApiKey(): boolean {
  // In production, this would check environment variables
  // For client-side, we'll check if a key was provided
  return typeof process !== 'undefined' && !!process.env.WISPRFLOW_API_KEY;
}
