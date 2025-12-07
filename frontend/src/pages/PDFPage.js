import { useEffect } from 'react';

export default function PDFPage() {
  useEffect(() => {
    // Load the widget script from R2 CDN
    const script = document.createElement('script');
    script.src = 'https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/widget.js?v=20251206';
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
        title="PIVOT One-Pager"
        className="w-full"
        style={{ height: '100vh', border: 'none' }}
      />
    </div>
  );
}
