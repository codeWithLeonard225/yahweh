import Link from "next/link";

export const metadata = {
  title: "Contact Us | Yahweh Academy International",
  description:
    "Contact Yahweh Academy International for admissions, school information, student support, and general inquiries in Sierra Leone.",
};

export default function ContactPage() {
  return (
    <div className="bg-white">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative bg-[#071A4D] py-20 md:py-24 px-6 overflow-hidden">

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F4C542]/10 rounded-full blur-3xl"></div>

        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center text-white">

          <p className="text-[#F4C542] uppercase tracking-[0.25em] font-bold text-sm mb-5">
            Get In Touch
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-5">
            Contact{" "}
            <span className="text-[#F4C542]">
              Yahweh Academy
            </span>
          </h1>

          <div className="w-20 h-1 bg-[#F4C542] mx-auto mb-7"></div>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We are here to answer your questions about admissions, academic
            programs, student support, and life at Yahweh Academy International.
          </p>

        </div>
      </section>

      {/* =====================================================
          CONTACT INFORMATION
      ====================================================== */}
      <section className="py-16 px-6 bg-white">

        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">

            {/* EMAIL */}
            <div className="group bg-slate-50 rounded-2xl p-8 text-center shadow-md border-t-4 border-[#F4C542] hover:shadow-xl hover:-translate-y-1 transition duration-300">

              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#071A4D] text-[#F4C542] flex items-center justify-center text-3xl">
                ✉
              </div>

              <h3 className="text-2xl font-bold text-[#071A4D] mb-3">
                Email Us
              </h3>

              <p className="text-gray-600 mb-4 leading-relaxed">
                For general questions, admissions, and school information:
              </p>

              {/* Replace with actual school email */}
              <span className="text-[#B88A00] font-bold">
                School email coming soon
              </span>

            </div>

            {/* PHONE */}
            <div className="group bg-[#071A4D] rounded-2xl p-8 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300">

              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#F4C542] text-[#071A4D] flex items-center justify-center text-3xl">
                ☎
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Call Us
              </h3>

              <p className="text-slate-300 mb-4 leading-relaxed">
                Speak with our administration during official school hours:
              </p>

              {/* Replace with actual school phone */}
              <span className="text-[#F4C542] font-bold">
                School phone number coming soon
              </span>

            </div>

            {/* OFFICE HOURS */}
            <div className="group bg-slate-50 rounded-2xl p-8 text-center shadow-md border-t-4 border-[#071A4D] hover:shadow-xl hover:-translate-y-1 transition duration-300">

              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#071A4D] text-[#F4C542] flex items-center justify-center text-3xl">
                ⏰
              </div>

              <h3 className="text-2xl font-bold text-[#071A4D] mb-3">
                Office Hours
              </h3>

              <div className="text-gray-600 space-y-2">
                <p>
                  <strong>Monday - Friday:</strong>
                  <br />
                  8:00 AM - 4:00 PM
                </p>

                <p>
                  <strong>Saturday & Sunday:</strong>
                  <br />
                  Closed
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTACT FORM + LOCATION
      ====================================================== */}
      <section className="py-20 px-6 bg-slate-50">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* =================================================
              CONTACT FORM
          ================================================== */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200">

            <div className="mb-8">

              <p className="text-[#B88A00] uppercase tracking-widest font-bold text-sm mb-3">
                Send Us a Message
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-[#071A4D] mb-4">
                How Can We Help?
              </h2>

              <div className="w-14 h-1 bg-[#F4C542]"></div>

            </div>

            <form className="space-y-5">

              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Full Name
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#071A4D] focus:ring-2 focus:ring-[#F4C542]/40 outline-none transition"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Email Address
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#071A4D] focus:ring-2 focus:ring-[#F4C542]/40 outline-none transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Phone Number
                </label>

                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#071A4D] focus:ring-2 focus:ring-[#F4C542]/40 outline-none transition"
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Subject
                </label>

                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue=""
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-lg bg-white text-gray-800 focus:border-[#071A4D] focus:ring-2 focus:ring-[#F4C542]/40 outline-none transition"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>

                  <option value="general">
                    General Inquiry
                  </option>

                  <option value="admissions">
                    Admissions & Enrollment
                  </option>

                  <option value="academics">
                    Academic Information
                  </option>

                  <option value="portal">
                    Student & Parent Portal Support
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Your Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Write your message here..."
                  required
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#071A4D] focus:ring-2 focus:ring-[#F4C542]/40 outline-none transition resize-none"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#071A4D] hover:bg-[#0d286b] text-white font-bold py-3.5 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
              >
                Send Message →
              </button>

            </form>

          </div>

          {/* =================================================
              LOCATION
          ================================================== */}
          <div className="space-y-8">

            {/* Location Card */}
            <div className="bg-[#071A4D] p-8 md:p-10 text-white rounded-3xl shadow-xl">

              <p className="text-[#F4C542] uppercase tracking-widest font-bold text-sm mb-3">
                Visit Our School
              </p>

              <h2 className="text-3xl font-bold mb-5">
                Our Location
              </h2>

              <div className="w-14 h-1 bg-[#F4C542] mb-6"></div>

              <div className="space-y-5">

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-white/10 text-[#F4C542] flex items-center justify-center text-xl">
                    📍
                  </div>

                  <div>
                    <p className="font-bold text-white mb-1">
                      School Address
                    </p>

                    <p className="text-slate-300 leading-relaxed">
                      Yahweh Academy International
                      <br />
                      Freetown, Sierra Leone
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-white/10 text-[#F4C542] flex items-center justify-center text-xl">
                    🏫
                  </div>

                  <div>
                    <p className="font-bold text-white mb-1">
                      School Office
                    </p>

                    <p className="text-slate-300">
                      Monday - Friday
                      <br />
                      8:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>

              </div>

              {/* Google Maps */}
              <Link
                href="https://www.google.com/maps/search/Freetown+Sierra+Leone"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center border-2 border-[#F4C542] text-[#F4C542] hover:bg-[#F4C542] hover:text-[#071A4D] font-bold px-6 py-3 rounded-lg transition duration-300"
              >
                View on Google Maps →
              </Link>

            </div>

            {/* Map */}
            <div className="relative h-96 w-full rounded-3xl shadow-xl overflow-hidden border border-slate-200 bg-slate-200">

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15783.564531980841!2d-13.2388!3d8.4844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xf04c38d3886f38d%3A0x67c0500e263c9b74!2sFreetown%2C%20Sierra%20Leone!5e0!3m2!1sen!2ssl!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Yahweh Academy International Location in Freetown"
              ></iframe>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="py-16 bg-[#F4C542] text-[#071A4D] text-center">

        <div className="max-w-4xl mx-auto px-6">

          <p className="uppercase tracking-[0.3em] font-bold text-sm mb-4">
            Yahweh Academy International
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-5">
            We&apos;re Ready to Hear From You
          </h2>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you are a parent, student, guardian, or visitor,
            our school community welcomes your questions and inquiries.
          </p>

        </div>

      </section>

    </div>
  );
}