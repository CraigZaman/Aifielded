export type ConversationEvidenceMessage = {
  sender: string;
  confidentiality: string;
  content: string;
};

export function analysableContributions<T extends ConversationEvidenceMessage>(messages: T[]): T[] {
  return messages.filter((message) =>
    message.sender === "participant"
    && (message.confidentiality === "CONTRIBUTE" || message.confidentiality === "SHARE"));
}
