import React, { useState, useEffect, useRef } from 'react';
import { Camera, Hand, Trophy, TrendingDown, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';

const MP_HANDS_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.min.js";
const MP_CAMERA_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
const MP_DRAW_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

const SignLanguageApp = ({ onBackToLanding }) => {
  const [currentLetter, setCurrentLetter] = useState('A');
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [bestLetter, setBestLetter] = useState('A');
  const [worstLetter, setWorstLetter] = useState('C');
  const [sessionActive, setSessionActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState('None');
  const [feedback, setFeedback] = useState('');
  const [trainingData, setTrainingData] = useState([]);
  const [trainingLabels, setTrainingLabels] = useState([]);
  const [selectedLetterIdx, setSelectedLetterIdx] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mpCameraRef = useRef(null);
  const mpHandsRef = useRef(null);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const currentLandmarksRef = useRef(null);

  // Load training data from localStorage
  useEffect(() => {
    const data = localStorage.getItem('asl_training_data');
    const labels = localStorage.getItem('asl_training_labels');
    if (data && labels) {
      setTrainingData(JSON.parse(data));
      setTrainingLabels(JSON.parse(labels));
    }
  }, []);

  // Save training data to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('asl_training_data', JSON.stringify(trainingData));
    localStorage.setItem('asl_training_labels', JSON.stringify(trainingLabels));
    alert("Training data saved.");
  };

  const clearTrainingData = () => {
    setTrainingData([]);
    setTrainingLabels([]);
    localStorage.clear();
    alert("Training data cleared.");
  };

  const exportTrainingData = () => {
    const data = { trainingData, trainingLabels };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asl_training_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importTrainingData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data.trainingData) && Array.isArray(data.trainingLabels)) {
          setTrainingData(data.trainingData);
          setTrainingLabels(data.trainingLabels);
          alert(`Imported ${data.trainingLabels.length} samples.`);
          saveToLocalStorage();
        } else {
          alert("Invalid file format.");
        }
      } catch (err) {
        alert("Failed to import: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // KNN Classifier
  function euclidean(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }
  function classifyGesture(input, k = 3, threshold = 1.5) {
    if (trainingData.length === 0) return "None";
    const distances = trainingData.map((sample, i) => ({
      label: trainingLabels[i],
      dist: euclidean(sample, input)
    }));
    distances.sort((a, b) => a.dist - b.dist);
    const topK = distances.slice(0, k);
    if (topK[0].dist > threshold) return "None";
    const votes = {};
    topK.forEach(d => votes[d.label] = (votes[d.label] || 0) + 1);
    return Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
  }

  // MediaPipe Hands setup
  useEffect(() => {
    if (!sessionActive) return;
    let hands, camera;
    let isMounted = true;

    async function setupMediaPipe() {
      await loadScript(MP_HANDS_URL);
      await loadScript(MP_CAMERA_URL);
      await loadScript(MP_DRAW_URL);

      // eslint-disable-next-line no-undef
      hands = new window.Hands({
        locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      hands.onResults(results => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          // eslint-disable-next-line no-undef
          drawConnectors(ctx, results.multiHandLandmarks[0], HAND_CONNECTIONS, { color: '#0ff', lineWidth: 4 });
          // eslint-disable-next-line no-undef
          drawLandmarks(ctx, results.multiHandLandmarks[0], { color: '#ff0', lineWidth: 2 });
          currentLandmarksRef.current = results.multiHandLandmarks[0];
          const features = currentLandmarksRef.current.flatMap(pt => [pt.x, pt.y, pt.z]);
          if (trainingData.length > 0) {
            const predicted = classifyGesture(features);
            setPrediction(predicted);
            if (predicted === currentLetter) {
              setIsCorrect(true);
              setCorrectCount(prev => prev + 1);
              setFeedback("✅ Correct!");
              setTimeout(() => {
                setIsCorrect(false);
                setFeedback('');
                nextLetter();
              }, 1500);
            }
          } else {
            setPrediction('None');
          }
        } else {
          currentLandmarksRef.current = null;
          setPrediction('None');
        }
        ctx.restore();
      });

      // eslint-disable-next-line no-undef
      camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });
      camera.start();

      mpCameraRef.current = camera;
      mpHandsRef.current = hands;
    }

    setupMediaPipe();

    return () => {
      isMounted = false;
      if (mpCameraRef.current) mpCameraRef.current.stop();
      if (mpHandsRef.current) mpHandsRef.current.close();
    };
    // eslint-disable-next-line
  }, [sessionActive, trainingData, trainingLabels, currentLetter]);

  // Camera start/stop
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
    if (mpCameraRef.current) mpCameraRef.current.stop();
    if (mpHandsRef.current) mpHandsRef.current.close();
  };
  
  // Reset session
  const resetSession = () => {
    setCurrentLetter('A');
    setSelectedLetterIdx(0);
    setIsCorrect(false);
    setCorrectCount(0);
    setBestLetter('A');
    setWorstLetter('C');
    setPrediction('None');
    setFeedback('');
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (mpCameraRef.current) mpCameraRef.current.stop();
      if (mpHandsRef.current) mpHandsRef.current.close();
    };
    // eslint-disable-next-line
  }, []);

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
                  <div
                    className="relative"
                    style={{ width: 640, height: 480, margin: "0 auto" }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      width={640}
                      height={480}
                      style={{
                        width: 640,
                        height: 480,
                        objectFit: "cover",
                        transform: "scaleX(-1)",
                        display: "block",
                        position: "absolute",
                        left: 0,
                        top: 0,
                        zIndex: 1,
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={480}
                      style={{
                        width: 640,
                        height: 480,
                        position: "absolute",
                        left: 0,
                        top: 0,
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Video Controls */}
              
            </div>
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