import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Instagram, 
  MessageCircle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles 
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'product_suggestion',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'How does shopping through PriyaFindz work?',
      a: 'PriyaFindz is an affiliate fashion curation platform. When you click "Shop on Meesho" or "Shop on Myntra", we seamlessly redirect you to the merchant’s official application or website where you complete payment and enter shipping details. No markup is ever added!'
    },
    {
      q: 'Can I return or exchange items purchased through your links?',
      a: 'Yes, absolutely! Since orders are placed directly on destination merchants (Meesho, Myntra, Amazon, etc.), their respective 7-day or 14-day hassle-free return and exchange policies apply fully to your order.'
    },
    {
      q: 'How frequently is the Google Sheets product catalog updated?',
      a: 'Our product team updates the Google Spreadsheet multiple times each week with viral Instagram fashion trends, festive drops, and price drops.'
    },
    {
      q: 'Are the prices shown guaranteed?',
      a: 'Product prices in our catalog reflect current merchant promotions and flash deals. E-commerce platforms like Meesho and Myntra dynamically change pricing based on ongoing sale events (e.g. Maha Indian Savings Sale, End of Reason Sale).'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#743D4A]">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#743D4A]">
          We'd Love to Hear From You
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Have a fashion piece you want Priya to find on Meesho? Want to collaborate or report a broken affiliate link? Drop us a note!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E4DC] shadow-sm">
          {submitted ? (
            <div className="text-center py-10 space-y-3 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#743D4A]">
                Message Sent!
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Thank you for reaching out, {formData.name}. Priya or a member of our editorial team will reply to {formData.email} within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'product_suggestion', message: '' });
                }}
                className="mt-4 bg-[#743D4A] text-white text-xs font-bold py-2 px-5 rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-[#743D4A] mb-1">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Pooja Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FFF9F4] border border-[#E9B8BD] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1E1F] focus:border-[#743D4A] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-[#743D4A] mb-1">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="pooja@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FFF9F4] border border-[#E9B8BD] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1E1F] focus:border-[#743D4A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-[#743D4A] mb-1">
                  Topic of Inquiry
                </label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#FFF9F4] border border-[#E9B8BD] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1E1F] font-medium focus:border-[#743D4A] outline-none"
                >
                  <option value="product_suggestion">Suggest a Trendy Find or Meesho Code</option>
                  <option value="brand_collab">Brand Collaboration / PR Gifting</option>
                  <option value="affiliate_query">Affiliate Partnership / Query</option>
                  <option value="broken_link">Report Broken Product / Out of Stock Link</option>
                  <option value="other">General Feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-[#743D4A] mb-1">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Share details, product URLs, or collaboration thoughts..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#FFF9F4] border border-[#E9B8BD] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1E1F] focus:border-[#743D4A] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#743D4A] hover:bg-[#5E2F3B] text-white text-xs sm:text-sm font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>

        {/* Social & Community Channels */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#FFFDFB] rounded-3xl p-6 border border-[#F0E4DC] space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#743D4A]">
              Join Our Deal Community
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We drop flash deal alerts, limited coupon codes, and midnight Meesho finds directly in our community groups before posting on Instagram:
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#F0E4DC] hover:border-[#E9B8BD] transition-all hover:bg-[#FFF9F4]"
              >
                <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#2D1E1F] block">Instagram</span>
                  <span className="text-[11px] text-stone-500">@priya_findz (250K+ followers)</span>
                </div>
              </a>

              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#F0E4DC] hover:border-[#E9B8BD] transition-all hover:bg-[#FFF9F4]"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#2D1E1F] block">Telegram Deals Channel</span>
                  <span className="text-[11px] text-stone-500">Instant price drop alerts</span>
                </div>
              </a>

              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#F0E4DC] hover:border-[#E9B8BD] transition-all hover:bg-[#FFF9F4]"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#2D1E1F] block">WhatsApp Broadcast</span>
                  <span className="text-[11px] text-stone-500">Daily top 5 picks digest</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#743D4A]">
            Questions Answered
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#2D1E1F] mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#F0E4DC] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-[#2D1E1F] hover:text-[#743D4A] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#743D4A]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-stone-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-[#F0E4DC]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
