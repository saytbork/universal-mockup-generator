import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-gray-300">How BoostUGC collects, uses, and protects your data.</p>
        </div>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">1. Information we collect</h2>
            <p>We collect email for authentication (Firebase) and billing details via Stripe. Generation logs and credits are stored to operate the service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">2. How we use your data</h2>
            <p>We use your data to provide access, manage subscriptions, track credits, send login links, and improve the product. We do not sell your data.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">3. Payments</h2>
            <p>Payments are processed by Stripe. We do not store full card details. Stripe may store limited billing information.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">4. AI-generated content</h2>
            <p>Images you generate may be stored to improve quality and for community gallery if you are on Free. Paid plans default to private.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">5. Data retention</h2>
            <p>We retain account and billing records while your account is active or as required by law. You can request deletion of your account by contacting support.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">6. Security</h2>
            <p>We rely on Firebase Auth and Firestore security rules plus Stripe’s PCI-compliant infrastructure. No system is 100% secure; use strong emails and safeguard access links.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">7. Contact</h2>
            <p>For privacy questions or deletion requests, email <a className="text-indigo-300" href="mailto:support@boostugc.app">support@boostugc.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
