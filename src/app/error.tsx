"use client";
import error from "next/error";

 

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="error-container">
      <h1>Something went wrong!</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
};

export default Error;