import React from 'react';

const Error = ({ message = 'Something went wrong!', retry = null }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
      <div className="text-red-500 text-xl mb-4">
        <span role="img" aria-label="error">⚠️</span>
        {message}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default Error;