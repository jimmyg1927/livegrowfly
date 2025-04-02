import { useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma"; // Adjust the import path based on your project structure

type DocumentProps = {
  document: {
    id: string;
    title: string;
    content: string;
  };
};

export default function DocumentPage({ document }: DocumentProps) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const router = useRouter();

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        alert("Document saved successfully!");
      } else {
        alert("Failed to save document. Please try again.");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document Title"
        className="title-input"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Document Content"
        className="content-textarea"
      />
      <button onClick={handleSave} className="save-button">
        Save
      </button>
      <button onClick={() => router.push("/")} className="back-button">
        Back to Dashboard
      </button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return {
      notFound: true,
    };
  }

  return {
    props: { document },
  };
};