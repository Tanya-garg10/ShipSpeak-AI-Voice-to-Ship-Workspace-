/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Zap } from 'lucide-react';
import { WisprFlowClient, WisprFlowResult } from '../utils/wisprFlow';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  tooltipText?: string;
  wisprFlowApiKey?: string;
}

// Support Web Speech API types
declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  tooltipText = 'Dictate with Voice / Wispr Flow',
  wisprFlowApiKey
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [useWisprFlow, setUseWisprFlow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'recording' | 'error'>('idle');
  const recognitionRef = useRef<any>(null);
  const wisprFlowClientRef = useRef<WisprFlowClient | null>(null);
  const transcriptBufferRef = useRef<string>('');

  useEffect(() => {
    // Determine if we should use Wispr Flow
    const shouldUseWisprFlow = !!wisprFlowApiKey;
    setUseWisprFlow(shouldUseWisprFlow);

    if (!shouldUseWisprFlow) {
      // Fall back to Web Speech API
      initWebSpeechAPI();
    }

    return () => {
      cleanup();
    };
  }, [wisprFlowApiKey]);

  const initWebSpeechAPI = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (currentTranscript.trim()) {
          onTranscript(currentTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not initialize SpeechRecognition:', e);
      setIsSupported(false);
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
    if (wisprFlowClientRef.current) {
      wisprFlowClientRef.current.disconnect();
      wisprFlowClientRef.current = null;
    }
  };

  const handleWisprFlowTranscript = (result: WisprFlowResult) => {
    if (result.isFinal && result.text.trim()) {
      onTranscript(result.text.trim());
    }
  };

  const handleWisprFlowError = (error: Error) => {
    console.error('Wispr Flow error:', error);
    setStatus('error');
    setIsListening(false);
    // Fall back to Web Speech API
    setUseWisprFlow(false);
    initWebSpeechAPI();
  };

  const handleWisprFlowStatus = (status: 'connecting' | 'connected' | 'recording' | 'stopped' | 'error') => {
    if (status === 'connecting') setStatus('connecting');
    else if (status === 'connected') setStatus('connected');
    else if (status === 'recording') setStatus('recording');
    else if (status === 'stopped') setStatus('idle');
    else if (status === 'error') setStatus('error');
  };

  const toggleListening = async () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. You can still use the Wispr Flow desktop app to dictate directly into any text field!');
      return;
    }

    if (isListening) {
      // Stop listening
      if (useWisprFlow && wisprFlowClientRef.current) {
        wisprFlowClientRef.current.stopRecording();
      } else if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setStatus('idle');
    } else {
      // Start listening
      setIsListening(true);

      if (useWisprFlow && wisprFlowApiKey) {
        try {
          if (!wisprFlowClientRef.current) {
            wisprFlowClientRef.current = new WisprFlowClient(wisprFlowApiKey, {
              language: ['en'],
              context: {
                app: {
                  type: 'ai',
                  name: 'ShipSpeak AI'
                }
              }
            });
          }

          await wisprFlowClientRef.current.startRecording(
            handleWisprFlowTranscript,
            handleWisprFlowError,
            handleWisprFlowStatus
          );
        } catch (err) {
          console.error('Failed to start Wispr Flow:', err);
          handleWisprFlowError(err as Error);
        }
      } else if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('Failed to start speech recognition:', err);
          setIsListening(false);
        }
      }
    }
  };

  const getStatusIndicator = () => {
    if (status === 'connecting') return 'Connecting...';
    if (status === 'error') return 'Error';
    if (isListening) return 'Listening...';
    return 'Dictate';
  };

  const getStatusIcon = () => {
    if (status === 'connecting') return <Mic className="w-3.5 h-3.5 text-amber-600 animate-spin" />;
    if (status === 'error') return <MicOff className="w-3.5 h-3.5 text-rose-600" />;
    if (isListening) return <MicOff className="w-3.5 h-3.5 text-rose-600 animate-spin" />;
    if (useWisprFlow) return <Zap className="w-3.5 h-3.5 text-violet-600" />;
    return <Mic className="w-3.5 h-3.5 text-violet-600" />;
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={tooltipText}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        isListening
          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
          : status === 'connecting'
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : status === 'error'
          ? 'bg-rose-50 text-rose-700 border border-rose-200'
          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/80'
      } ${className}`}
    >
      {getStatusIcon()}
      <span>{getStatusIndicator()}</span>
      {useWisprFlow && !isListening && (
        <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-semibold">
          AI
        </span>
      )}
    </button>
  );
};
