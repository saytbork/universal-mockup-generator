import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page">
      <h1>BoostUGC</h1>
      <p>Create UGC with AI. Start with a free magic link login.</p>
      <div className="actions">
        <Link to="/signin" className="button">
          Launch App
        </Link>
        <Link to="/pricing" className="button secondary">
          View Pricing
        </Link>
      </div>
    </div>
  );
}
