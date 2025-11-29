import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-gray-300">The rules for using BoostUGC.</p>
        </div>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">1. Your account</h2>
            <p>You must provide accurate information, keep your login secure, and are responsible for activity on your account.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">2. Usage</h2>
            <p>Do not upload illegal content or use the service to generate harmful, deceptive, or infringing material. Free images may appear in the public gallery.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">3. Subscriptions and credits</h2>
            <p>Paid plans renew automatically unless canceled via Stripe’s portal. Credits reset per billing cycle; unused credits do not roll over unless stated.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">4. Refunds</h2>
            <p>Refunds are handled case by case. Contact support before disputing charges.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">5. Intellectual property</h2>
            <p>You retain rights to your uploads. You receive a license to use outputs under your plan’s terms. We may use anonymized outputs for quality and community gallery (free plan).</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">6. Service changes</h2>
            <p>We may update features, models, or pricing. We will notify you of material changes.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">7. Liability</h2>
            <p>BoostUGC is provided “as is.” To the fullest extent permitted by law, our liability is limited to the amounts you paid in the last 12 months.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">8. Contact</h2>
            <p>Questions? Email <a className="text-indigo-300" href="mailto:support@boostugc.app">support@boostugc.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
