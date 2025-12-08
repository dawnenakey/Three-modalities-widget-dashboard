import { useEffect } from 'react';

export default function PDFTestPage() {
  useEffect(() => {
    // Load the widget script from backend server (with updated hardcoded content)
    const script = document.createElement('script');
    script.src = `${process.env.REACT_APP_BACKEND_URL}/widget.js?v=${Date.now()}`;
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

  // PIVOT Brand Assets CDN
  const CDN_URL = 'https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev';
  const pdfUrl = `${CDN_URL}/PIVOT-ONE-PAGER.pdf`;
  
  return (
    <div className="min-h-screen bg-white">
      {/* PDF Embed */}
      <iframe
        src={pdfUrl}
        title="PIVOT One-Pager Test"
        className="w-full"
        style={{ height: '100vh', border: 'none' }}
      />
    </div>
  );
}
