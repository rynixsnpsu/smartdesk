import Head from "next/head";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - SmartDesk</title>
      </Head>
      <div className="min-h-screen bg-dark relative">
        <nav className="relative z-10 p-6 flex justify-between items-center border-b border-neon-cyan/30">
          <Link href="/" className="text-2xl font-bold neon-glow">SmartDesk</Link>
          <Link href="/" className="btn-neon text-sm px-4 py-2">Back to Home</Link>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gradient-neon mb-8">Terms of Service</h1>
          <div className="futuristic-card p-8 space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using SmartDesk ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">2. Description of Service</h2>
              <p>
                SmartDesk is a comprehensive university management system that provides tools for academic, 
                financial, administrative, and operational management. The Service includes but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Student enrollment and academic record management</li>
                <li>Attendance tracking and reporting</li>
                <li>Financial operations and fee management</li>
                <li>Hostel and infrastructure management</li>
                <li>Library system and book tracking</li>
                <li>Event and announcement management</li>
                <li>Analytics and reporting tools</li>
                <li>AI-powered insights and recommendations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-neon-pink mb-2">3.1 Account Creation</h3>
              <p className="mb-4">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information as necessary</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-neon-pink mb-2 mt-6">3.2 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree 
                to notify us immediately of any unauthorized access or use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws or regulations in your jurisdiction</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Upload malicious code, viruses, or harmful software</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Collect or harvest user information without consent</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">5. Intellectual Property</h2>
              <p>
                The Service, including its original content, features, and functionality, is owned by SmartDesk 
                and protected by international copyright, trademark, and other intellectual property laws. You may 
                not reproduce, distribute, modify, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">6. User Content</h2>
              <p>
                You retain ownership of any content you submit to the Service. By submitting content, you grant 
                us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content 
                solely for the purpose of providing and improving the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">7. Service Availability</h2>
              <p>
                We strive to maintain high availability of the Service but do not guarantee uninterrupted access. 
                The Service may be temporarily unavailable due to maintenance, updates, or unforeseen circumstances. 
                We are not liable for any loss or damage resulting from Service unavailability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, SmartDesk shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including loss of profits, data, or use, arising out 
                of or related to your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">9. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless SmartDesk, its officers, directors, employees, and agents 
                from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of 
                your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">10. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account and access to the Service immediately, 
                without prior notice, for any reason, including breach of these Terms. Upon termination, your right 
                to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant changes 
                by posting the updated Terms on this page. Your continued use of the Service after changes constitutes 
                acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to 
                conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive 
                jurisdiction of the appropriate courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">13. Contact Information</h2>
              <p>
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:support@smartdesk.com" className="text-neon-cyan hover:text-neon-pink">
                  support@smartdesk.com
                </a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-neon-cyan/30 text-sm text-gray-400">
              <p>Last Updated: January 2025</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
