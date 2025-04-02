import React, { useState } from "react";
import { useRouter } from "next/router";

type VoteFeedbackProps = {
  responseId: string;
  userId: string;
  aiResponse: string; // Add the AI response content as a prop
};

export default function VoteFeedback({ responseId, userId, aiResponse }: VoteFeedbackProps) {
  const [vote, setVote] = useState<1 | -1 | null>(null);
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!vote) return alert("Please select a vote (👍 or 👎).");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseId,
          userId,
          vote,
          comment,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleShareAsDocument = async () => {
    try {
      const response = await fetch("/api/documents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Document", // Default title, can be customized
          content: aiResponse,
          createdById: userId,
        }),
      });

      if (response.ok) {
        const document = await response.json();
        router.push(`/documents/${document.id}`);
      } else {
        alert("Failed to create document. Please try again.");
      }
    } catch (error) {
      console.error("Error sharing as document:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (submitted) {
    return <p>Thank you! This helps our AI to improve.</p>;
  }

  return (
    <div className="vote-feedback">
      <div className="vote-buttons">
        <button
          onClick={() => setVote(1)}
          disabled={submitted}
          className={`vote-button ${vote === 1 ? "selected" : ""}`}
        >
          👍
        </button>
        <button
          onClick={() => setVote(-1)}
          disabled={submitted}
          className={`vote-button ${vote === -1 ? "selected" : ""}`}
        >
          👎
        </button>
      </div>
      <textarea
        placeholder="Leave optional feedback..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={submitted}
        className="feedback-textarea"
      />
      <button onClick={handleSubmit} disabled={submitted} className="submit-button">
        Submit
      </button>
      <button onClick={handleShareAsDocument} className="share-button">
        Share/Edit as Document
      </button>
    </div>
  );
}