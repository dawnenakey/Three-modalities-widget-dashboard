import { useEffect } from 'react';

export default function DDSPage() {
  useEffect(() => {
    // Load the widget script from R2 CDN
    const script = document.createElement('script');
    script.src = 'https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/widget.js?v=20251206';
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://demo.gopivot.me/wp-content/uploads/2025/09/dds-logo.png" 
              alt="Logo for DDS Department of Developmental Services"
              className="h-16"
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <ul className="flex gap-8 text-sm">
              <li className="py-3"><a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Consumers</a></li>
              <li className="py-3"><a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Services</a></li>
              <li className="py-3"><a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Regional Centers</a></li>
              <li className="py-3"><a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Vendors</a></li>
              <li className="py-3"><a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Initiatives</a></li>
              <li className="py-3"><a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Transparency</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <nav className="text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">Home</a> › 
            <a href="#" className="hover:text-blue-600"> General</a> › 
            <span className="text-gray-900 font-medium"> Language Resources</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Language Resources</h1>

        {/* Language Links */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-800">
            DDS Resources are available in the following languages: {' '}
            <a href="#" className="text-blue-600 hover:underline">Español (Spanish)</a>, {' '}
            <a href="#" className="text-blue-600 hover:underline">繁體中文 (Traditional Chinese)</a>, {' '}
            <a href="#" className="text-blue-600 hover:underline">简体中文 (Simplified Chinese)</a>, {' '}
            <a href="#" className="text-blue-600 hover:underline">Tagalog</a>, {' '}
            <a href="#" className="text-blue-600 hover:underline">Tiếng Việt (Vietnamese)</a> and {' '}
            <a href="#" className="text-blue-600 hover:underline">한국어 (Korean)</a>.
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            DDS works to ensure services are available to Californians with developmental disabilities through California's 21 regional centers. 
            Services are supposed to be person-centered and meet the many different needs of consumers. Services should also reflect each 
            individual's choices to lead independent and productive lives within their communities.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Below is a brief overview of important programs and services. For questions and more information, you can contact the program and 
            request free verbal and sign language interpretation and written translation services in your own language.
          </p>
        </div>

        {/* Section 1: Regional Center Eligibility & Services */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Regional Center Eligibility & Services</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Regional centers provide assessments, determine eligibility for services, and offer case management services. Regional centers also 
            develop, purchase, and coordinate the services in each person's Individual Program Plan.
          </p>
          <p className="text-lg text-gray-700">
            Click <a href="#" className="text-blue-600 hover:underline font-medium">here</a> to contact your Regional Center and get free help in your language.
          </p>
        </section>

        {/* Section 2: Self-Determination Program */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Self-Determination Program</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            The Self-Determination Program allows participants the opportunity to have more control in developing their service plans and selecting 
            service providers to better meet their needs. If you are interested in participating in the Self-Determination Program reach out to 
            your <a href="#" className="text-blue-600 hover:underline">regional center</a> for more information on how to get started.
          </p>
          <p className="text-lg text-gray-700">
            Contact: <a href="mailto:sdp@dds.ca.gov" className="text-blue-600 hover:underline font-medium">sdp@dds.ca.gov</a> for more information or for free help in your language.
          </p>
        </section>

        {/* Section 3: Early Start */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Early Start</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            The Early Start program is California's early intervention program for infants and toddlers with developmental delays or at risk for 
            having a developmental disability and their families. Early Start services are available statewide and are provided in a coordinated, 
            family-centered system.
          </p>
          <p className="text-lg text-gray-700">
            Parents, caregivers, and families can contact <span className="font-medium">800-515-2229</span> or{' '}
            <a href="mailto:earlystart@dds.ca.gov" className="text-blue-600 hover:underline font-medium">earlystart@dds.ca.gov</a> for free help in their language.
          </p>
        </section>

        {/* Section 4: Office of the Lanterman Ombudsperson */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Office of the Lanterman Ombudsperson and the Self-Determination Ombudsperson</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            The Offices of the Lanterman Ombudsperson and the Self-Determination Ombudsperson can help regional center clients and their families 
            when they have problems accessing their services.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Contact <span className="font-medium">877-658-9731</span> or{' '}
            <a href="mailto:Ombudsperson@dds.ca.gov" className="text-blue-600 hover:underline font-medium">Ombudsperson@dds.ca.gov</a> for more information and free help in your language.
          </p>
          <p className="text-lg text-gray-700">
            If you are in the Self-Determination Program, contact <span className="font-medium">877-658-9731</span> or{' '}
            <a href="mailto:SDP.Ombudsperson@dds.ca.gov" className="text-blue-600 hover:underline font-medium">SDP.Ombudsperson@dds.ca.gov</a> for more information and free help in your language.
          </p>
        </section>

        {/* Section 5: Appeals & Complaints */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Appeals & Complaints</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            DDS is committed to resolving problems and concerns when they occur. Anyone aged 3 or older who has applied for regional center 
            services, or who is currently receiving regional services,{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">can appeal regional center decisions here</a>.
          </p>
          <p className="text-lg text-gray-700">
            There are other types of complaints you can file regarding your rights, Title 17, "Whistleblower" and Early Start services. 
            Contact <span className="font-medium">833-538-3723</span> or{' '}
            <a href="mailto:appeals@dds.ca.gov" className="text-blue-600 hover:underline font-medium">appeals@dds.ca.gov</a> for more information on what kind of complaint you need to file and free help in your language.
          </p>
        </section>

        {/* Last Modified */}
        <div className="text-sm text-gray-500 mt-12 pt-6 border-t border-gray-200">
          Last modified: October 23, 2024
        </div>
      </main>
    </div>
  );
}
