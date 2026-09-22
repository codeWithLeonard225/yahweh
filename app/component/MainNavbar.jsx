"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MainNavbar() {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-slate-200 shadow-sm fixed top-0 left-0 z-50 overflow-x-hidden">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">

        {/* =====================================================
            BRAND
        ====================================================== */}
        <Link
          href="/"
          className="flex items-center gap-3 min-w-0"
          onClick={() => setOpen(false)}
        >

          {/* LOGO */}
          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
            <Image
              src="/icons/yahweh-academy-192x192.png"
              alt="Yahweh Academy International Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 40px, 48px"
            />
          </div>

          {/* SCHOOL NAME */}
          <div className="min-w-0">

            {/* Desktop */}
            <div className="hidden md:block">
              <span className="block text-[#071A4D] font-extrabold text-xl lg:text-2xl leading-tight tracking-tight">
                Yahweh Academy
              </span>

              <span className="block text-[#B88A00] text-xs lg:text-sm font-semibold tracking-[0.12em] uppercase">
                International
              </span>
            </div>

            {/* Mobile */}
            <span className="block md:hidden text-[#071A4D] font-extrabold text-base leading-tight truncate">
              Yahweh Academy
            </span>

          </div>
        </Link>


        {/* =====================================================
            DESKTOP MENU
        ====================================================== */}
        <div className="hidden md:flex items-center gap-7 text-sm lg:text-base font-medium text-slate-700">

          <Link
            href="/"
            className="hover:text-[#071A4D] transition duration-200"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="hover:text-[#071A4D] transition duration-200"
          >
            About Us
          </Link>

          <Link
            href="/service"
            className="hover:text-[#071A4D] transition duration-200"
          >
            Services
          </Link>

          <Link
            href="/gallery"
            className="hover:text-[#071A4D] transition duration-200"
          >
            Gallery
          </Link>

          <Link
            href="/contact"
            className="hover:text-[#071A4D] transition duration-200"
          >
            Contact
          </Link>


          {/* PORTAL BUTTON */}
          <Link
            href="/login"
            className="
              px-5 py-2.5
              text-sm
              font-bold
              text-white
              bg-[#071A4D]
              hover:bg-[#0d286b]
              rounded-lg
              transition
              duration-300
              shadow-md
              hover:shadow-lg
            "
          >
            Login
          </Link>

        </div>


        {/* =====================================================
            MOBILE MENU BUTTON
        ====================================================== */}
        <button
          onClick={() => setOpen(!open)}
          className="
            md:hidden
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-lg
            bg-[#071A4D]
            text-[#F4C542]
            text-xl
            shadow-sm
            focus:outline-none
          "
          aria-label="Toggle Menu"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>

      </div>


      {/* =====================================================
          MOBILE MENU
      ====================================================== */}
      {isMounted && open && (
        <div
          className="
            md:hidden
            bg-white
            border-t
            border-slate-200
            shadow-xl
            px-5
            py-5
          "
        >

          <div className="space-y-1">

            <Link
              href="/"
              className="
                block
                px-4
                py-3
                rounded-lg
                text-slate-700
                font-medium
                hover:bg-slate-50
                hover:text-[#071A4D]
                transition
              "
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/about"
              className="
                block
                px-4
                py-3
                rounded-lg
                text-slate-700
                font-medium
                hover:bg-slate-50
                hover:text-[#071A4D]
                transition
              "
              onClick={() => setOpen(false)}
            >
              About Us
            </Link>

            <Link
              href="/service"
              className="
                block
                px-4
                py-3
                rounded-lg
                text-slate-700
                font-medium
                hover:bg-slate-50
                hover:text-[#071A4D]
                transition
              "
              onClick={() => setOpen(false)}
            >
              Services
            </Link>

            <Link
              href="/gallery"
              className="
                block
                px-4
                py-3
                rounded-lg
                text-slate-700
                font-medium
                hover:bg-slate-50
                hover:text-[#071A4D]
                transition
              "
              onClick={() => setOpen(false)}
            >
              Gallery
            </Link>

            <Link
              href="/contact"
              className="
                block
                px-4
                py-3
                rounded-lg
                text-slate-700
                font-medium
                hover:bg-slate-50
                hover:text-[#071A4D]
                transition
              "
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>

          </div>


          {/* MOBILE PORTAL */}
          <div className="mt-4 pt-4 border-t border-slate-100">

            <Link
              href="/login"
              className="
                block
                w-full
                text-center
                px-5
                py-3
                bg-[#071A4D]
                hover:bg-[#0d286b]
                text-white
                font-bold
                rounded-lg
                shadow-md
                transition
                duration-300
              "
              onClick={() => setOpen(false)}
            >
              Login
            </Link>

          </div>

        </div>
      )}

    </nav>
  );
}