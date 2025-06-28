import React, { useState, useEffect, useRef } from 'react';
import { Camera, Hand, Trophy, TrendingDown, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';

const SignLanguageApp = ({ onBackToLanding }) => {
  const [currentLetter, setCurrentLetter] = useState('A');
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(6);
  const [bestLetter, setBestLetter] = useState('A');
  const [worstLetter, setWorstLetter] = useState('C');
  const [sessionActive, setSessionActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setSessionActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access is required for this app to work. Please allow camera permissions and try again.');
    }
    setIsLoading(false);
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setSessionActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const nextLetter = () => {
    const currentIndex = alphabet.indexOf(currentLetter);
    const nextIndex = (currentIndex + 1) % alphabet.length;
    setCurrentLetter(alphabet[nextIndex]);
    setIsCorrect(false);
  };

  const simulateCorrectSign = () => {
    setIsCorrect(true);
    setCorrectCount(prev => prev + 1);
    
    // Simulate updating best/worst letters
    const randomLetters = alphabet.filter(l => l !== bestLetter && l !== worstLetter);
    if (Math.random() > 0.7) {
      setBestLetter(randomLetters[Math.floor(Math.random() * randomLetters.length)]);
    }
    
    setTimeout(() => {
      nextLetter();
    }, 2000);
  };

  const resetSession = () => {
    setCurrentLetter('A');
    setIsCorrect(false);
    setCorrectCount(0);
    setBestLetter('A');
    setWorstLetter('C');
  };

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  return (
    <div className="h-screen bg-gray-900 text-white p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Back Button */}
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="absolute left-0 top-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>
          )}
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            ASL Alphabet Trainer
          </h1>
          <p className="text-gray-400">Learn American Sign Language alphabet with real-time feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            {/* Prompt Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <Hand className="text-white text-3xl" />
                <h2 className="text-2xl font-bold text-white">
                  Show the hand sign for the letter {currentLetter}
                </h2>
              </div>
            </div>

            {/* Video Container */}
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700">
              <div className="aspect-video w-full">
                {!sessionActive ? (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center">
                      <Camera className="mx-auto mb-4 text-6xl text-gray-500" />
                      <h3 className="text-xl font-semibold mb-4 text-gray-300">Ready to start learning?</h3>
                      <button
                        onClick={startCamera}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Starting Camera...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            Start Camera
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Video Controls */}
              {sessionActive && (
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={stopCamera}
                      className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors"
                    >
                      <Pause className="w-5 h-5" />
                    </button>
                    <button
                      onClick={resetSession}
                      className="bg-gray-600 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                    <span className="text-sm font-medium">Letter: {currentLetter}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Practice Button */}
            {sessionActive && (
              <div className="mt-6 text-center">
                <button
                  onClick={simulateCorrectSign}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Simulate Correct Sign (for demo)
                </button>
                <p className="text-gray-400 text-sm mt-2">In the real app, this would be automatic recognition</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Summary */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-center">Session Summary</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                  <span className="font-semibold">Best Letter</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-400">{bestLetter}</span>
                    <Trophy className="text-green-400 w-5 h-5" />
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                  <span className="font-semibold">Worst Letter</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-400">{worstLetter}</span>
                    <TrendingDown className="text-red-400 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Correct Feedback */}
            <div className={`rounded-xl p-6 shadow-xl border transition-all duration-500 ${
              isCorrect 
                ? 'bg-gradient-to-r from-green-600 to-green-500 border-green-400 transform scale-105' 
                : 'bg-gray-800 border-gray-700'
            }`}>
              <div className="text-center">
                {isCorrect ? (
                  <div className="animate-pulse">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="bg-blue-500 rounded-full p-3">
                        <span className="text-white font-bold text-lg">{correctCount}</span>
                      </div>
                      <span className="text-4xl font-bold text-white">Correct!</span>
                    </div>
                    <p className="text-green-100">Great job! Moving to next letter...</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="bg-blue-500 rounded-full p-3">
                        <span className="text-white font-bold text-lg">{correctCount}</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-300">Streak!</span>
                    </div>
                    <p className="text-gray-400">Keep going!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <h4 className="font-semibold mb-4">Alphabet Progress</h4>
              <div className="grid grid-cols-6 gap-2">
                {alphabet.map((letter, index) => (
                  <div
                    key={letter}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                      letter === currentLetter
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : letter === bestLetter
                        ? 'bg-green-500 text-white'
                        : letter === worstLetter
                        ? 'bg-red-500 text-white'
                        : index < alphabet.indexOf(currentLetter)
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Best</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Needs Practice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguageApp;