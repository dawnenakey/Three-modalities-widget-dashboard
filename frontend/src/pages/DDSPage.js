import { useEffect } from 'react';

export default function DDSPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                DDS
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Developmental Disabilities Services</h1>
                <p className="text-sm text-gray-500">Accessible support and resources</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Info Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-900 mb-1">Accessibility Widget Active</h2>
              <p className="text-sm text-green-700">
                Click the PIVOT widget button in the bottom-right corner to access ASL videos, audio, and text for each section.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: DDS Introduction */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">DDS Introduction</h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed">
                <p>
                  Welcome to the DDS (Developmental Disabilities Services) section. This page provides accessible 
                  information about developmental disability services.
                </p>
                <p className="mt-4">
                  Our mission is to ensure that individuals with developmental disabilities have access to quality 
                  services, support, and opportunities to live fulfilling lives in their communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Services Overview */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Services Overview</h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed">
                <p>
                  Our DDS program offers comprehensive support services including case management, therapy services, 
                  and community integration programs.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Individual and family support coordination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Behavioral and therapeutic services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Employment and day program services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Residential and housing support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: How to Apply */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">How to Apply</h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed">
                <p>
                  To apply for DDS services, please contact your regional center or visit our application portal 
                  for more information.
                </p>
                <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Application Process:</h3>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-green-600">1.</span>
                      <span>Contact your local regional center for eligibility assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-green-600">2.</span>
                      <span>Complete the intake and evaluation process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-green-600">3.</span>
                      <span>Develop an Individual Program Plan (IPP)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-green-600">4.</span>
                      <span>Connect with service providers and begin receiving support</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-600">
          <p className="text-sm">
            For more information, please contact your regional center or visit our main website.
          </p>
        </div>
      </footer>
    </div>
  );
}
