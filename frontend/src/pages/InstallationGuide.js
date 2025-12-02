import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function InstallationGuide() {
  const [copied, setCopied] = useState(false);

  const widgetCode = `<script
  src="${process.env.REACT_APP_BACKEND_URL || 'https://your-domain.com'}/widget.js"
  data-website-id="YOUR_WEBSITE_ID"
  id="pivot-widget"
  async
></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Widget Installation Guide</h1>
        <p className="text-gray-600 mb-8">Step-by-step instructions to install PIVOT on your website</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#00CED1] flex items-center justify-center text-black font-bold">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Copy Your Installation Code</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Copy the installation code below. Replace <code className="bg-gray-100 px-2 py-1 rounded text-sm">YOUR_WEBSITE_ID</code> with your actual website ID from the dashboard.
              </p>
              <div className="bg-[#0a0e27] rounded-lg p-4 mb-4 overflow-x-auto">
                <pre className="text-[#00CED1] text-sm font-mono">
                  <code>{widgetCode}</code>
                </pre>
              </div>
              <Button onClick={copyCode} className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold">
                {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#00CED1] flex items-center justify-center text-black font-bold">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Add to Your Website</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Paste the code just before the closing <code className="bg-gray-100 px-2 py-1 rounded text-sm">&lt;/body&gt;</code> tag in your HTML.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-sm text-gray-700">
{`<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <!-- Your content here -->
    
    <!-- PIVOT Widget - Add before </body> -->
    <script src="..."></script>
  </body>
</html>`}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#00CED1] flex items-center justify-center text-black font-bold">
                  3
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Test the Widget</h2>
              </div>
              <p className="text-gray-600 mb-4">
                After installation, you should see the PIVOT pill button in the bottom-right corner of your website.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700">Click the pill button to open the widget modal</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700">Test the video, audio, and text tabs</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700">Try switching languages from the dropdown</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Guides */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Platform Guides</h3>
              <div className="space-y-3">
                <a href="#wordpress" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-900">WordPress</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#shopify" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Shopify</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#wix" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Wix</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#squarespace" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Squarespace</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#custom" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Custom HTML</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Help */}
            <div className="bg-[#00CED1]/5 rounded-xl border border-[#00CED1]/20 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Having trouble installing the widget? We're here to help!
              </p>
              <Button variant="outline" className="w-full mb-2">
                Contact Support
              </Button>
              <Button variant="ghost" className="w-full text-sm">
                View Documentation
              </Button>
            </div>

            {/* Demo */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">See it in Action</h3>
              <p className="text-sm text-gray-600 mb-4">
                Check out our demo page to see how the widget works.
              </p>
              <Button
                onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL}/demo`, '_blank')}
                className="w-full bg-black hover:bg-black/90 text-white"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}