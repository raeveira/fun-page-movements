'use client'
import { useEffect, useState, useRef } from "react";

interface Circle {
  id: string;
  top: number;
  left: number;
  url: string;
}

export default function Home() {
  const [blockPosition, setBlockPosition] = useState({ top: 50, left: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [hoverCircle, setHoverCircle] = useState<Circle | null>(null);
  const [timer, setTimer] = useState(3);
  const [showPopup, setShowPopup] = useState(true);
  const [speed, setSpeed] = useState(0.35);
  const intervalRef = useRef<number | null>(null);
  const followRef = useRef<{ x: number; y: number } | null>(null);
  const keyDownRef = useRef<boolean>(false);
  const pressedKeysRef = useRef<{ [key: string]: boolean }>({});

  const circleRadius = 80 / 2; // circle's diameter is 80px
  const blockRadius = 40 / 2; // block's diameter is 40px
  const circles: Circle[] = [
    { id: "topLeft", top: 25, left: 25, url: "https://www.example1.com" },
    { id: "topRight", top: 25, left: 75, url: "https://www.example2.com" },
    { id: "bottomLeft", top: 75, left: 25, url: "https://www.example3.com" },
    { id: "bottomRight", top: 75, left: 75, url: "https://www.example4.com" },
  ];

  const checkIfInsideCircle = (circle: Circle) => {
    const circleTop = (circle.top / 100) * window.innerHeight;
    const circleLeft = (circle.left / 100) * window.innerWidth;
    const blockTop = (blockPosition.top / 100) * window.innerHeight;
    const blockLeft = (blockPosition.left / 100) * window.innerWidth;

    const distance = Math.sqrt(
      (circleTop - blockTop) ** 2 + (circleLeft - blockLeft) ** 2
    );
    return distance <= circleRadius - blockRadius;
  };

  useEffect(() => {
    const hoveredCircle = circles.find(checkIfInsideCircle);

    if (hoveredCircle) {
      setHoverCircle(hoveredCircle);
      setIsHovering(true);
    } else {
      setHoverCircle(null);
      setIsHovering(false);
    }
  }, [blockPosition]);

  useEffect(() => {
    if (isHovering && hoverCircle) {
      intervalRef.current = window.setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(intervalRef.current!);
            window.location.href = hoverCircle.url; // Redirect to the URL of the hovered circle
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimer(3);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, hoverCircle]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeysRef.current[e.key] = true;
      if (!keyDownRef.current) {
        keyDownRef.current = true;

        const move = () => {
          let x = 0, y = 0;
          if (pressedKeysRef.current["w"]) y -= 1;
          if (pressedKeysRef.current["a"]) x -= 1;
          if (pressedKeysRef.current["s"]) y += 1;
          if (pressedKeysRef.current["d"]) x += 1;

          // Normalize diagonal movement
          if (x !== 0 && y !== 0) {
            x /= Math.sqrt(2);
            y /= Math.sqrt(2);
          }

          setBlockPosition((prevPosition) => {
            const blockDiameter = 40; // Block diameter in pixels
            const maxX = window.innerWidth - blockDiameter;
            const maxY = window.innerHeight - blockDiameter;

            const newLeftPx = ((prevPosition.left / 100) * window.innerWidth) + x * speed * 10;
            const newTopPx = ((prevPosition.top / 100) * window.innerHeight) + y * speed * 10;

            const newLeftPct = (Math.max(0, Math.min(maxX, newLeftPx)) / window.innerWidth) * 100;
            const newTopPct = (Math.max(0, Math.min(maxY, newTopPx)) / window.innerHeight) * 100;

            return {
              left: newLeftPct,
              top: newTopPct,
            };
          });

          if (keyDownRef.current) {
            requestAnimationFrame(move);
          }
        };

        move();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current[e.key] = false;
      if (!Object.values(pressedKeysRef.current).some((value) => value)) {
        keyDownRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Remove the event listeners when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [speed]);

  useEffect(() => {
    const animate = () => {
      if (followRef.current) {
        const { x, y } = followRef.current;
        setBlockPosition((prevPosition) => {
          const dx = x - prevPosition.left;
          const dy = y - prevPosition.top;
          const distanceToTarget = Math.sqrt(dx ** 2 + dy ** 2);
          const interpolationRate = 0.01; // Adjust interpolation rate as needed

          if (distanceToTarget < 1) {
            return prevPosition;
          }

          const angle = Math.atan2(dy, dx);
          const newLeft = prevPosition.left + Math.cos(angle) * speed;
          const newTop = prevPosition.top + Math.sin(angle) * speed;

          // Interpolate between current position and target position
          const interpolatedLeft = prevPosition.left + (newLeft - prevPosition.left) * interpolationRate;
          const interpolatedTop = prevPosition.top + (newTop - prevPosition.top) * interpolationRate;

          return { left: interpolatedLeft, top: interpolatedTop };
        });
      }

      requestAnimationFrame(animate);
    };

    const animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gray-100">
      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white z-50">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-2">Controls</h2>
            <p>Use W, A, S, D keys to move the block.</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <div
        className="absolute w-10 h-10 bg-blue-500 rounded-full"
        style={{
          top: `${blockPosition.top}%`,
          left: `${blockPosition.left}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {isHovering && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-75 text-white font-bold rounded-full">
            {timer}
          </div>
        )}
      </div>

      {circles.map((circle) => (
        <div
          key={circle.id}
          className="absolute w-16 h-16 border-4 border-dashed border-red-300 rounded-full flex items-center justify-center"
          style={{ top: `${circle.top}%`, left: `${circle.left}%`, transform: "translate(-50%, -50%)" }}
        >
          {hoverCircle?.id === circle.id && (
            <div className="text-center text-red-500 font-bold">{timer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
