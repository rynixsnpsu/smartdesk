import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faBook, faCheck, faHome, faBookOpen, faMoneyBillWave, faBuilding, faCalendarAlt, faChartBar, faHeart, faRocket, faShieldAlt, faUsers, faCogs, faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>SmartDesk - AI-Powered University Management System</title>
        <meta name="description" content="Transform your university operations with SmartDesk - Comprehensive management system with 200+ features" />
      </Head>
      <div className="min-h-screen bg-dark relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-neon-cyan opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-neon-pink opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-purple opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        {/* Navbar */}
        <nav className="relative z-10 p-6 flex justify-between items-center">
          <div className="text-2xl font-bold neon-glow">SmartDesk</div>
          <div className="flex gap-4 items-center">
            <Link href="#about" className="text-gray-300 hover:text-neon-cyan transition-colors">About</Link>
            <Link href="#contact" className="text-gray-300 hover:text-neon-cyan transition-colors">Contact</Link>
            <Link href="/api-docs" className="text-gray-300 hover:text-neon-cyan transition-colors">API Docs</Link>
            <button
              onClick={() => router.push("/login")}
              className="btn-neon btn-neon-primary"
            >
              Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-gradient-neon neon-glow">
            SmartDesk
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Next-Generation University Management System
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Comprehensive platform with 200+ features for academic excellence. Manage everything from student enrollment to financial operations with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/login")}
              className="btn-neon btn-neon-primary px-8 py-4 text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push("/api-docs")}
              className="btn-neon px-8 py-4 text-lg"
            >
              View API Docs
            </button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient-neon">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: faBrain, title: "AI Intelligence", desc: "Advanced AI analyzes feedback and provides actionable insights." },
              { icon: faBook, title: "Academic Management", desc: "Complete course, department, and enrollment management." },
              { icon: faCheck, title: "Attendance Tracking", desc: "Real-time attendance monitoring and reporting." },
              { icon: faHome, title: "Hostel Management", desc: "Room allocation, maintenance, and resident management." },
              { icon: faBookOpen, title: "Library System", desc: "Book cataloging, issue tracking, and inventory management." },
              { icon: faMoneyBillWave, title: "Financial Operations", desc: "Fee management, payments, and scholarship tracking." },
              { icon: faBuilding, title: "Infrastructure", desc: "Building and room management with maintenance tracking." },
              { icon: faCalendarAlt, title: "Events & Announcements", desc: "Event planning and campus-wide announcements." },
              { icon: faChartBar, title: "Analytics Dashboard", desc: "Comprehensive analytics and reporting tools." },
            ].map((feature, idx) => (
              <div key={idx} className="futuristic-card hover-lift slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="text-4xl mb-4"><FontAwesomeIcon icon={feature.icon} /></div>
                <h3 className="text-xl font-bold mb-2 text-neon-cyan">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "200+", label: "Features" },
              { value: "10k+", label: "Students" },
              { value: "50+", label: "Universities" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center futuristic-card">
                <div className="text-4xl font-bold text-gradient-neon mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient-neon">About SmartDesk</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="futuristic-card p-8">
              <h3 className="text-2xl font-bold text-neon-cyan mb-4">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                SmartDesk is designed to revolutionize university management by providing a comprehensive, 
                AI-powered platform that streamlines operations across all departments. We believe in making 
                administrative tasks effortless so educators can focus on what matters most: teaching and learning.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Built with cutting-edge technology and a user-centric approach, SmartDesk brings together 
                academic, financial, infrastructure, and administrative functions into one seamless ecosystem.
              </p>
            </div>
            <div className="futuristic-card p-8">
              <h3 className="text-2xl font-bold text-neon-pink mb-4">Key Benefits</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faCheck} className="text-neon-green mr-2 mt-1" />
                  <span>Centralized management of all university operations</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faCheck} className="text-neon-green mr-2 mt-1" />
                  <span>AI-powered insights for data-driven decisions</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faCheck} className="text-neon-green mr-2 mt-1" />
                  <span>Role-based access control for security</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faCheck} className="text-neon-green mr-2 mt-1" />
                  <span>Real-time analytics and reporting</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faCheck} className="text-neon-green mr-2 mt-1" />
                  <span>Scalable architecture for growth</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faCheck} className="text-neon-green mr-2 mt-1" />
                  <span>Modern, intuitive user interface</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient-neon">Get In Touch</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="futuristic-card p-8">
              <h3 className="text-2xl font-bold text-neon-cyan mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Email</div>
                  <a href="mailto:support@smartdesk.com" className="text-neon-cyan hover:text-neon-pink transition-colors">
                    support@smartdesk.com
                  </a>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">GitHub</div>
                  <a href="https://github.com/rynixofficial" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:text-neon-pink transition-colors">
                    github.com/rynixofficial
                  </a>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Developer</div>
                  <div className="text-gray-300">Made with <FontAwesomeIcon icon={faHeart} className="text-red-500 mx-1" /> by rynixofficial</div>
                </div>
              </div>
            </div>
            <div className="futuristic-card p-8">
              <h3 className="text-2xl font-bold text-neon-pink mb-6">Send a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Name</label>
                  <input type="text" className="input-neon w-full rounded" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email</label>
                  <input type="email" className="input-neon w-full rounded" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Message</label>
                  <textarea className="input-neon w-full rounded min-h-[120px] resize-y" placeholder="Your message..."></textarea>
                </div>
                <button type="submit" className="btn-neon btn-neon-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-neon-cyan/30 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-4">SmartDesk</h4>
                <p className="text-gray-400 text-sm">
                  Next-generation university management system with 200+ features.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/" className="hover:text-neon-cyan transition-colors">Home</Link></li>
                  <li><Link href="#about" className="hover:text-neon-cyan transition-colors">About</Link></li>
                  <li><Link href="#contact" className="hover:text-neon-cyan transition-colors">Contact</Link></li>
                  <li><Link href="/api-docs" className="hover:text-neon-cyan transition-colors">API Docs</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/privacy" className="hover:text-neon-cyan transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-neon-cyan transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="https://github.com/rynixofficial" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="mailto:support@smartdesk.com" className="hover:text-neon-cyan transition-colors">
                      Email Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center text-gray-400 text-sm border-t border-neon-cyan/30 pt-8">
              <p>
                © 2025 SmartDesk. Built with <FontAwesomeIcon icon={faHeart} className="text-red-500 mx-1" /> by{" "}
                <a href="https://github.com/rynixofficial" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:text-neon-pink">
                  rynixofficial
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
