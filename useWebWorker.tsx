import { useEffect, useRef, useState } from "react";

export function useWebWorker(workerFn) {
  const workerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create the Web Worker from the function passed
    workerRef.current = new Worker(
      URL.createObjectURL(
        new Blob([`self.onmessage = ${workerFn.toString()}`], {
          type: "text/javascript",
        })
      )
    );

    // Cleanup worker on unmount
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [workerFn]);

  const runWorker = (data) => {
    if (!workerRef.current) return;

    setLoading(true);
    setError(null);

    workerRef.current.postMessage(data);

    workerRef.current.onmessage = (e) => {
      setResult(e.data);
      setLoading(false);
    };

    workerRef.current.onerror = (err) => {
      setError(err.message);
      setLoading(false);
    };
  };

  return { runWorker, result, loading, error };
}
