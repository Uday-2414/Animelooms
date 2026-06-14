import { Link } from 'react-router-dom'
import LogoName from '../../assets/Logo-name.png'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-white/5 bg-background-base/50 backdrop-blur-md py-4 mt-auto">
      <div className="w-full max-w-[1280px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Name / Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <img
            src={LogoName}
            alt="AnimeLoom Logo"
            className="w-auto h-16 object-contain"
          />
          <span className="font-ui text-xs text-gray-500">
            &copy; {currentYear} AnimeLoom. All rights reserved.
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <Link
            to="/about"
            className="font-ui text-xs font-semibold text-gray-400 hover:text-white transition-colors duration-300"
          >
            About
          </Link>
          <Link
            to="/privacy"
            className="font-ui text-xs font-semibold text-gray-400 hover:text-white transition-colors duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="font-ui text-xs font-semibold text-gray-400 hover:text-white transition-colors duration-300"
          >
            Terms of Service
          </Link>
          <Link
            to="/contact"
            className="font-ui text-xs font-semibold text-gray-400 hover:text-white transition-colors duration-300"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}
