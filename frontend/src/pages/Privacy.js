import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, CreditCard, FileText, Mail } from 'lucide-react';
import Footer from '../components/Footer';

const Privacy = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-4 rounded-full">
              <Shield className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            At UniHostel, your privacy is important to us. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use our platform.
          </p>
          <div className="mt-6 text-sm text-gray-500 space-y-1">
            <p><strong>Effective Date:</strong> {currentDate}</p>
            <p><strong>Last Updated:</strong> {currentDate}</p>
          </div>
        </div>

        {/* Agreement Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 rounded-r-lg">
          <p className="text-gray-900 font-semibold">
            By accessing or using our services, you agree to the practices described in this policy.
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
          </div>

          <div className="space-y-6 ml-9">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1.1 Personal Information</h3>
              <p className="text-gray-700 mb-2">We may collect the following:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Student or manager profile details</li>
                <li>Identification or verification documents (for managers)</li>
                <li>Login credentials (securely encrypted)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1.2 Account & Usage Data</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Account type (Student, Manager, Admin)</li>
                <li>Application history</li>
                <li>Approval and rejection records</li>
                <li>Dashboard activity</li>
                <li>Login timestamps</li>
                <li>IP addresses and device information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1.3 Payment Information</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Transaction references</li>
                <li>Payment status (successful, pending, failed)</li>
                <li>Amount paid (hostel fee and commission breakdown)</li>
                <li>Settlement status</li>
              </ul>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mt-3">
                <p className="text-sm text-green-900 font-semibold">
                  Note: We do not store card or mobile money details. All payments are processed securely by third-party payment providers (e.g., Paystack).
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1.4 Hostel & Listing Data</h3>
              <p className="text-gray-700 mb-2">For managers:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Hostel details (name, location, room types)</li>
                <li>Room capacity and availability</li>
                <li>Pricing information</li>
                <li>Images uploaded to the platform</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
          </div>
          <p className="text-gray-700 mb-3 ml-9">We use collected information to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>Create and manage user accounts</li>
            <li>Process applications and approvals</li>
            <li>Facilitate secure payments and settlements</li>
            <li>Generate dashboards, analytics, and reports</li>
            <li>Prevent fraud and misuse</li>
            <li>Communicate important updates</li>
            <li>Provide customer support</li>
            <li>Improve platform functionality</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">3. Legal Basis for Processing</h2>
          </div>
          <p className="text-gray-700 mb-3 ml-9">We process personal data based on:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>User consent</li>
            <li>Contractual necessity (providing platform services)</li>
            <li>Legal obligations</li>
            <li>Legitimate business interests (security, analytics)</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">4. Data Sharing & Disclosure</h2>
          </div>
          <p className="text-gray-700 mb-3 ml-9">We may share data:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>Between students and managers (application-related data only)</li>
            <li>With payment providers (for transaction processing)</li>
            <li>With service providers supporting platform operations</li>
            <li>With authorities when required by law</li>
          </ul>
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4 ml-9">
            <p className="text-sm text-red-900 font-semibold">
              We do not sell or rent personal data to third parties.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Eye className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">5. Role-Based Data Access</h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>Students can only see their own applications and payments</li>
            <li>Managers can only access data related to their hostels</li>
            <li>Admins have full access for oversight, moderation, and analytics</li>
          </ul>
          <p className="text-gray-700 mt-3 ml-9">All access is logged for security and accountability.</p>
        </section>

        {/* Section 6 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <CreditCard className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">6. Payments & Financial Privacy</h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>Payments include hostel fees and admin commission</li>
            <li>Managers see only hostel earnings</li>
            <li>Admin sees commission and platform-wide earnings</li>
            <li>Financial data is displayed strictly based on user role</li>
            <li>Settlement timelines are determined by the payment provider</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">7. Data Retention</h2>
          </div>
          <p className="text-gray-700 mb-3 ml-9">We retain data:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>As long as your account is active</li>
            <li>As required for legal, financial, or audit purposes</li>
            <li>To resolve disputes or enforce agreements</li>
          </ul>
          <p className="text-gray-700 mt-3 ml-9">Users may request deletion of their account, subject to legal obligations.</p>
        </section>

        {/* Section 8 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Lock className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">8. Data Security</h2>
          </div>
          <p className="text-gray-700 mb-3 ml-9">We implement strong security measures, including:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>Encrypted data storage</li>
            <li>Secure authentication</li>
            <li>Role-based access control</li>
            <li>Audit logs for sensitive actions</li>
          </ul>
          <p className="text-gray-600 italic mt-3 ml-9 text-sm">
            Despite best efforts, no system is 100% secure, and users share data at their own risk.
          </p>
        </section>

        {/* Section 9 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">9. Your Rights</h2>
          </div>
          <p className="text-gray-700 mb-3 ml-9">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account</li>
            <li>Withdraw consent where applicable</li>
            <li>Object to certain processing activities</li>
          </ul>
          <p className="text-gray-700 mt-3 ml-9">Requests can be made through the Support Center.</p>
        </section>

        {/* Section 10 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">10. Cookies & Tracking</h2>
          </div>
          <p className="text-gray-700 mb-3 ml-9">We may use cookies to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-13">
            <li>Maintain login sessions</li>
            <li>Improve user experience</li>
            <li>Analyze platform usage</li>
          </ul>
          <p className="text-gray-700 mt-3 ml-9">You can control cookie preferences via your browser settings.</p>
        </section>

        {/* Section 11 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">11. Third-Party Links</h2>
          </div>
          <p className="text-gray-700 ml-9">
            Our platform may contain links to third-party services. We are not responsible for the privacy practices of those external sites.
          </p>
        </section>

        {/* Section 12 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">12. Children's Privacy</h2>
          </div>
          <p className="text-gray-700 ml-9">
            This platform is intended for users aged 18 and above. We do not knowingly collect data from minors.
          </p>
        </section>

        {/* Section 13 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">13. Changes to This Policy</h2>
          </div>
          <p className="text-gray-700 ml-9">
            We may update this Privacy Policy from time to time. Changes will be communicated through the platform. Continued use implies acceptance of the updated policy.
          </p>
        </section>

        {/* Section 14 */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Mail className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">14. Contact Us</h2>
          </div>
          <p className="text-gray-700 mb-4 ml-9">
            If you have questions or concerns about this Privacy Policy, contact us at:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 ml-9">
            <div className="space-y-2">
              <p className="text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary-600" />
                <strong>Email:</strong> <a href="mailto:support@unihostel.com" className="text-primary-600 hover:underline ml-2">support@unihostel.com</a>
              </p>
              <p className="text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary-600" />
                <strong>Jurisdiction:</strong> <span className="ml-2">Ghana</span>
              </p>
            </div>
          </div>
        </section>

        {/* Closing Statement */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Your Privacy, Our Responsibility</h2>
          <p className="text-lg">
            At UniHostel, protecting your information is not optional — it's a responsibility we take seriously.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
