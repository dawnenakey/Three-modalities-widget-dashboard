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
      const widgetButton = document.querySelector('.pivot-widget-button');
      const widgetPanel = document.querySelector('.pivot-widget-panel');
      if (widgetButton) widgetButton.remove();
      if (widgetPanel) widgetPanel.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with language count */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 text-center">
        <p className="text-sm font-semibold">7,000+ Spoken/Written | 300+ Signed | One Platform.</p>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">PIVOT</h1>
          <p className="text-xl text-teal-600 font-semibold">Language Translation</p>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">PIVOT: The Future of Language Access Technology</h2>
          
          <div className="max-w-4xl mx-auto space-y-4 text-lg text-gray-700">
            <p>PIVOT is the first language access technology that embeds accessibility right where your information lives. No duplicate websites. No third-party dependencies. No expensive rebuilds.</p>
            <p>With a single line of code, PIVOT integrates seamlessly into your existing digital systems—instantly transforming them into inclusive, multilingual experiences.</p>
            <p>Every piece of content becomes accessible in every format and every language—video (signed), audio (spoken), and text (written)—bridging more than 7,000 spoken/written and 300 signed languages worldwide.</p>
          </div>
        </div>

        {/* Patent Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full border-2 border-gray-300">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="font-bold text-gray-900">PATENT PENDING</span>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Key Features:</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
              <div className="flex gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                </div>
                <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-sm">Aa</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Triple-Modality Access</h4>
              <p className="text-gray-700">Make information accessible in Video, Audio and Text.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Built at the Source</h4>
              <p className="text-gray-700">Language access embedded directly into your digital platforms, no duplicate pages, rehosting, or third-party dependency.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Seamless Integration</h4>
              <p className="text-gray-700">Compatible with any digital interface, including websites, mobile apps, kiosks, and even printed materials through QR code integration.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Self-Managed Dashboard</h4>
              <p className="text-gray-700">A powerful, intuitive interface that allows your organization to manage, edit, and publish translations in real time.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Compliance Ready</h4>
              <p className="text-gray-700">Built to support ADA, Section 508, and European Accessibility Act (EAA) requirements.</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">Special Pre-Launch Rates for Early Adopters</h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
            <div className="bg-white rounded-xl p-8 border-2 border-gray-300">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">BASIC</h4>
              <div className="mb-6">
                <span className="text-4xl font-bold">$6,500</span>
                <p className="text-sm text-gray-600 uppercase mt-1">Annually</p>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>• Up to 15 web pages included</li>
                <li>• $75 per additional page</li>
                <li>• Unlimited language uploads</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-8 text-white shadow-xl transform scale-105">
              <h4 className="text-2xl font-bold mb-2">PRO</h4>
              <div className="mb-6">
                <span className="text-4xl font-bold">$12,000</span>
                <p className="text-sm opacity-90 uppercase mt-1">Annually</p>
              </div>
              <ul className="space-y-3">
                <li>• Up to 40 web pages included</li>
                <li>• $65 per additional page</li>
                <li>• AI translations with API access</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-gray-300">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">ENTERPRISE</h4>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>• Coverage for 50+ web pages</li>
                <li>• Full-scale platform integrations</li>
                <li>• Custom digital configurations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-12 text-center text-white mb-16">
          <h3 className="text-3xl font-bold mb-4">See PIVOT in Action</h3>
          <p className="text-xl mb-6">Experience truly accessible content</p>
          <a href="https://demo.gopivot.me/PDF" className="inline-block bg-white text-teal-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100">
            demo.goPIVOT.me/PDF
          </a>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a href="mailto:hello@goPIVOT.me" className="text-teal-600 hover:underline">hello@goPIVOT.me</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Website</p>
                <a href="https://www.goPIVOT.me" className="text-teal-600 hover:underline">www.goPIVOT.me</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <div>
                <p className="text-sm text-gray-600">LinkedIn</p>
                <a href="https://linkedin.com/company/gopivotme" className="text-teal-600 hover:underline">linkedin.com/company/gopivotme</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Locations</p>
                <p className="text-gray-700 text-sm">Austin, TX | Washington, DC | Los Angeles, CA | Toronto, ON | Vancouver, BC - Serving Globally</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
