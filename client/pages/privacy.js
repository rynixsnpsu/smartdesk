import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - SmartDesk</title>
      </Head>
      <div className="min-h-screen bg-dark relative">
        <nav className="relative z-10 p-6 flex justify-between items-center border-b border-neon-cyan/30">
          <Link href="/" className="text-2xl font-bold neon-glow">SmartDesk</Link>
          <Link href="/" className="btn-neon text-sm px-4 py-2">Back to Home</Link>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gradient-neon mb-8">Privacy Policy</h1>
          <div className="futuristic-card p-8 space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">1. Introduction</h2>
              <p>
                SmartDesk ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our university 
                management system.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-neon-pink mb-2">2.1 Personal Information</h3>
              <p className="mb-4">
                We collect personal information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, username, and email address</li>
                <li>Student ID, enrollment information</li>
                <li>Academic records and attendance data</li>
                <li>Financial information for fee management</li>
                <li>Hostel and library records</li>
              </ul>

              <h3 className="text-xl font-semibold text-neon-pink mb-2 mt-6">2.2 Usage Data</h3>
              <p>
                We automatically collect information about how you interact with our platform, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>IP address and browser type</li>
                <li>Pages visited and time spent</li>
                <li>Device information</li>
                <li>Log files and error reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Providing and maintaining our services</li>
                <li>Managing academic, financial, and administrative operations</li>
                <li>Processing enrollments, attendance, and grades</li>
                <li>Sending notifications and announcements</li>
                <li>Improving our platform and user experience</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>Role-based access control</li>
                <li>Regular security audits</li>
                <li>Secure database storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">5. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your information only:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>With authorized university administrators</li>
                <li>To comply with legal requirements</li>
                <li>To protect our rights and safety</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">7. Cookies</h2>
              <p>
                We use HTTP-only cookies for authentication and session management. These cookies are essential 
                for the platform to function and cannot be disabled. We do not use tracking cookies for advertising.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">8. Third-Party Services</h2>
              <p>
                Our platform may integrate with third-party services (e.g., Ollama for AI features). These services 
                have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">9. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and comply 
                with legal obligations. Academic records may be retained longer as required by educational regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">10. Children's Privacy</h2>
              <p>
                Our platform is designed for university students and staff. We do not knowingly collect information 
                from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-cyan mb-4">12. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at:
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
