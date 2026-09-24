import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, X, Globe } from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  placeholderHint?: string;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md';
  defaultLanguage?: 'bn-BD' | 'en-US';
}

// Global typing for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onTranscript,
  placeholderHint = 'সবজির নাম বা ক্রেতার নাম বলুন...',
  className = '',
  buttonClassName = '',
  size = 'md',
  defaultLanguage = 'bn-BD'
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [language, setLanguage] = useState<'bn-BD' | 'en-US'>(defaultLanguage);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognition = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore stop error if already stopped
      }
      recognitionRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const startListening = () => {
    setErrorMessage(null);
    setInterimTranscript('');

    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognition = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট নেই। গুগল ক্রোম (Chrome) ব্যবহার করুন।');
      return;
    }

    try {
      // Stop previous instance if running
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);

        // Auto-stop after 8 seconds if no speech is recognized
        timeoutRef.current = setTimeout(() => {
          if (isListening) {
            stopListening();
          }
        }, 8000);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTranscript) {
          const cleanText = finalTranscript.trim().replace(/[।.,!?]+$/, '');
          setInterimTranscript(cleanText);
          onTranscript(cleanText);

          // Give a short visual feedback before closing
          setTimeout(() => {
            stopListening();
          }, 350);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('মাইক্রোফোনের অনুমতি প্রদান করা হয়নি। ব্রাউজার সেটিংসে অনুমতি দিন।');
        } else if (event.error === 'no-speech') {
          setErrorMessage('কোনো আওয়াজ শোনা যায়নি। দয়া করে স্পষ্ট করে বলুন।');
        } else if (event.error === 'network') {
          setErrorMessage('ভয়েস সার্ভারের সাথে সংযোগ পাওয়া যায়নি। ইন্টারনেট সংযোগ চেক করুন।');
        } else {
          setErrorMessage('ভয়েস ইনপুট নেওয়া সম্ভব হয়নি। আবার চেষ্টা করুন।');
        }
        setTimeout(() => {
          stopListening();
        }, 2500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage('ভয়েস সার্চ চালু করা যায়নি।');
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'bn-BD' ? 'en-US' : 'bn-BD';
    setLanguage(nextLang);
    if (isListening) {
      stopListening();
    }
  };

  // If not supported by browser, show disabled icon with helpful title
  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="এই ব্রাউজারে ভয়েস সার্চ সুবিধা নেই (Chrome ব্রাউজারে চলবে)"
        className={`p-1.5 rounded-lg text-stone-300 dark:text-stone-600 cursor-not-allowed ${className}`}
      >
        <MicOff className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </button>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Voice Trigger Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`relative p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isListening
            ? 'bg-rose-600 text-white shadow-md animate-pulse ring-2 ring-rose-400 ring-offset-1'
            : 'text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800'
        } ${buttonClassName}`}
        title={isListening ? 'শোনা বন্ধ করুন' : `ভয়েস সার্চ করুন (${language === 'bn-BD' ? 'বাংলা' : 'English'})`}
      >
        {isListening ? (
          <span className="relative flex items-center justify-center">
            <Mic className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-bounce`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-200 animate-ping" />
          </span>
        ) : (
          <Mic className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        )}
      </button>

      {/* Active Listening Popover / Floating Indicator */}
      {isListening && (
        <div className="fixed sm:absolute z-50 bottom-24 sm:bottom-auto sm:top-full left-1/2 -translate-x-1/2 sm:mt-2 w-[90vw] sm:w-80 p-3.5 bg-stone-900/95 dark:bg-stone-950/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-stone-700 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold text-rose-400">
                শুনছি... কথা বলুন
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switch */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center gap-1"
                title="ভাষা পরিবর্তন করুন"
              >
                <Globe className="w-2.5 h-2.5" />
                {language === 'bn-BD' ? 'বাংলা' : 'EN'}
              </button>

              {/* Close / Cancel */}
              <button
                type="button"
                onClick={stopListening}
                className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="বাতিল করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Transcript display */}
          <div className="min-h-[42px] flex items-center justify-center p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 text-center">
            {interimTranscript ? (
              <p className="text-sm font-semibold text-emerald-400 animate-pulse">
                &ldquo;{interimTranscript}&rdquo;
              </p>
            ) : (
              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <Volume2 className="w-4 h-4 animate-pulse text-rose-400" />
                <span>{placeholderHint}</span>
              </div>
            )}
          </div>

          {/* Sound Waves Animation */}
          <div className="flex items-center justify-center gap-1 py-1">
            <span className="w-1 h-3 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-6 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
            <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
            <span className="w-1 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></span>
          </div>

          {/* Quick Bengali tips */}
          <div className="text-[11px] text-stone-400 text-center">
            {language === 'bn-BD' ? (
              <span>টিপস: স্পষ্ট করে নাম বা মেমো নম্বর বলুন</span>
            ) : (
              <span>Tip: Speak product or customer name clearly</span>
            )}
          </div>
        </div>
      )}

      {/* Error message toast */}
      {errorMessage && (
        <div className="fixed sm:absolute z-50 bottom-24 sm:bottom-auto sm:top-full left-1/2 -translate-x-1/2 sm:mt-2 w-[85vw] sm:w-72 p-2.5 bg-rose-900/95 text-rose-100 text-xs rounded-xl shadow-xl border border-rose-700 text-center animate-in fade-in">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
