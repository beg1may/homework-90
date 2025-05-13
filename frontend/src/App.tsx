import {useEffect, useRef, useState} from "react";

function App() {
  const [mouseDown, setMouseDown] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/pixel');
    ws.current.onmessage = (event) => {
      const decodedPixel = JSON.parse(event.data);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;


      if (decodedPixel.type === 'SEND_PIXEL' || decodedPixel.type === 'NEW_PIXEL') {
        decodedPixel.pixels.forEach((pixel: { x: number, y: number }) => {
          ctx.fillRect(pixel.x, pixel.y, 256, 256);
        });
      }
    };

    return () => {
      if(ws.current) {
        ws.current.close();
      }
    }
  }, []);

  const handleOnMouseDown = () => {
    setMouseDown(true);
  };

  const handleOnMouseUp = () => {
    setMouseDown(false);
  };

  const handleOnMouseMove = (e: React.MouseEvent) => {
    if (!mouseDown || !canvasRef.current || !ws.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);


    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx?.fillRect(x, y, 1, 1);

    ws.current.send(JSON.stringify({
      type: "NEW_PIXEL",
      pixels: [{ x: x, y: y }],
    }));
  };


  return (
      <>
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{border: '1px solid black'}}
            onMouseDown={handleOnMouseDown}
            onMouseUp={handleOnMouseUp}
            onMouseMove={handleOnMouseMove}
        />
      </>
  )
}

export default App
