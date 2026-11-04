/**
 * Long paragraphs become a sentence list so a phone shows about four lines
 * per block. The words stay the same. Nothing is added.
 */
export function ShortCopy({ text, className }: { text: string; className?: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) ?? [];
  if (words.length <= 28 || sentences.length < 2) {
    return <p className={className}>{text}</p>;
  }
  return (
    <ul className={className}>
      {sentences.map((sentence) => (
        <li key={sentence}>{sentence}</li>
      ))}
    </ul>
  );
}
