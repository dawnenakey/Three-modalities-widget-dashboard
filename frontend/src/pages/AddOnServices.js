import DashboardLayout from '@/components/DashboardLayout';

export default function AddOnServices() {
  const services = [
    {
      title: 'Widget Customization',
      description: "Transform PIVOT's widget into a seamless part of your brand. We customize colors, layout, iconography, placement, and more so your language-access interface feels native to your website while keeping it lightweight, fast, and compliant.",
      email: 'hello@dozanu.com'
    },
    {
      title: 'Human Translation by accesszanü',
      description: 'Get accurate, culturally aware translations delivered by real human experts. Our Deaf and multilingual linguists ensure every message lands with clarity, nuance, and trust—far beyond what machine translation can provide. From vital documents to digital content, we deliver translation you can rely on for compliance, comprehension, and true language equity.',
      email: 'hello@accesszanu.com'
    },
    {
      title: 'Website Accessibility Audits & User Testing',
      description: "Get a clear, human-verified look at how accessible your website really is. Our disabled auditors and real user testers identify barriers automated tools miss—then give you a prioritized roadmap and actionable fixes. You'll receive expert insights, real user feedback, and everything your team needs to boost compliance, improve usability, and create a genuinely inclusive digital experience.",
      email: 'hello@accesszanu.com'
    },
    {
      title: 'Website Accessibility Remediation',
      description: 'Fix accessibility barriers with a team that actually understands them. We turn audit findings into clean, compliant code—correcting issues across design, development, and content. Our disabled-led experts partner with your dev team or handle the fixes end-to-end, ensuring your website meets WCAG standards, improves usability, and stays accessible as you grow.',
      email: 'hello@accesszanu.com'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add-On Services</h1>
          <p className="text-gray-600">Accessibility Expertise You Can Count On</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-700">
            Our industry-leading web accessibility experts are ready to take your website, apps, and digital assets to the next level.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">{service.description}</p>
              <a
                href={`mailto:${service.email}`}
                className="inline-block px-6 py-3 bg-[#21D4B4] text-black font-medium rounded-lg transition-colors hover:bg-[#91EED2]"
              >
                Get a Quote &gt;
              </a>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}