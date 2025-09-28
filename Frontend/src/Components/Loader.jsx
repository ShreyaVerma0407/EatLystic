import React, { useEffect, useState, useRef } from "react";
import "../styles/loader.css";

const Loader = ({ onFinish }) => {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const fullText = "Loading EATLYSTIC";
  const dots = "...";

  const dotIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const scriptStartTimeRef = useRef(Date.now());
  const loaderRef = useRef(null);

  const typeText = (index = 0) => {
    if (index < fullText.length) {
      setDisplayText(fullText.substring(0, index + 1));
      typingTimeoutRef.current = setTimeout(() => typeText(index + 1), 70);
    } else {
      setShowCursor(true);
      startDotAnimation();
    }
  };

  const startDotAnimation = () => {
    let dotCount = 0;
    dotIntervalRef.current = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setDisplayText(fullText + dots.substring(0, dotCount));
    }, 500);
  };

  // Simulate progress increase like LinkedIn's bar speed modulation
  const startProgress = () => {
    let currentProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += Math.random() * 5; // increment by 0-5%
        if (currentProgress > 90) currentProgress = 90;
        setProgress(currentProgress);
      }
    }, 200);
  };

  useEffect(() => {
    typeText();
    startProgress();

    const handlePageLoad = () => {
      const actualLoadTime = Date.now() - scriptStartTimeRef.current;
      const minimumDisplayTime = 3500;
      const timeToWait = Math.max(0, minimumDisplayTime - actualLoadTime);

      setTimeout(() => {
        setProgress(100); // complete progress bar
        setFadeOut(true);
      }, timeToWait);
    };

    window.addEventListener("load", handlePageLoad);

    return () => {
      window.removeEventListener("load", handlePageLoad);
      clearInterval(dotIntervalRef.current);
      clearTimeout(typingTimeoutRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (fadeOut && loaderRef.current) {
      const onTransitionEnd = () => {
        onFinish && onFinish();
        document.body.style.overflow = "";
      };
      const node = loaderRef.current;
      node.addEventListener("transitionend", onTransitionEnd, { once: true });
      document.body.style.overflow = "hidden";
      return () => node.removeEventListener("transitionend", onTransitionEnd);
    }
  }, [fadeOut, onFinish]);

return (
  <div
    id="loader-overlay"
    className={`loader-overlay${fadeOut ? " fade-out" : ""}`}
    ref={loaderRef}
  >
    <div className="loader-container">
      <div className="logo-wrapper">
        <svg
          className="loader-logo-svg"
          width="320"
          height="110"
          viewBox="0 0 340 110"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="EATLYSTIC Loader Logo"
        >
          <rect width="340" height="110" rx="26" fill="transparent" />
          
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            fontFamily="'Montserrat', 'Trebuchet MS', Arial, sans-serif"
            fontWeight="bold"
            fontSize="72"
            fill="#FF9800"
            stroke="#FFB347"
            strokeWidth="3"
            letterSpacing="0.07em"
            dominantBaseline="middle"
            alignmentBaseline="central"
          >
            EATLYSTIC
          </text>
        </svg>
        <div className="loader-shadow" />
      </div>

      {/* BEGIN: Hourglass Loader */}
        <svg
          aria-label="loader being flipped clockwise and circled by three white curves fading in and out"
          role="img"
          height="56px"
          width="56px"
          viewBox="0 0 56 56"
          className="hourglass-loader"
        >
          <clipPath id="sand-mound-top">
            <path
              d="M 14.613 13.087 C 15.814 12.059 19.3 8.039 20.3 6.539 C 21.5 4.789 21.5 2.039 21.5 2.039 L 3 2.039 C 3 2.039 3 4.789 4.2 6.539 C 5.2 8.039 8.686 12.059 9.887 13.087 C 11 14.039 12.25 14.039 12.25 14.039 C 12.25 14.039 13.5 14.039 14.613 13.087 Z"
              className="loader__sand-mound-top"
            ></path>
          </clipPath>
          <clipPath id="sand-mound-bottom">
            <path
              d="M 14.613 20.452 C 15.814 21.48 19.3 25.5 20.3 27 C 21.5 28.75 21.5 31.5 21.5 31.5 L 3 31.5 C 3 31.5 3 28.75 4.2 27 C 5.2 25.5 8.686 21.48 9.887 20.452 C 11 19.5 12.25 19.5 12.25 19.5 C 12.25 19.5 13.5 19.5 14.613 20.452 Z"
              className="loader__sand-mound-bottom"
            ></path>
          </clipPath>
          <g transform="translate(2,2)">
            <g
              transform="rotate(-90,26,26)"
              strokeLinecap="round"
              strokeDashoffset="153.94"
              strokeDasharray="153.94 153.94"
              stroke="hsl(0,0%,100%)"
              fill="none"
            >
              <circle
                transform="rotate(0,26,26)"
                r="24.5"
                cy="26"
                cx="26"
                strokeWidth="2.5"
                className="loader__motion-thick"
              ></circle>
              <circle
                transform="rotate(90,26,26)"
                r="24.5"
                cy="26"
                cx="26"
                strokeWidth="1.75"
                className="loader__motion-medium"
              ></circle>
              <circle
                transform="rotate(180,26,26)"
                r="24.5"
                cy="26"
                cx="26"
                strokeWidth="1"
                className="loader__motion-thin"
              ></circle>
            </g>
            <g transform="translate(13.75,9.25)" className="loader__model">
              <path
                d="M 1.5 2 L 23 2 C 23 2 22.5 8.5 19 12 C 16 15.5 13.5 13.5 13.5 16.75 C 13.5 20 16 18 19 21.5 C 22.5 25 23 31.5 23 31.5 L 1.5 31.5 C 1.5 31.5 2 25 5.5 21.5 C 8.5 18 11 20 11 16.75 C 11 13.5 8.5 15.5 5.5 12 C 2 8.5 1.5 2 1.5 2 Z"
                fill="hsl(var(--hue, 35),90%,85%)" 
              ></path>

              <g strokeLinecap="round" stroke="hsl(35,90%,90%)">
                <line
                  y2="20.75"
                  x2="12"
                  y1="15.75"
                  x1="12"
                  strokeDasharray="0.25 33.75"
                  strokeWidth="1"
                  className="loader__sand-grain-left"
                ></line>
                <line
                  y2="21.75"
                  x2="12.5"
                  y1="16.75"
                  x1="12.5"
                  strokeDasharray="0.25 33.75"
                  strokeWidth="1"
                  className="loader__sand-grain-right"
                ></line>
                <line
                  y2="31.5"
                  x2="12.25"
                  y1="18"
                  x1="12.25"
                  strokeDasharray="0.5 107.5"
                  strokeWidth="1"
                  className="loader__sand-drop"
                ></line>
                <line
                  y2="31.5"
                  x2="12.25"
                  y1="14.75"
                  x1="12.25"
                  strokeDasharray="54 54"
                  strokeWidth="1.5"
                  className="loader__sand-fill"
                ></line>
                <line
                  y2="31.5"
                  x2="12"
                  y1="16"
                  x1="12"
                  strokeDasharray="1 107"
                  strokeWidth="1"
                  stroke="hsl(35,90%,83%)"
                  className="loader__sand-line-left"
                ></line>
                <line
                  y2="31.5"
                  x2="12.5"
                  y1="16"
                  x1="12.5"
                  strokeDasharray="12 96"
                  strokeWidth="1"
                  stroke="hsl(35,90%,83%)"
                  className="loader__sand-line-right"
                ></line>

                <g strokeWidth="0" fill="hsl(35,90%,90%)">
                  <path
                    d="M 12.25 15 L 15.392 13.486 C 21.737 11.168 22.5 2 22.5 2 L 2 2.013 C 2 2.013 2.753 11.046 9.009 13.438 L 12.25 15 Z"
                    clipPath="url(#sand-mound-top)"
                  ></path>
                  <path
                    d="M 12.25 18.5 L 15.392 20.014 C 21.737 22.332 22.5 31.5 22.5 31.5 L 2 31.487 C 2 31.487 2.753 22.454 9.009 20.062 Z"
                    clipPath="url(#sand-mound-bottom)"
                  ></path>
                </g>
              </g>

              <g strokeWidth="2" strokeLinecap="round" opacity="0.7" fill="none">
                <path
                  d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5"
                  stroke="hsl(0,0%,100%)"
                  className="loader__glare-top"
                ></path>
                <path
                  transform="rotate(180,12.25,16.75)"
                  d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5"
                  stroke="hsla(0,0%,100%,0)"
                  className="loader__glare-bottom"
                ></path>
              </g>

              <rect height="2" width="24.5" fill="hsl(var(--hue, 35),90%,50%)"></rect>
              <rect
                height="1"
                width="19.5"
                y="0.5"
                x="2.5"
                ry="0.5"
                rx="0.5"
                fill="hsl(var(--hue, 35),90%,57.5%)"
              ></rect>
              <rect
                height="2"
                width="24.5"
                y="31.5"
                fill="hsl(var(--hue, 35),90%,50%)"
              ></rect>
              <rect
                height="1"
                width="19.5"
                y="32"
                x="2.5"
                ry="0.5"
                rx="0.5"
                fill="hsl(var(--hue, 35),90%,57.5%)"
              ></rect>
            </g>
          </g>
        </svg>
        {/* END: Hourglass Loader */}


      {/* Transparent background progress bar wrapper */}
      <div className="progress-bar-wrapper" aria-label="loading progress">
        <div
          className="progress-bar-fill"
          style={{
            width: `${progress}%`,
            backgroundColor: "#FF9800",
            boxShadow: "0 0 10px #FF9800a0",
          }}
        />
      </div>

      <div className="loading-text-container">
        <span className="loading-text">{displayText}</span>
        {showCursor && <span className="blinking-cursor">|</span>}
      </div>
    </div>
  </div>
);
}
export default Loader;