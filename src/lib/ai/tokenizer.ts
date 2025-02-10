// Simple regex-based word counter for rough token estimation
export function estimateTokens(text: string): number {
  // Split on whitespace and punctuation
  const words = text.trim().split(/[\s,.!?;:'"()\[\]{}|\\/<>]+/);
  // Filter out empty strings and multiply by 1.3 for a conservative estimate
  return Math.ceil(words.filter(w => w.length > 0).length * 1.3);
}

// Ensure message history stays within token limits
export function truncateHistory(
  messages: { role: string; content: string }[],
  maxTokens: number = 4000 // Conservative limit for gpt-3.5-turbo
): { role: string; content: string }[] {
  let totalTokens = 0;
  const truncatedMessages = [];

  // Always keep the most recent message
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    truncatedMessages.unshift(lastMessage);
    totalTokens += estimateTokens(lastMessage.content);
  }

  // Add older messages until we approach the token limit
  for (let i = messages.length - 2; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokens(message.content);
    
    if (totalTokens + messageTokens > maxTokens) {
      break;
    }
    
    truncatedMessages.unshift(message);
    totalTokens += messageTokens;
  }

  return truncatedMessages;
}