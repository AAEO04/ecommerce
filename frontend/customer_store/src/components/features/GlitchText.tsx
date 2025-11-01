import './GlitchText.css';

export default function GlitchText({ text }: { text: string }) {
  return (
    <div className="glitch" data-text={text}>
      {text}
    </div>
  );
}
