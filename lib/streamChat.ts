// File: lib/streamChat.ts
export type StreamedChunk = {
  role: 'user' | 'assistant';
  content: string;
  followUps?: string[];
};

type Props = {
  prompt: string;
  threadId?: string;
  token: string;
  onStream: (chunk: StreamedChunk) => void;
  onComplete?: (fullText: string) => void;
  onImage?: (imageUrl: string) => void;
};

export default async function streamChat({
  prompt,
  threadId,
  token,
  onStream,
  onComplete,
  onImage,
}: Props) {
  const res = await fetch(`/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, threadId }),
  });

  if (!res.ok || !res.body) throw new Error('No response stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let followUps: string[] | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    try {
      const parsed = JSON.parse(chunk);
      const role = parsed.role || 'assistant';
      const content = parsed.content || '';
      const imageUrl = parsed.imageUrl;
      followUps = parsed.followUps;

      if (imageUrl && onImage) onImage(imageUrl);

      fullText += content;

      onStream({ role, content, followUps });
    } catch (err) {
      console.warn('Stream parse error:', err);
    }
  }

  if (onComplete) onComplete(fullText);
}
