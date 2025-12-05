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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PDF Resources</h1>
                <p className="text-sm text-gray-500">Accessible documents and materials</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-1">Accessibility Widget Active</h2>
              <p className="text-sm text-blue-700">
                Click the PIVOT widget button in the bottom-right corner to access ASL videos, audio, and text for each section.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: PDF Resources Introduction */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">PDF Resources Introduction</h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed">
                <p>
                  Access our library of PDF resources and documents. All materials are available in multiple accessible formats.
                </p>
                <p className="mt-4">
                  Our document library is designed to provide easy access to essential forms, guides, and informational 
                  materials that support your needs. Every document has been optimized for accessibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Document Categories */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Document Categories</h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed">
                <p>
                  Browse through our categorized collection of forms, guides, and informational materials organized by topic.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">📋</span>
                      Application Forms
                    </h3>
                    <p className="text-sm text-gray-600">Service applications, intake forms, and enrollment documents</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">📚</span>
                      Resource Guides
                    </h3>
                    <p className="text-sm text-gray-600">Comprehensive guides and how-to manuals</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">ℹ️</span>
                      Informational Materials
                    </h3>
                    <p className="text-sm text-gray-600">Brochures, fact sheets, and educational content</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">📄</span>
                      Policy Documents
                    </h3>
                    <p className="text-sm text-gray-600">Official policies, procedures, and regulations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Accessibility Features */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Accessibility Features</h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed">
                <p>
                  All PDF documents include screen reader compatibility, alternative text descriptions, and can be 
                  accessed through our multi-modal interface.
                </p>
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Our Accessibility Commitment:</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1 flex-shrink-0">✓</span>
                      <span><strong>Screen Reader Compatible:</strong> All documents are tagged and optimized for screen reader navigation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1 flex-shrink-0">✓</span>
                      <span><strong>Alternative Text:</strong> Images and graphics include descriptive alt text</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1 flex-shrink-0">✓</span>
                      <span><strong>Multi-Modal Access:</strong> Content available via ASL video, audio narration, and text</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1 flex-shrink-0">✓</span>
                      <span><strong>Keyboard Navigation:</strong> Full keyboard accessibility for all interactive elements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1 flex-shrink-0">✓</span>
                      <span><strong>High Contrast Mode:</strong> Available through the PIVOT widget settings</span>
                    </li>
                  </ul>
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
            All documents are regularly updated to ensure accessibility compliance and accuracy.
          </p>
        </div>
      </footer>
    </div>
  );
}
