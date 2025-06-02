// File: lib/streamChat.ts

import { API_BASE_URL } from './constants';

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
  // Step 1: Ensure thread exists (or create one if not provided)
  let finalThreadId = threadId;

  if (!finalThreadId) {
    const createRes = await fetch(`${API_BASE_URL}/api/chat/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!createRes.ok) throw new Error('Failed to create thread');
    const createData = await createRes.json();
    finalThreadId = createData.id;

    if (finalThreadId) {
      localStorage.setItem('growfly_last_thread_id', finalThreadId);
    }
  }

  // Step 2: Send message to AI
  const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message: prompt, threadId: finalThreadId }),
  });

  if (!res.ok || !res.body) throw new Error('No response stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let followUps: string[] | undefined;
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    const chunk = decoder.decode(value, { stream: true });

    const events = chunk.split('\n\n').filter(Boolean);
    for (const evt of events) {
      if (evt.startsWith('data: ')) {
        const json = evt.replace('data: ', '');
        try {
          const parsed = JSON.parse(json);
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
    }
  }

  if (onComplete) onComplete(fullText);
}
