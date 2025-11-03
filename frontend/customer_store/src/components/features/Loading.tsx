export function Loading() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="h-1 w-full bg-gray-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 via-red-500 to-purple-500"
          style={{
            width: '200%',
            animation: 'progress 2s linear infinite',
          }}
        />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <h1
          className="text-6xl font-black text-white"
          style={{ animation: 'pulse-text 1.5s ease-in-out infinite' }}
        >
          RUSH
        </h1>
      </div>
    </div>
  );
}
