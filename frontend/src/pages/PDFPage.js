import { useEffect } from 'react';

export default function PDFPage() {
  useEffect(() => {
    // Load the widget script
    const script = document.createElement('script');
    script.src = `${process.env.REACT_APP_BACKEND_URL}/api/widget.js`;
    script.setAttribute('data-website-id', 'fe05622a-8043-41c7-958c-5c657a701fc1');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      const widgetButton = document.querySelector('.pivot-widget-button');
      const widgetPanel = document.querySelector('.pivot-widget-panel');
      if (widgetButton) widgetButton.remove();
      if (widgetPanel) widgetPanel.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">PIVOT</h1>
            <p className="text-2xl text-blue-600 font-semibold">The Future of Language Access Technology</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction */}
        <section className="mb-16 text-center">
          <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            PIVOT is the first language access technology that embeds accessibility directly into where information lives.
            No duplicate websites. No third-party dependencies. No expensive rebuilds.
          </p>
          <p className="text-lg text-gray-600 mt-4 max-w-4xl mx-auto">
            Integrates seamlessly with a single line of code and transforms digital systems into inclusive, multilingual experiences.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Triple-Modality Access</h3>
              </div>
              <p className="text-gray-700">Make information accessible in Video (signed), Audio (spoken), and Text (written).</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Built at the Source</h3>
              </div>
              <p className="text-gray-700">Language access embedded directly into digital platforms. No duplicate pages, rehosting, or third-party dependency.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Seamless Integration</h3>
              </div>
              <p className="text-gray-700">Compatible with any digital interface: websites, mobile apps, kiosks, and printed materials via QR code integration.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Self-Managed Dashboard</h3>
              </div>
              <p className="text-gray-700">A powerful, intuitive interface allowing organizations to manage, edit, and publish translations in real time.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Compliance Ready</h3>
              </div>
              <p className="text-gray-700">Built to support ADA, Section 508, and European Accessibility Act (EAA) requirements.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Global Language Coverage</h3>
              </div>
              <p className="text-gray-700">Bridges more than 7,000 spoken/written and 300 signed languages worldwide.</p>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Special Pre-Launch Rates for Early Adopters</h2>
          <p className="text-center text-gray-600 mb-8">Choose the plan that fits your needs</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-200 hover:border-blue-400 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">BASIC</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">$6,500<span className="text-lg text-gray-500">/year</span></div>
              <ul className="space-y-3 mb-6 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Up to 15 web pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>$75 per additional page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Unlimited language uploads</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-md border-2 border-blue-400 relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">POPULAR</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">PRO</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">$12,000<span className="text-lg text-gray-500">/year</span></div>
              <ul className="space-y-3 mb-6 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Up to 40 web pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>$65 per additional page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>AI translations with API access</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-200 hover:border-purple-400 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ENTERPRISE</h3>
              <div className="text-4xl font-bold text-purple-600 mb-4">Custom</div>
              <ul className="space-y-3 mb-6 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>50+ web pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Full-scale platform integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Custom digital interface configurations</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">See PIVOT in Action</h2>
          <p className="text-xl mb-6 text-blue-100">Experience the power of truly accessible content</p>
          <a href="https://demo.gopivot.me/PDF" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Visit demo.goPIVOT.me/PDF
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">PIVOT</h3>
              <p className="text-gray-400 mb-4">The Future of Language Access Technology</p>
              <p className="text-gray-400">Serving Globally from Austin, TX | Washington, DC | Los Angeles, CA | Toronto, ON | Vancouver, BC</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
              <p className="text-gray-400 mb-2">Email: <a href="mailto:hello@goPIVOT.me" className="text-blue-400 hover:underline">hello@goPIVOT.me</a></p>
              <p className="text-gray-400 mb-2">Website: <a href="https://www.goPIVOT.me" className="text-blue-400 hover:underline">www.goPIVOT.me</a></p>
              <p className="text-gray-400">LinkedIn: <a href="https://linkedin.com/company/gopivotme" className="text-blue-400 hover:underline">linkedin.com/company/gopivotme</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
