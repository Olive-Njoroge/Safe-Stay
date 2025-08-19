import React from 'react';
import Layout from '../components/Layout';

const LandlordRights = () => {
  const rights = [
    {
      title: 'Right to Fair Rent',
      description: 'Landlords can set initial rent based on market value, location, and amenities.',
      details: [
        'Set rent based on current market rates for similar properties',
        'Consider location, property condition, and available amenities',
        'Collect rent payments as stipulated in the tenancy agreement',
        'Charge late fees up to 10% of rent if specified in the agreement'
      ]
    },
    {
      title: 'Right to Select Tenants',
      description: 'Landlords may screen tenants based on financial stability, references, or compliance with property rules.',
      details: [
        'Screen prospective tenants for financial stability and creditworthiness',
        'Request and verify references from previous landlords or employers',
        'Ensure compliance with reasonable property rules and regulations',
        'Screening must not involve unlawful discrimination (race, religion, etc.)'
      ]
    },
    {
      title: 'Right to Collect Rent',
      description: 'Landlords are entitled to timely rent as per the tenancy agreement.',
      details: [
        'Receive rent payments on the agreed dates and amounts',
        'Enforce payment terms outlined in the lease agreement',
        'Take appropriate action for non-payment following legal procedures',
        'Be mindful of tenant circumstances while enforcing payment'
      ]
    },
    {
      title: 'Right to Maintain the Property',
      description: 'Landlords are responsible for major repairs and keeping the property in habitable condition.',
      details: [
        'Conduct necessary major repairs and structural maintenance',
        'Ensure the property meets basic habitability standards',
        'Access property for maintenance purposes with proper notice',
        'Make improvements that preserve or enhance property value'
      ]
    },
    {
      title: 'Right to Inspect or Access Property',
      description: 'Landlords may access the premises for maintenance, inspections, or viewings with reasonable notice.',
      details: [
        'Give 24-48 hours advance notice before entering the property',
        'Access for routine inspections, maintenance, or emergency repairs',
        'Show property to prospective tenants or buyers with notice',
        'Enter immediately in genuine emergency situations'
      ]
    },
    {
      title: 'Right to Evict with Due Process',
      description: 'Landlords can evict tenants for valid reasons following proper legal procedures.',
      details: [
        'Valid reasons include non-payment, breach of lease terms, or property damage',
        'Unauthorized subletting or illegal activities are grounds for eviction',
        'Must follow legal due process with proper written notice',
        'Self-help evictions (changing locks, utilities cutoff) are illegal'
      ]
    },
    {
      title: 'Right to Withhold Security Deposit',
      description: 'Landlords may deduct legitimate costs from tenant security deposits.',
      details: [
        'Deduct unpaid rent from the security deposit',
        'Charge for repairs beyond normal wear and tear',
        'Provide clear, itemized statement of all deductions',
        'Return remaining deposit within legally specified timeframe'
      ]
    },
    {
      title: 'Right to Sell Property',
      description: 'Landlords retain ownership rights including the right to sell their property.',
      details: [
        'Maintain all landlord rights until tenancy agreement ends',
        'New owner inherits both rights and obligations under existing lease',
        'Must honor existing tenancy agreements through the sale process',
        'Provide proper notice to tenants regarding property sale'
      ]
    },
    {
      title: 'Right to Re-let Property',
      description: 'Once a tenant gives notice, landlords may begin searching for replacement tenants.',
      details: [
        'Start advertising and showing property after receiving tenant notice',
        'Minimize vacancy periods and income loss between tenancies',
        'Schedule viewings with proper notice to existing tenant',
        'Prepare property for new tenancy while respecting current tenant rights'
      ]
    }
  ];

  const resources = [
    {
      title: 'Landlord Association of Kenya',
      description: 'Professional support and guidance for property owners and landlords',
      contact: '1-800-LANDLORD-HELP'
    },
    {
      title: 'Law Society of Kenya',
      description: 'Legal guidance on landlord-tenant law and property rights',
      contact: '1-800-LEGAL-COUNSEL'
    },
    {
      title: 'Property Management Services',
      description: 'Professional property management and tenant relations assistance',
      contact: '1-800-PROPERTY-MGT'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Know Your Rights as a Landlord
          </h1>
          <p className="text-gray-600">
            Understanding your rights as a property owner helps you maintain a professional
            landlord-tenant relationship while protecting your investment.
          </p>
        </div>

        {/* Rights Cards */}
        <div className="grid gap-6">
          {rights.map((right, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {right.title}
              </h2>
              <p className="text-gray-600 mb-4">{right.description}</p>
              <div className="space-y-2">
                {right.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-amber-900 mb-2">
                Important Notice
              </h3>
              <p className="text-amber-800">
                Landlord rights vary by location and are subject to local tenancy laws.
                The information provided here is based on Kenyan tenancy law as general guidance.
                Always consult with qualified legal professionals for specific situations and ensure
                compliance with current local and national regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Need Help? Contact These Resources
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                <p className="text-sm font-medium text-green-600">{resource.contact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices Tips */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Best Practices for Landlords
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-gray-700">
                Maintain clear, written lease agreements outlining all terms and conditions
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-gray-700">
                Document all communications with tenants and keep records of property condition
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-gray-700">
                Conduct regular property inspections and address maintenance issues promptly
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-gray-700">
                Follow proper legal procedures for all tenant-related actions and notices
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandlordRights;