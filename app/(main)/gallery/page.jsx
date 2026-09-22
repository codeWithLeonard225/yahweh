"use client";

import { useState } from "react";
import Image from "next/image";

const galleryItems = [
  {
    type: "image",
    src: "/images/sports1.jpg",
    alt: "Inter-House Sports at Yahweh Academy International",
    category: "Sports",
    title: "Inter-House Sports Meet",
    description:
      "Students demonstrating athletic ability, teamwork, discipline, and sportsmanship during our inter-house sporting activities.",
  },

  {
    type: "video",
    src: "/videos/fieldtrip.mp4",
    alt: "Educational field trip",
    category: "Field Trips",
    title: "Educational Field Trip",
    description:
      "Students exploring new environments and gaining practical knowledge through educational trips and learning experiences outside the classroom.",
  },
  {
    type: "image",
    src: "/images/debate1.jpg",
    alt: "Debate competition at Yahweh Academy International",
    category: "Debates",
    title: "Inter-School Debate Championship",
    description:
      "Our students developing communication, public speaking, critical thinking, and confidence through competitive debate.",
  },
  {
    type: "video",
    src: "/videos/debate.mp4",
    alt: "Debate highlights",
    category: "Debates",
    title: "Debate League Highlights",
    description:
      "Highlights from student presentations, public speaking activities, and debate competitions.",
  },
  {
    type: "image",
    src: "/images/classroom.jpg",
    alt: "Students learning in the classroom",
    category: "Academics",
    title: "Learning in the Classroom",
    description:
      "A focused learning environment where students develop knowledge, skills, creativity, and confidence.",
  },
  {
    type: "image",
    src: "/images/service-facilities.jpg",
    alt: "Modern learning facilities",
    category: "Facilities",
    title: "Modern Learning Facilities",
    description:
      "Our learning facilities provide students with supportive spaces for academic work, practical learning, and personal development.",
  },
];

const categories = [
  "All",
  "Academics",
  "Sports",
  "Field Trips",
  "Debates",
  "Facilities",
];

export default function GalleryClient() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [modalItem, setModalItem] = useState(null);

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter(
          (item) => item.category === activeCategory
        );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative bg-[#071A4D] py-20 md:py-24 px-6 overflow-hidden">

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F4C542]/10 rounded-full blur-3xl"></div>

        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center text-white">

          <p className="text-[#F4C542] uppercase tracking-[0.25em] font-bold text-sm mb-5">
            School Life
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-5">
            Yahweh Academy{" "}
            <span className="text-[#F4C542]">
              Gallery
            </span>
          </h1>

          <div className="w-20 h-1 bg-[#F4C542] mx-auto mb-7"></div>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Explore moments from academic activities, sports, debates,
            educational trips, student life, and other memorable experiences
            at Yahweh Academy International.
          </p>

        </div>
      </section>

      {/* =====================================================
          GALLERY INTRO
      ====================================================== */}
      <section className="bg-white py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">

          <p className="text-[#B88A00] uppercase tracking-widest font-bold text-sm mb-3">
            Our Memories
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-[#071A4D] mb-5">
            Life at Yahweh Academy International
          </h2>

          <div className="w-16 h-1 bg-[#F4C542] mx-auto mb-6"></div>

          <p className="text-gray-600 text-lg leading-relaxed">
            Our gallery captures the experiences that make school life
            meaningful — from classroom learning and academic activities
            to sports, competitions, educational trips, and student
            development.
          </p>

        </div>
      </section>

      {/* =====================================================
          CATEGORY FILTERS
      ====================================================== */}
      <section className="bg-white px-6 pb-12">

        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[#071A4D] text-[#F4C542] shadow-lg"
                  : "bg-slate-50 text-[#071A4D] border border-slate-200 hover:bg-[#071A4D] hover:text-white hover:border-[#071A4D]"
              }`}
            >
              {cat}
            </button>
          ))}

        </div>

      </section>

      {/* =====================================================
          GALLERY GRID
      ====================================================== */}
      <section className="px-6 pb-20">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

          {filteredItems.map((item, index) => (

            <div
              key={`${item.title}-${index}`}
              className="group bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => setModalItem(item)}
            >

              {/* MEDIA */}
              <div className="relative overflow-hidden">

                {item.type === "image" ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={700}
                    height={450}
                    className="object-cover w-full h-64 md:h-72 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="relative">

                    <video
                      src={item.src}
                      className="w-full h-64 md:h-72 object-cover"
                      muted
                      loop
                      playsInline
                    />

                    {/* Video Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                      <div className="w-14 h-14 rounded-full bg-[#071A4D]/90 text-[#F4C542] flex items-center justify-center text-xl shadow-lg">
                        ▶
                      </div>

                    </div>

                  </div>
                )}

                {/* Category */}
                <span className="absolute top-4 right-4 bg-[#071A4D]/90 text-[#F4C542] text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {item.category}
                </span>

              </div>

              {/* CONTENT */}
              <div className="p-6">

                <h3 className="text-xl font-bold text-[#071A4D] mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  {item.description}
                </p>

                <div className="flex items-center text-[#B88A00] font-bold text-sm">
                  View {item.type === "video" ? "Video" : "Photo"}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>

              </div>

            </div>

          ))}

        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="max-w-xl mx-auto text-center py-16">

            <div className="text-5xl mb-5">
              📷
            </div>

            <h3 className="text-2xl font-bold text-[#071A4D] mb-3">
              No Gallery Items Yet
            </h3>

            <p className="text-gray-600">
              There are currently no items available in this category.
            </p>

          </div>
        )}

      </section>

      {/* =====================================================
          MOTTO SECTION
      ====================================================== */}
      <section className="bg-[#F4C542] text-[#071A4D] py-14 px-6 text-center">

        <div className="max-w-4xl mx-auto">

          <p className="uppercase tracking-[0.3em] font-bold text-sm mb-4">
            Our Motto
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold">
            Integrity + Excellence = Leadership
          </h2>

        </div>

      </section>

      {/* =====================================================
          MODAL
      ====================================================== */}
      {modalItem && (

        <div
          className="fixed inset-0 bg-[#071A4D]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setModalItem(null)}
        >

          <div
            className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE BUTTON */}
            <div className="relative">

              {modalItem.type === "image" ? (
                <Image
                  src={modalItem.src}
                  alt={modalItem.alt}
                  width={1200}
                  height={700}
                  className="object-cover w-full max-h-[550px]"
                />
              ) : (
                <video
                  src={modalItem.src}
                  className="w-full max-h-[550px] object-contain bg-black"
                  controls
                  autoPlay
                />
              )}

              <button
                onClick={() => setModalItem(null)}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-[#071A4D]/90 text-white hover:bg-[#F4C542] hover:text-[#071A4D] flex items-center justify-center text-xl font-bold transition duration-300"
                aria-label="Close gallery item"
              >
                ✕
              </button>

            </div>

            {/* MODAL CONTENT */}
            <div className="p-7 md:p-8 text-center">

              <span className="inline-block bg-[#F4C542] text-[#071A4D] text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                {modalItem.category}
              </span>

              <h3 className="text-2xl md:text-3xl font-bold text-[#071A4D] mb-3">
                {modalItem.title}
              </h3>

              <div className="w-12 h-1 bg-[#F4C542] mx-auto mb-5"></div>

              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {modalItem.description}
              </p>

              <button
                onClick={() => setModalItem(null)}
                className="mt-7 px-8 py-3 bg-[#071A4D] text-[#F4C542] font-bold rounded-lg hover:bg-[#0d286b] transition duration-300 shadow-md"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}