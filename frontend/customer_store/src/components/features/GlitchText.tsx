import './GlitchText.css';

export function GlitchText({ text }: { text: string }) {
  return (
    <div className="glitch" data-text={text}>
      {text}
    </div>
  );
}
