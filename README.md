# Lexa

Lexa is an interactive web application for learning and practicing the American Sign Language (ASL) alphabet using your webcam and real-time hand tracking. It provides instant feedback as you sign each letter, helping users improve their ASL skills in a fun and engaging way.

## Features

- **Real-time Hand Tracking:** Uses MediaPipe Hands to detect and track your hand movements via webcam.
- **ASL Alphabet Practice:** Guides you through the ASL alphabet, one letter at a time.
- **Instant Feedback:** Tells you if your sign matches the target letter, and advances automatically when you get it right.
- **Progress Tracking:** Visualizes your progress through the alphabet and keeps a streak count.
- **Session Summary:** Shows your best and most challenging letters at the end of a session.

## How It Works

1. **Hand Detection:** The app uses [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) to extract 3D hand landmarks from your webcam feed.
2. **Gesture Classification:** A K-Nearest Neighbors (KNN) classifier compares your hand pose to a set of pre-collected training data for each letter.
3. **Feedback Loop:** When your hand matches the target letter, you receive positive feedback and move to the next letter.

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS
- **Hand Tracking:** MediaPipe Hands (via CDN)
- **Machine Learning:** Custom KNN classifier in JavaScript
- **Backend:** Node.js/Express (for serving training data)

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/lexa.git
   cd lexa
   ```

2. **Install dependencies:**
   ```sh
   cd Frontend
   npm install
   ```

3. **Start the backend server:**
   ```sh
   cd ../Backend
   npm install
   npm start
   ```

4. **Start the frontend development server:**
   ```sh
   cd ../Frontend
   npm run dev
   ```

5. **Open your browser and visit:**  
   [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

## How It Was Made

- The app was built with React and Vite for a fast, modern development experience.
- MediaPipe Hands is loaded via CDN to provide robust, real-time hand landmark detection.
- The KNN classifier is implemented in JavaScript and uses normalized hand landmark data for accurate gesture recognition.
- Training data for each ASL letter is stored on the backend and loaded into the app at session start.
- Tailwind CSS is used for rapid, responsive UI styling.


