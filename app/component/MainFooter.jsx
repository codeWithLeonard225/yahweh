// app/components/MainFooter.js

import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Academics", href: "/academics" },
  { name: "Admissions", href: "/admissions" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/policy" },
  { name: "Terms of Use", href: "/terms" },
];

export default function MainFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#071A4D] text-white pt-14 pb-5 shadow-2xl mt-20">

      <div className="max-w-7xl mx-auto px-6">

        {/* =====================================================
            TOP SECTION
        ====================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10 pb-10">

          {/* =====================================================
              BRANDING
          ====================================================== */}
          <div className="sm:col-span-2 lg:col-span-1">

            <Link
              href="/"
              className="flex items-center gap-3 mb-5"
            >

              {/* LOGO */}
              <div className="relative w-14 h-14 flex-shrink-0 bg-white rounded-xl p-1">
                <Image
                  src="/icons/yahweh-academy-192x192.png"
                  alt="Yahweh Academy International Logo"
                  fill
                  className="object-contain rounded-lg"
                  sizes="56px"
                />
              </div>

              {/* NAME */}
              <div>
                <span className="block text-lg font-extrabold leading-tight">
                  Yahweh Academy
                </span>

                <span className="block text-[#F4C542] text-xs font-semibold tracking-[0.15em] uppercase mt-1">
                  International
                </span>
              </div>

            </Link>

            <p className="text-slate-300 text-sm leading-relaxed">
              Providing quality education, academic excellence,
              character development, and leadership opportunities
              for students in Sierra Leone.
            </p>

            {/* Motto */}
            <div className="mt-5 border-l-4 border-[#F4C542] pl-4">
              <p className="text-[#F4C542] font-bold text-sm">
                Integrity + Excellence = Leadership
              </p>
            </div>

          </div>


          {/* =====================================================
              QUICK LINKS
          ====================================================== */}
          <div>

            <h3 className="text-lg font-bold mb-5 text-[#F4C542]">
              Quick Links
            </h3>

            <ul className="space-y-3">

              {quickLinks.map((link) => (
                <li key={link.name}>

                  <Link
                    href={link.href}
                    className="
                      text-slate-300
                      hover:text-[#F4C542]
                      hover:translate-x-1
                      inline-block
                      transition
                      duration-200
                    "
                  >
                    {link.name}
                  </Link>

                </li>
              ))}

            </ul>

          </div>


          {/* =====================================================
              CONTACT INFORMATION
          ====================================================== */}
          <div>

            <h3 className="text-lg font-bold mb-5 text-[#F4C542]">
              Contact Us
            </h3>

            <address className="not-italic text-slate-300 space-y-4 text-sm">

              <p className="flex items-start gap-3">
                <span className="text-[#F4C542] text-lg">
                  📍
                </span>

                <span>
                  Freetown, Sierra Leone
                </span>
              </p>

              <p className="flex items-start gap-3">
                <span className="text-[#F4C542] text-lg">
                  📞
                </span>

                <span>
                  (+232) 76 XXX XXX
                </span>
              </p>

              <p className="flex items-start gap-3">
                <span className="text-[#F4C542] text-lg">
                  ✉
                </span>

                <span>
                  info@yahwehacademy.edu.sl
                </span>
              </p>

            </address>

          </div>


          {/* =====================================================
              SOCIAL MEDIA
          ====================================================== */}
          <div>

            <h3 className="text-lg font-bold mb-5 text-[#F4C542]">
              Follow Us
            </h3>

            <p className="text-slate-300 text-sm mb-5">
              Stay connected with Yahweh Academy International
              for school news, events, and announcements.
            </p>

            <div className="flex gap-3">

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="
                  w-10
                  h-10
                  rounded-lg
                  bg-white/10
                  flex
                  items-center
                  justify-center
                  text-lg
                  hover:bg-[#F4C542]
                  hover:text-[#071A4D]
                  transition
                  duration-300
                "
              >
                f
              </a>

              {/* Twitter / X */}
              <a
                href="#"
                aria-label="Twitter"
                className="
                  w-10
                  h-10
                  rounded-lg
                  bg-white/10
                  flex
                  items-center
                  justify-center
                  text-lg
                  font-bold
                  hover:bg-[#F4C542]
                  hover:text-[#071A4D]
                  transition
                  duration-300
                "
              >
                𝕏
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="
                  w-10
                  h-10
                  rounded-lg
                  bg-white/10
                  flex
                  items-center
                  justify-center
                  text-lg
                  hover:bg-[#F4C542]
                  hover:text-[#071A4D]
                  transition
                  duration-300
                "
              >
                ◎
              </a>

            </div>

          </div>

        </div>


        {/* =====================================================
            BOTTOM SECTION
        ====================================================== */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-5 text-sm">

          <p className="text-slate-400 text-center md:text-left">
            © {currentYear} Yahweh Academy International.
            All rights reserved.
          </p>


          <ul className="flex items-center gap-5 text-slate-400">

            {legalLinks.map((link) => (
              <li key={link.name}>

                <Link
                  href={link.href}
                  className="
                    hover:text-[#F4C542]
                    transition
                    duration-200
                  "
                >
                  {link.name}
                </Link>

              </li>
            ))}

          </ul>

        </div>

      </div>

    </footer>
  );
}