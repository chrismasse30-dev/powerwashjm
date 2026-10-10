import React, { useState, useEffect } from 'react';
import { Calendar, FileText, ClipboardList, Image, Wallet, User } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';

export default function CustomerPortalPage() {
  const portalUrl = 'https://client.housecallpro.com/customer_portal/request-link?token=7920fee3491945b186cac64d28188ec9';

  useEffect(() => {
    updatePageMeta({
      title: 'Customer Portal | J&M Power Washing',
      description: 'Access your customer portal to view appointments, invoices, and estimates.',
      robots: 'noindex, nofollow'
    });
  }, []);

  const features = [
    {
      icon: Calendar,
      title: 'Appointments',
      description: 'View and manage your scheduled service appointments',
    },
    {
      icon: FileText,
      title: 'Invoices',
      description: 'Access all your invoices and payment history',
    },
    {
      icon: ClipboardList,
      title: 'Estimates',
      description: 'Review quotes and estimates for your projects',
    },
    {
      icon: Image,
      title: 'Gallery',
      description: 'See photos from your completed jobs',
    },
    {
      icon: Wallet,
      title: 'Wallet',
      description: 'Manage payment methods and billing information',
    },
    {
      icon: User,
      title: 'My Account',
      description: 'Update your contact information and preferences',
    },
  ];

  return (
    <div className="pt-40 lg:pt-56 bg-white">
      <main className="flex-grow">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Customer Portal
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Manage your services, appointments, and account all in one place
              </p>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-lg shadow-lg transition-all text-lg"
              >
                Access Your Portal
              </a>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  What You Can Do
                </h2>
                <p className="text-xl text-gray-600">
                  Access everything you need to manage your J & M Power Washing services
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="bg-white py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Why Use the Customer Portal?
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      24/7 Access
                    </h3>
                    <p className="text-gray-600">
                      View your account information and service history anytime, anywhere
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Secure & Private
                    </h3>
                    <p className="text-gray-600">
                      Your information is protected with industry-leading security measures
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Easy Management
                    </h3>
                    <p className="text-gray-600">
                      Update your contact details, view invoices, and manage appointments in one place
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Instant Updates
                    </h3>
                    <p className="text-gray-600">
                      Get real-time notifications about your appointments and services
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gray-100 py-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Access your customer portal now to manage all your J & M Power Washing services
              </p>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-all text-lg"
              >
                Login to Portal
              </a>
              <p className="mt-6 text-sm text-gray-600">
                First time logging in?{' '}
                <a
                  href="tel:+14015950726"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Call us at (401) 595-0726
                </a>
                {' '}for assistance
              </p>
            </div>
          </section>
        </main>
    </div>
  );
}
