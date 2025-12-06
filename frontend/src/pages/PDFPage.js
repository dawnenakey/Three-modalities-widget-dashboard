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
      {/* PDF Embed */}
      <iframe
        src={`${process.env.REACT_APP_BACKEND_URL}/api/static/PIVOT-ONE-PAGER.pdf`}
        title="PIVOT One-Pager"
        className="w-full"
        style={{ height: '100vh', border: 'none' }}
      />
    </div>
  );
}
