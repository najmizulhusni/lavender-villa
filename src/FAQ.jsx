import { useState } from 'react';
import { ChevronDown, Phone, Sparkles, Instagram } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const TikTokIcon = () => (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.67a2.4 2.4 0 1 1-2.4-2.4c.18 0 .37.02.56.07V9.41a7.26 7.26 0 0 0-1.25-.12A4.6 4.6 0 0 0 5 13.6a4.6 4.6 0 0 0 4.6 4.6 4.6 4.6 0 0 0 4.6-4.6V9.17a7.2 7.2 0 0 0 4.79 1.71v-3.19a4.8 4.8 0 0 1-.59-.05z" />
    </svg>
  );

  const LocationAnswer = () => (
    <div className="space-y-4">
      <p>Lavender Villa Melaka terletak di Bemban, Melaka. Alamat: 47, Jalan Anjung Lavender 1, Taman Anjung Gapam, 77200 Bemban, Melaka.</p>
      <div className="rounded-xl overflow-hidden h-64 border border-slate-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.5234567890123!2d102.3521975!3d2.2915775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d1e73e8455d413%3A0x3fd97fe2de23d790!2sLavender%20Villa%20Malacca!5e0!3m2!1sen!2smy!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );

  const faqs = [
    {
      q: 'Di mana lokasi Lavender Villa Melaka?',
      a: null,
      component: <LocationAnswer />
    },
    {
      q: 'Berapa harga penginapan?',
      a: 'RM1,500 untuk malam minggu (Isnin-Khamis) dan RM1,800 untuk malam hujung minggu (Jumaat-Ahad). Harga ini untuk keseluruhan villa.'
    },
    {
      q: 'Berapa bilik tidur ada?',
      a: 'Villa mempunyai 5 bilik tidur yang luas dengan 4 bilik air. Ia boleh menampung hingga 20 tetamu.'
    },
    {
      q: 'Adakah kolam renang?',
      a: 'Ya, kami mempunyai kolam renang berukuran 30x12x4 kaki yang sempurna untuk keluarga.'
    },
    {
      q: 'Apakah yang disediakan di villa?',
      a: 'WiFi 300Mbps, TV pintar 65" dengan Astro/Netflix/Disney+, dapur lengkap, penghawa dingin di semua bilik, kolam renang, kawasan bermain kanak-kanak, dan tempat letak kereta percuma.'
    },
    {
      q: 'Bagaimana cara membuat tempahan?',
      a: 'Gunakan borang tempahan di laman web kami. Pilih tarikh, bilangan tetamu, dan hantar. Kami akan menghubungi anda melalui WhatsApp untuk mengesahkan.'
    },
    {
      q: 'Adakah deposit diperlukan?',
      a: 'Ya, deposit sebanyak 50% diperlukan untuk mengesahkan tempahan. Baki pembayaran perlu diselesaikan 7 hari sebelum ketibaan.'
    },
    {
      q: 'Apakah waktu check-in dan check-out?',
      a: 'Check-in: 3 petang | Check-out: 11 pagi. Waktu lain boleh disesuaikan dengan menghubungi kami.'
    },

    {
      q: 'Bagaimana cara menghubungi kami?',
      a: 'Hubungi kami melalui WhatsApp di +60 19 334 5686 atau telefon di nombor yang sama. Kami juga di Instagram @lavendervillamelaka.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-2 sm:top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-2 sm:px-4">
        <div className="bg-white/5 backdrop-blur-2xl rounded-full px-3 sm:px-6 md:px-8 py-2 sm:py-3 shadow-2xl border border-white/20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-1 sm:gap-2 cursor-pointer transition flex-shrink-0 group">
            <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900 tracking-tight hidden sm:inline">Lavender Villa Melaka</span>
          </a>
          <a href="/" className="text-slate-700 transition font-semibold cursor-pointer text-xs sm:text-sm md:text-base whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/30">Kembali</a>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 py-12 sm:py-20 pt-20 sm:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900">Soalan Lazim & Jawapan</h1>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-8 sm:py-16">
        <div className="space-y-3">
          {faqs.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <h3 className="font-bold text-slate-900 text-sm sm:text-lg pr-3 sm:pr-4">{item.q}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-purple-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50">
                  {item.component ? (
                    <div className="text-slate-700 text-xs sm:text-base leading-relaxed">{item.component}</div>
                  ) : (
                    <p className="text-slate-700 text-xs sm:text-base leading-relaxed">{item.a}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-2xl p-6 sm:p-10 border border-purple-200 shadow-md">
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">Masih ada soalan?</h2>
          <p className="text-slate-600 text-xs sm:text-base mb-4 sm:mb-6">Hubungi kami melalui WhatsApp atau telefon. Kami sedia membantu 24/7.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <a href="https://wa.me/60193345686" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base hover:shadow-lg transition flex items-center justify-center gap-2">
              <Phone className="w-4 sm:w-5 h-4 sm:h-5" />
              WhatsApp
            </a>
            <a href="tel:+60193345686" className="bg-white text-slate-900 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base hover:bg-slate-50 transition border border-slate-200 flex items-center justify-center gap-2">
              <Phone className="w-4 sm:w-5 h-4 sm:h-5" />
              Telefon
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">Lavender Villa Melaka</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Tempat penginapan keluarga terbaik di villa Bemban, Melaka</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/" className="hover:text-purple-400 transition">Pengalaman</a></li>
                <li><a href="/" className="hover:text-purple-400 transition">Ruang</a></li>
                <li><a href="/" className="hover:text-purple-400 transition">Tempah Sekarang</a></li>
                <li><a href="/faq" className="hover:text-purple-400 transition">FAQ</a></li>
                <li><a href="/admin" className="hover:text-purple-400 transition">Admin</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-white">Hubungi</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="tel:+60193345686" className="hover:text-purple-400 transition">+60 19 334 5686</a></li>
                <li><a href="https://wasap.my/60193345686/PPHMLVM" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">WhatsApp</a></li>
                <li className="text-xs">Bemban, Melaka</li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold mb-4 text-white">Ikuti Kami</h4>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/lavendervillamelaka" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-400 transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@lavendervillamelaka" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-400 transition">
                  <TikTokIcon />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-slate-500 text-sm">© 2025 Lavender Villa Melaka. Semua hak terpelihara. Penginapan Muslim Sahaja.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button - Liquid Glass Effect */}
      <a
        href="https://wa.me/60193345686?text=Hai%2C%20saya%20ingin%20bertanya%20tentang%20Lavender%20Villa%20Melaka"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 group"
      >
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 whitespace-nowrap">
            <p className="text-slate-800 text-sm font-medium">Perlukan bantuan?</p>
            <p className="text-slate-500 text-xs">Chat dengan kami di WhatsApp</p>
          </div>
          <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white/90 rotate-45 border-r border-b border-white/50"></div>
        </div>
        
        {/* Button with liquid glass effect */}
        <div className="relative">
          {/* Pulse animation ring */}
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
          
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
          
          {/* Main button - liquid glass */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:shadow-green-500/50 group-hover:shadow-2xl">
            {/* Glass overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent"></div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>
            
            {/* WhatsApp Icon */}
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}
