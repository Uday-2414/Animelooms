import { useState } from 'react'
import SEO from '../components/seo/SEO'
import Button from '../components/ui/Button'
import { Mail, MessageSquare, HelpCircle, CheckCircle, Compass, Send } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [activeFaq, setActiveFaq] = useState(null)

  const faqs = [
    {
      question: 'Where does AnimeLoom get its anime data?',
      answer: 'We fetch live records, metadata, rankings, and overview summaries directly from the Jikan API, which synchronizes with MyAnimeList.'
    },
    {
      question: 'Can I watch or stream episodes on AnimeLoom?',
      answer: 'No. AnimeLoom is strictly a discovery, details lookup, and watchlist organization platform. We do not host, stream, or index any video files or media streams.'
    },
    {
      question: 'Is my watchlist private or visible to others?',
      answer: 'By default, all your watchlist categories, ratings, and profile information are completely private. Only you can view them when logged into your account.'
    },
    {
      question: 'How do I request account and data deletion?',
      answer: 'You can request full database removal of your profile logs and watchlist info by submitting this form or emailing animelooms@zohomail.in.'
    }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please provide a valid email address.')
      return
    }

    // Compose direct mailto link to route form details directly
    const mailtoUrl = `mailto:animelooms@zohomail.in?subject=${encodeURIComponent(
      formData.subject || 'AnimeLoom Support Inquiry'
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`

    // Redirect to compose email client
    window.location.href = mailtoUrl

    setSubmitted(true)
  }

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index))
  }

  return (
    <>
      <SEO
        title="Contact Us & Help"
        description="Get in touch with the AnimeLoom team. Submit feedback, report bugs, ask questions, or read our FAQ guide."
        pathname="/contact"
      />
      <div className="space-y-12 pb-12 animate-fade-in font-ui">
        {/* Contact Header */}
        <section className="text-center space-y-4 max-w-2xl mx-auto py-4">
          <h1 className="text-3xl md:text-4xl font-black text-white font-logo tracking-wide">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Have feedback, bug reports, or partnership queries? Use the form below or browse our FAQ to find instant answers.
          </p>
        </section>

        {/* Contact & FAQ Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: FAQ & Social Info (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* FAQ Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-5 w-5 text-brand" />
                <h2 className="text-xl font-bold text-white font-logo">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = activeFaq === index
                  return (
                    <div
                      key={index}
                      className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-white hover:bg-white/2 transition-colors duration-200"
                      >
                        <span>{faq.question}</span>
                        <span className="text-brand text-lg ml-4">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          isOpen ? 'max-h-40 border-t border-white/5' : 'max-h-0'
                        }`}
                      >
                        <p className="p-5 text-xs md:text-sm text-gray-400 leading-relaxed bg-surface-chrome/30">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Social Links Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="h-5 w-5 text-brand" />
                <h2 className="text-xl font-bold text-white font-logo">Connect With Us</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-surface-card border border-white/5 hover:border-brand/30 hover:scale-[1.02] p-4 rounded-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white group-hover:text-brand transition-colors">Twitter</span>
                    <span className="text-[10px] text-gray-500">@AnimeLoom</span>
                  </div>
                </a>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-surface-card border border-white/5 hover:border-brand/30 hover:scale-[1.02] p-4 rounded-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white group-hover:text-brand transition-colors">GitHub</span>
                    <span className="text-[10px] text-gray-500">AnimeLoom Repo</span>
                  </div>
                </a>

                <div className="flex items-center gap-3 bg-surface-card border border-white/5 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Email</span>
                    <span className="text-[10px] text-gray-500">animelooms@zohomail.in</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Contact Form (5 cols) */}
          <div className="lg:col-span-5">
            <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand to-brand/50" />
              
              {submitted ? (
                <div className="text-center py-12 space-y-5 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto text-brand border border-brand/20">
                    <CheckCircle className="h-10 w-10 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-logo">Message Received!</h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{formData.name}</strong>. We have received your inquiry and will follow up with you at <strong className="text-white">{formData.email}</strong> as soon as possible.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ name: '', email: '', subject: '', message: '' })
                    }}
                    className="mt-4"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-brand" />
                    <h2 className="text-lg font-bold text-white font-logo">Send a Message</h2>
                  </div>

                  {error && (
                    <div className="p-3 bg-brand/10 border border-brand/20 text-brand text-xs font-semibold rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Your Name <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Kenji Sato"
                      className="w-full bg-background-base border border-white/5 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl px-4 py-3 text-sm text-white transition-all duration-300 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Email Address <span className="text-brand">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full bg-background-base border border-white/5 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl px-4 py-3 text-sm text-white transition-all duration-300 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Watchlist Sync Issue"
                      className="w-full bg-background-base border border-white/5 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl px-4 py-3 text-sm text-white transition-all duration-300 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Message <span className="text-brand">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Write your suggestions, feedback, or bugs..."
                      className="w-full bg-background-base border border-white/5 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl px-4 py-3 text-sm text-white transition-all duration-300 outline-none resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="flex items-center justify-center gap-2 py-3 rounded-xl mt-6"
                  >
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </Button>
                </form>
              )}
            </section>
          </div>

        </div>
      </div>
    </>
  )
}
