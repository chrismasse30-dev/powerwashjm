import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Shield } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);

    updatePageMeta({
      title: 'Privacy Policy | J&M Power Washing',
      description: 'Read our privacy policy to understand how J&M Power Washing collects, uses, and protects your personal information.',
      robots: 'noindex, follow',
      canonical: 'https://powerwashjm.com/privacy-policy/'
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-40 lg:pt-56 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex items-center justify-center mb-8">
              <Shield className="w-16 h-16 text-blue-600" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
              Privacy Policy
            </h1>

            <p className="text-center text-gray-600 mb-8">
              <strong>Effective Date:</strong> October 7, 2025
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to <strong>JM Power Wash</strong>. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>jmpowerwash.com</strong> or use our services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our website and services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect information that you provide directly to us when you request a quote, contact us, or use our services. The types of personal information we may collect include:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li><strong>Name:</strong> Your first and last name</li>
                  <li><strong>Email Address:</strong> Your email for correspondence</li>
                  <li><strong>Mailing Address:</strong> Your physical address for service delivery</li>
                  <li><strong>Phone Number:</strong> Your contact number</li>
                  <li><strong>Service Information:</strong> Details about the services you're interested in or have requested</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, and location data</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Primary Purpose:</strong> We collect this information to provide you with the information and services you have requested, to communicate with you about our services, and to improve your experience with JM Power Wash.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Providing and delivering the services you request</li>
                  <li>Responding to your inquiries and providing customer support</li>
                  <li>Sending you service-related communications</li>
                  <li>Marketing our services (with your consent)</li>
                  <li>Improving our website and services</li>
                  <li>Complying with legal obligations</li>
                  <li>Preventing fraud and enhancing security</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Communication Consent</h2>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                  <p className="text-gray-800 leading-relaxed">
                    By clicking <strong>'Submit'</strong> on any form on our website, you agree to <strong>JM Power Wash's Terms of Use and Privacy Policy</strong>. You consent to receive email messages, phone calls, and/or SMS messages from JM Power Wash to provide the information requested above, for follow-ups to ensure information is received, and for other communications for sales and/or marketing purposes. Message frequency depends on your activity. You can opt out by texting <strong>'STOP'</strong> to any message you receive. Additionally, you may email us directly at <a href="mailto:info@jmpowerwash.com" className="text-blue-600 hover:text-blue-800 font-semibold">info@jmpowerwash.com</a> or text <strong>'HELP'</strong> to <a href="tel:+14015950726" className="text-blue-600 hover:text-blue-800 font-semibold">(401) 595-0726</a> for any assistance with our marketing communication. Message and data rates may apply.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights Under GDPR and CCPA</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We respect your privacy rights. Depending on your location, you may have the following rights regarding your personal information:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Right to Be Informed</h3>
                    <p className="text-gray-700">
                      You have the right to be informed about the collection and use of your personal data. This Privacy Policy serves to inform you of these practices.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Right to Access</h3>
                    <p className="text-gray-700">
                      You have the right to request access to the personal data we hold about you. You may request a copy of your personal information at any time.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Right to Correction</h3>
                    <p className="text-gray-700">
                      You have the right to request that we correct any inaccurate or incomplete personal data we hold about you.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Right to Deletion</h3>
                    <p className="text-gray-700">
                      You have the right to request deletion of your personal data, subject to certain legal exceptions. This is sometimes referred to as the "right to be forgotten."
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Right to Opt Out</h3>
                    <p className="text-gray-700">
                      You have the right to opt out of marketing communications at any time by texting 'STOP', clicking unsubscribe in our emails, or contacting us directly.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Right to Data Portability</h3>
                    <p className="text-gray-700">
                      You have the right to receive your personal data in a structured, commonly used format and to transmit that data to another service provider.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Right to Object</h3>
                    <p className="text-gray-700">
                      You have the right to object to our processing of your personal data for direct marketing purposes or where we are relying on legitimate interests.
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mt-6">
                  To exercise any of these rights, please contact us at <a href="mailto:info@jmpowerwash.com" className="text-blue-600 hover:text-blue-800 font-semibold">info@jmpowerwash.com</a> or call us at <a href="tel:+14015950726" className="text-blue-600 hover:text-blue-800 font-semibold">(401) 595-0726</a>.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Protect Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Secure server infrastructure with encryption</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication procedures</li>
                  <li>Employee training on data protection practices</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Links</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our website may contain links to third-party websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we will take steps to remove that information from our servers.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your personal information, we will securely delete or anonymize it.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update our Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of this policy. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-900 font-semibold mb-3">JM Power Wash</p>
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> <a href="mailto:info@jmpowerwash.com" className="text-blue-600 hover:text-blue-800">info@jmpowerwash.com</a>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Phone:</strong> <a href="tel:+14015950726" className="text-blue-600 hover:text-blue-800">(401) 595-0726</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Website:</strong> <a href="https://www.jmpowerwash.com" className="text-blue-600 hover:text-blue-800">www.jmpowerwash.com</a>
                  </p>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  Thank you for trusting JM Power Wash with your personal information.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
