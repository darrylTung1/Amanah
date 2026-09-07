export default function Header({ demo = false }: { demo?: boolean }) {
  return (
    <header className="topbar">
      <a className="brand" href="/">
        <span className="brandmark">✳</span>Sociopoly
      </a>
      <div className="toplinks">
        <span className="muted small">Voices of the next hundred years</span>
        <span className="tag">
          {demo ? 'Rehearsal · scripted council' : 'Kampong Gelam'}
        </span>
      </div>
    </header>
  );
}
