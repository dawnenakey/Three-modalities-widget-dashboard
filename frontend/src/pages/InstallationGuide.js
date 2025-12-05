import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function InstallationGuide() {
  const [copied, setCopied] = useState(false);

  const widgetCode = `<script
  src="${process.env.REACT_APP_BACKEND_URL}/api/widget.js"
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
              <Button onClick={copyCode} className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold">
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

            {/* Platform-Specific Guides */}
            <div className="space-y-6 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform-Specific Guides</h2>
              
              {/* WordPress */}
              <div id="wordpress" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">WordPress</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Installation:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>Go to Appearance → Theme Editor (or Theme File Editor)</li>
                      <li>Find your theme's <code className="bg-gray-100 px-2 py-1 rounded">footer.php</code> file</li>
                      <li>Paste the PIVOT widget code before <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code></li>
                      <li>Click "Update File"</li>
                    </ol>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Alternative:</strong> Use a plugin like "Insert Headers and Footers" to add the code without editing theme files.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Finding OpenGraph/Featured Image:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li><strong>Featured Image:</strong> Set in Post/Page editor → Featured Image (right sidebar)</li>
                      <li><strong>With Yoast SEO:</strong> SEO → Social → Facebook → Image</li>
                      <li><strong>With Rank Math:</strong> Edit post → Social → Image</li>
                      <li><strong>With All in One SEO:</strong> Social Networks → Facebook → Image</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Shopify */}
              <div id="shopify" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Shopify</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Installation:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>Go to Online Store → Themes</li>
                      <li>Click Actions → Edit Code</li>
                      <li>Find <code className="bg-gray-100 px-2 py-1 rounded">theme.liquid</code> in the Layout folder</li>
                      <li>Paste the PIVOT widget code before <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code></li>
                      <li>Click "Save"</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Finding OpenGraph Image:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li><strong>Homepage:</strong> Online Store → Preferences → Social Sharing Image</li>
                      <li><strong>Product Pages:</strong> Products → [Product] → Media → Upload image</li>
                      <li><strong>Collections:</strong> Collections → [Collection] → Image</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Wix */}
              <div id="wix" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Wix</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Installation:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>Open your Wix Editor</li>
                      <li>Click Settings (gear icon) on the left sidebar</li>
                      <li>Go to Custom Code → + Add Custom Code</li>
                      <li>Paste the PIVOT widget code</li>
                      <li>Choose "Body - end" as the placement</li>
                      <li>Select "All Pages" or specific pages</li>
                      <li>Click "Apply"</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Finding OpenGraph Image:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>Go to Settings → SEO (Google)</li>
                      <li>Click on "Social Share"</li>
                      <li>Upload "Social Share Image"</li>
                      <li>This becomes your OpenGraph image</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Squarespace */}
              <div id="squarespace" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Squarespace</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Installation:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>Go to Settings → Advanced → Code Injection</li>
                      <li>Paste the PIVOT widget code in the "Footer" section</li>
                      <li>Click "Save"</li>
                    </ol>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Code Injection is available on Business plans and higher.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Finding OpenGraph Image:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li><strong>Homepage:</strong> Settings → Browser Icon & Social Sharing → Social Sharing Logo</li>
                      <li><strong>Blog Posts:</strong> Edit post → Options → Social Image</li>
                      <li><strong>Pages:</strong> Edit page → Settings → Social Image</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Custom HTML */}
              <div id="custom" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom HTML Website</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Installation:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>Open your HTML file in a text editor</li>
                      <li>Find the closing <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag</li>
                      <li>Paste the PIVOT widget code right before it</li>
                      <li>Save the file</li>
                      <li>Upload to your server</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Adding OpenGraph Image:</h4>
                    <p className="text-sm text-gray-700 mb-3">Add these meta tags in your <code className="bg-gray-100 px-2 py-1 rounded">&lt;head&gt;</code> section:</p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
{`<meta property="og:image" content="https://yoursite.com/preview-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:title" content="Your Page Title">
<meta property="og:description" content="Your page description">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://yoursite.com/preview-image.jpg">`}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Tip:</strong> Use absolute URLs (full https://...) for image paths, not relative paths (/images/...).
                    </p>
                  </div>
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <button onClick={() => document.getElementById('wordpress').scrollIntoView({behavior: 'smooth'})} className="text-sm font-medium text-gray-900 hover:text-[#2F419D] hover:underline transition-all">
                    WordPress
                  </button>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <button onClick={() => document.getElementById('shopify').scrollIntoView({behavior: 'smooth'})} className="text-sm font-medium text-gray-900 hover:text-[#2F419D] hover:underline transition-all">
                    Shopify
                  </button>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <button onClick={() => document.getElementById('wix').scrollIntoView({behavior: 'smooth'})} className="text-sm font-medium text-gray-900 hover:text-[#2F419D] hover:underline transition-all">
                    Wix
                  </button>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <button onClick={() => document.getElementById('squarespace').scrollIntoView({behavior: 'smooth'})} className="text-sm font-medium text-gray-900 hover:text-[#2F419D] hover:underline transition-all">
                    Squarespace
                  </button>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <button onClick={() => document.getElementById('custom').scrollIntoView({behavior: 'smooth'})} className="text-sm font-medium text-gray-900 hover:text-[#2F419D] hover:underline transition-all">
                    Custom HTML
                  </button>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
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