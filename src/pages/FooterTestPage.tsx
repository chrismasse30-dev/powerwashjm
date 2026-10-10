const FooterTestPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8">
        <h1 className="text-5xl font-bold text-center">Footer Design Test Page</h1>
      </div>

      <footer className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-10 mb-12 text-center">
            <h3 className="text-3xl font-bold mb-4 tracking-wide">Sign Up For Our Latest Specials</h3>
            <p className="text-lg font-light tracking-wide text-blue-100 mb-6">
              Get exclusive offers and updates on our services delivered right to your inbox
            </p>
            <form className="flex gap-4 max-w-lg mx-auto flex-wrap justify-center" onSubmit={(e) => { e.preventDefault(); alert('Form submission disabled in test page'); }}>
              <input
                type="email"
                className="flex-1 min-w-[250px] px-6 py-4 border-2 border-white/20 rounded-lg text-base bg-white/95 transition-all focus:outline-none focus:border-blue-400 focus:bg-white text-gray-900"
                placeholder="Enter Your Email Address"
                required
              />
              <button
                type="submit"
                className="px-10 py-4 bg-blue-400 text-blue-900 border-none rounded-lg text-base font-semibold tracking-wider cursor-pointer transition-all uppercase hover:bg-blue-500 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(96,165,250,0.3)]"
              >
                Sign Up Now!
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="flex flex-col gap-4">
              <div className="text-2xl font-bold text-blue-400 mb-2">JM Power Washing</div>
              <p className="text-base font-light leading-relaxed tracking-wide text-blue-100 max-w-xs">
                Professional pressure washing and exterior cleaning services you can trust.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-xl transition-all hover:bg-blue-400 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(96,165,250,0.4)]" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-xl transition-all hover:bg-blue-400 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(96,165,250,0.4)]" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-xl transition-all hover:bg-blue-400 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(96,165,250,0.4)]" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 tracking-wide">Services</h3>
              <ul className="list-none space-y-3">
                <li><a href="#" className="text-blue-100 no-underline font-light text-base tracking-wide leading-relaxed inline-block transition-all hover:text-blue-400 hover:translate-x-1">House Washing</a></li>
                <li><a href="#" className="text-blue-100 no-underline font-light text-base tracking-wide leading-relaxed inline-block transition-all hover:text-blue-400 hover:translate-x-1">Roof Cleaning</a></li>
                <li><a href="#" className="text-blue-100 no-underline font-light text-base tracking-wide leading-relaxed inline-block transition-all hover:text-blue-400 hover:translate-x-1">Deck Cleaning</a></li>
                <li><a href="#" className="text-blue-100 no-underline font-light text-base tracking-wide leading-relaxed inline-block transition-all hover:text-blue-400 hover:translate-x-1">Gutter Cleaning</a></li>
                <li><a href="#" className="text-blue-100 no-underline font-light text-base tracking-wide leading-relaxed inline-block transition-all hover:text-blue-400 hover:translate-x-1">Concrete Cleaning</a></li>
                <li><a href="#" className="text-blue-100 no-underline font-light text-base tracking-wide leading-relaxed inline-block transition-all hover:text-blue-400 hover:translate-x-1">Holiday Lights Installation</a></li>
                <li><a href="#" className="text-blue-100 no-underline font-light text-base tracking-wide leading-relaxed inline-block transition-all hover:text-blue-400 hover:translate-x-1">Commercial Services</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 tracking-wide">Let's Connect</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 font-light text-base leading-relaxed tracking-wide text-blue-100">
                  <span className="text-blue-400 text-xl mt-0.5">📞</span>
                  <div>
                    <div><strong className="font-semibold text-white">Call us:</strong></div>
                    <div>(401) 338-6776</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 font-light text-base leading-relaxed tracking-wide text-blue-100">
                  <span className="text-blue-400 text-xl mt-0.5">✉️</span>
                  <div>
                    <div><strong className="font-semibold text-white">Email:</strong></div>
                    <div>sales@powerwashjm.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 font-light text-base leading-relaxed tracking-wide text-blue-100">
                  <span className="text-blue-400 text-xl mt-0.5">📍</span>
                  <div>
                    <div><strong className="font-semibold text-white">Service Area:</strong></div>
                    <div>Rhode Island & Surrounding Areas</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 tracking-wide">Our Hours</h3>
              <div className="flex flex-col gap-2">
                <div className="font-light text-base leading-relaxed tracking-wide text-blue-100">
                  <strong className="font-semibold text-white">Monday - Friday:</strong> 8:00 AM - 6:00 PM
                </div>
                <div className="font-light text-base leading-relaxed tracking-wide text-blue-100">
                  <strong className="font-semibold text-white">Saturday:</strong> 9:00 AM - 4:00 PM
                </div>
                <div className="font-light text-base leading-relaxed tracking-wide text-blue-100">
                  <strong className="font-semibold text-white">Sunday:</strong> Closed
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm font-light tracking-wide text-slate-300">
            <p>&copy; 2025 JM Power Washing. All rights reserved. | Professional Pressure Washing Services</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterTestPage;
