import React from "react";

type PromptTrackerProps = {
  used: number;
  limit: number;
};

export default function PromptTracker({ used, limit }: PromptTrackerProps) {
  const percentage = Math.min((used / limit) * 100, 100);

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">AI Prompts Used</span>
        <span className="text-sm font-medium text-gray-700">
          {used}/{limit}
        </span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
