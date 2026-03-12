import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Building2, GraduationCap, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

const Terms = () => {
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully. By using UniHostel, you agree to be bound by these terms and conditions.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Admin Terms */}
        <section className="mb-12 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg p-6 sm:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Terms & Conditions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 italic">Platform Owner & System Overseer</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. Role & Authority</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>The Admin is the owner and overall controller of the platform.</li>
                <li>The Admin has full system privileges and cannot be deleted.</li>
                <li>The Admin oversees students, managers, listings, applications, payments, and analytics.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. System Control Rights</h3>
              <p className="text-gray-700 mb-2">The Admin has the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Approve or reject manager registrations</li>
                <li>Suspend, ban, or permanently disable any user account</li>
                <li>Override application statuses when necessary</li>
                <li>Investigate disputes, fraud, or suspicious activity</li>
                <li>Edit or remove hostel listings that violate platform rules</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. Payments & Commission</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>The Admin earns a commission on every successful booking.</li>
                <li>Commission is automatically deducted during payment via Paystack.</li>
                <li>Admin funds may be subject to Paystack settlement delays (1–3 business days).</li>
                <li>The Admin is not responsible for delays caused by banks, mobile money operators, or Paystack.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">4. Data, Analytics & Reports</h3>
              <p className="text-gray-700 mb-2">The Admin has access to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>All transactions</li>
                <li>Commission breakdowns</li>
                <li>Hostel earnings</li>
                <li>Platform-wide analytics</li>
              </ul>
              <p className="text-gray-700 mt-3">Reports may be exported (PDF/Excel) for record keeping. Analytics are for decision-making and may be near real-time, not always instant.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">5. Liability Limitation</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>The Admin does not own or manage hostels.</li>
                <li>The platform acts strictly as a facilitator.</li>
              </ul>
              <p className="text-gray-700 mt-3">The Admin is not liable for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Hostel living conditions</li>
                <li>Disputes between managers and students</li>
                <li>Loss or damage of personal property</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">6. Modification Rights</h3>
              <p className="text-gray-700 mb-2">The Admin may modify:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Platform rules</li>
                <li>Commission structure</li>
                <li>Approval workflows</li>
                <li>These Terms & Conditions</li>
              </ul>
              <p className="text-gray-700 mt-3 font-semibold">Continued use of the platform implies acceptance of updates.</p>
            </div>
          </div>
        </section>

        {/* Manager Terms */}
        <section className="mb-12 bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-lg p-6 sm:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-500 p-3 rounded-full mr-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Manager Terms & Conditions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 italic">Hostel Owners & Operators</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. Account Registration & Verification</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Managers must provide accurate and truthful information.</li>
                <li>Manager accounts require Admin approval before listing hostels.</li>
                <li>False information may result in suspension or permanent removal.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. Hostel Listings</h3>
              <p className="text-gray-700 mb-2">Managers are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Correct hostel details (price, room type, capacity, facilities)</li>
                <li>Keeping availability and occupancy accurate</li>
                <li>Ensuring listings do not mislead students</li>
              </ul>
              <p className="text-gray-700 mt-3">The Admin reserves the right to edit, suspend, or remove listings that violate platform rules.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. Room Capacity & Occupancy Rules</h3>
              <p className="text-gray-700 mb-2">Occupancy is based only on approved applications, not total applications.</p>
              <div className="bg-indigo-100 p-4 rounded-lg mt-3">
                <p className="text-sm font-semibold text-gray-900 mb-2">Example: A "3 in a room"</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 1 approved → 1/3 occupied</li>
                  <li>• 2 approved → 2/3 occupied</li>
                  <li>• 3 approved → Full</li>
                </ul>
              </div>
              <p className="text-gray-700 mt-3">Managers cannot reset occupancy to zero once filled unless done by Admin.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">4. Application Management</h3>
              <p className="text-gray-700 mb-2">Managers must:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Review applications fairly</li>
                <li>Approve or reject applications responsibly</li>
              </ul>
              <p className="text-gray-700 mt-3">Approval stages:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>First approval → allows student to pay</li>
                <li>Final approval → confirms hostel allocation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">5. Payments & Earnings</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Managers receive only the hostel fee, excluding Admin commission.</li>
                <li>Payments are processed via Paystack subaccounts.</li>
                <li>Settlement may take 1–3 business days depending on Paystack.</li>
                <li>Managers must ensure their Paystack subaccount details are correct.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">6. Access Codes</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Managers must respect the unique access code system.</li>
                <li>Only students with valid codes should be granted access.</li>
                <li>Managers are responsible for verifying codes on arrival.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">7. Prohibited Actions</h3>
              <p className="text-gray-700 mb-2">Managers must not:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Approve payments outside the platform</li>
                <li>Manipulate occupancy data</li>
                <li>Bypass approval or payment flow</li>
                <li>Discriminate unfairly against applicants</li>
              </ul>
              <p className="text-red-600 font-semibold mt-3">Violations may lead to account suspension or permanent ban.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">8. Liability</h3>
              <p className="text-gray-700 mb-2">Managers are solely responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Hostel conditions</li>
                <li>Room availability</li>
                <li>Student welfare within the hostel</li>
              </ul>
              <p className="text-gray-700 mt-3">The platform is not liable for manager-related issues.</p>
            </div>
          </div>
        </section>

        {/* Student Terms */}
        <section className="mb-12 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 sm:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Terms & Conditions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 italic">Applicants & Occupants</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. Account Use</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Students must provide accurate personal information.</li>
                <li>Each student may only use one account.</li>
                <li>Sharing accounts or impersonation is prohibited.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. Application Rules</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Applying for a room does NOT guarantee placement.</li>
                <li>Applications are reviewed by hostel managers.</li>
              </ul>
              <p className="text-gray-700 mt-3">A room is only secured after:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Manager approval</li>
                <li>Successful payment</li>
                <li>Final confirmation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. Payments</h3>
              <p className="text-gray-700 mb-2">Students pay:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Hostel fee</li>
                <li>Admin commission (included in total)</li>
              </ul>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                <li>Payments are processed via Paystack.</li>
                <li>Students must not pay managers outside the platform.</li>
                <li>Failed or incomplete payments do not reserve a room.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">4. Occupancy Logic</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>A room remains open until its capacity is filled by approved students.</li>
                <li>Other students may continue applying until the room is full.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">5. Access Codes</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>After final approval, students receive a unique access code.</li>
                <li>This code is required to access the hostel.</li>
                <li>Sharing the code is prohibited and may result in access denial.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">6. Refunds</h3>
              <p className="text-gray-700 mb-2">Refunds depend on:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Manager decision</li>
                <li>Platform refund rules</li>
                <li>Paystack policies</li>
              </ul>
              <p className="text-gray-700 mt-3">Commission may be non-refundable.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">7. Prohibited Actions</h3>
              <p className="text-gray-700 mb-2">Students must not:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide false details</li>
                <li>Attempt fraudulent payments</li>
                <li>Harass managers or other students</li>
                <li>Share access codes</li>
              </ul>
              <p className="text-red-600 font-semibold mt-3">Violations may result in suspension or permanent ban.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">8. Liability</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>The platform does not guarantee hostel quality.</li>
                <li>Students are responsible for personal belongings.</li>
                <li>Disputes should be raised through the platform's complaint system.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12 bg-gray-100 border border-gray-300 rounded-lg p-6 sm:p-8">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-gray-700 mr-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Governing Law (All Users)</h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>These Terms are governed by the laws of Ghana.</li>
            <li>Any disputes shall be resolved under Ghanaian jurisdiction.</li>
          </ul>
        </section>

        {/* Acceptance */}
        <div className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded-lg">
          <p className="text-gray-900 font-semibold mb-2">By using UniHostel, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
          <p className="text-sm text-gray-600">If you do not agree with any part of these terms, please discontinue use of the platform immediately.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
