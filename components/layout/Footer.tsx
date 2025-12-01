import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">
              VolunteerHub
            </h3>
            <p className="text-sm text-gray-600">
              Connecting volunteers with meaningful opportunities to make a difference.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/jobs" className="hover:text-primary-dark transition-colors">Browse Opportunities</Link></li>
              <li><Link href="/about" className="hover:text-primary-dark transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary-dark transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* For NGOs */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">For NGOs</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/ngo/register" className="hover:text-primary-dark transition-colors">Register NGO</Link></li>
              <li><Link href="/ngo/dashboard" className="hover:text-primary-dark transition-colors">NGO Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:text-primary-dark transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-primary-dark transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-dark transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-primary-dark transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © {currentYear} VolunteerHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
