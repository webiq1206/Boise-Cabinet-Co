export function splitIntoParagraphs(text: string, sentencesPerParagraph: number = 3): string[] {
  if (!text) return [];
  
  if (text.includes('\n\n')) {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.flatMap(p => {
      if (p.length > 400) {
        return splitBySentences(p, sentencesPerParagraph);
      }
      return [p];
    });
  }
  
  return splitBySentences(text, sentencesPerParagraph);
}

function splitBySentences(text: string, sentencesPerParagraph: number): string[] {
  const sentenceEndings = /([.!?])\s+/g;
  const parts = text.split(sentenceEndings).filter(Boolean);
  
  const sentences: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const content = parts[i];
    const punctuation = parts[i + 1] || '';
    if (content.trim()) {
      sentences.push(content.trim() + punctuation);
    }
  }
  
  if (sentences.length <= sentencesPerParagraph) {
    return [text];
  }
  
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
    const group = sentences.slice(i, i + sentencesPerParagraph).join(' ');
    if (group.trim()) {
      paragraphs.push(group);
    }
  }
  
  return paragraphs.length > 0 ? paragraphs : [text];
}
