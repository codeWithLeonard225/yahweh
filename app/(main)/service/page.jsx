// app/services/page.js

import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "School Services | Yahweh Academy International",
  description:
    "Explore the academic programs, student support, modern learning facilities, technology, extracurricular activities, and educational services offered by Yahweh Academy International.",
};

const serviceCategories = [
  {
    name: "Academic Programs",
    description:
      "Quality academic programs designed to build strong foundations, encourage critical thinking, and prepare students for future academic and professional opportunities.",
    icon: "📚",
    details: [
      "Junior Secondary School: Strong foundation in core subjects and essential learning skills.",
      "Senior Secondary School: Focused academic preparation for national examinations and higher education.",
      "Digital Literacy: Development of computer, research, and modern technology skills.",
      "Academic Support: Guidance and mentoring to help students improve their academic performance.",
    ],
    image: "/images/service-academics.jpg",
  },
  {
    name: "Student Support & Character Development",
    description:
      "We support the development of the whole student by combining academic guidance, personal development, discipline, responsibility, and positive character formation.",
    icon: "🌟",
    details: [
      "Guidance & Counseling: Academic, personal, and career guidance for students.",
      "Character Development: Encouraging integrity, responsibility, respect, and good conduct.",
      "Leadership Development: Opportunities for students to develop confidence and leadership skills.",
      "Student Welfare: A supportive environment that promotes student safety, well-being, and positive relationships.",
    ],
    image: "/images/service-support.jpg",
  },
  {
    name: "Modern Learning Facilities",
    description:
      "Learning spaces and resources designed to provide students with practical, engaging, and effective educational experiences.",
    icon: "💻",
    details: [
      "Computer Facilities: Practical computer training and digital learning opportunities.",
      "Science Laboratories: Practical learning experiences that support science and STEM education.",
      "Library & Resource Center: Educational books, reference materials, and spaces for independent study.",
      "Sports & Recreation: Opportunities for physical education, sports, teamwork, and healthy development.",
    ],
    image: "/images/service-facilities.jpg",
  },
  {
    name: "Technology & Digital Learning",
    description:
      "Technology is integrated into learning to help students develop the digital skills needed in today's rapidly changing world.",
    icon: "🖥️",
    details: [
      "Computer Education: Practical training in computer applications and digital skills.",
      "Digital Research: Students learn how to use technology responsibly for research and learning.",
      "Online Learning Resources: Access to modern educational resources and digital learning tools.",
      "Technology Awareness: Preparing students to use technology effectively, safely, and responsibly.",
    ],
    image: "/images/service-technology.jpg",
  },
  {
    name: "Extracurricular Activities",
    description:
      "Students are encouraged to participate in activities that develop creativity, teamwork, confidence, communication, and leadership beyond the classroom.",
    icon: "🏆",
    details: [
      "Sports Activities: Football and other physical activities that promote teamwork and fitness.",
      "Debate & Literary Activities: Opportunities to improve communication, public speaking, and critical thinking.",
      "Science & Technology Activities: Encouraging creativity, innovation, and problem-solving.",
      "Student Clubs: Activities that allow students to discover and develop their interests and talents.",
    ],
    image: "/images/service-extracurricular.jpg",
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-white">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative bg-[#071A4D] py-20 md:py-24 px-6 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#F4C542]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
          <p className="text-[#F4C542] uppercase tracking-[0.25em] font-bold text-sm mb-5">
            What We Offer
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            School Services &{" "}
            <span className="text-[#F4C542]">Programs</span>
          </h1>

          <div className="w-20 h-1 bg-[#F4C542] mx-auto mb-7"></div>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Yahweh Academy International provides a supportive learning
            environment focused on academic excellence, character development,
            technology, leadership, and the overall growth of every student.
          </p>
        </div>
      </section>

      {/* =====================================================
          INTRODUCTION
      ====================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[#B88A00] uppercase tracking-widest font-bold text-sm mb-3">
            Our Commitment
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-[#071A4D] mb-5">
            Supporting Students Inside and Outside the Classroom
          </h2>

          <div className="w-16 h-1 bg-[#F4C542] mx-auto mb-6"></div>

          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            Our programs and services are designed to give students the
            knowledge, skills, confidence, discipline, and opportunities they
            need to succeed academically and prepare for the future.
          </p>
        </div>
      </section>

      {/* =====================================================
          SERVICE CATEGORIES
      ====================================================== */}
      <section className="py-10 md:py-16 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-20">

          {serviceCategories.map((service, index) => (
            <div
              key={service.name}
              className="bg-white rounded-3xl shadow-lg overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">

                {/* IMAGE */}
                <div
                  className={`relative h-80 lg:h-[500px] ${
                    index % 2 !== 0 ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={`${service.name} at Yahweh Academy International`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071A4D]/70 via-transparent to-transparent"></div>

                  <div className="absolute bottom-6 left-6">
                    <div className="bg-[#F4C542] text-[#071A4D] w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      {service.icon}
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div
                  className={`p-8 md:p-10 lg:p-12 flex flex-col justify-center ${
                    index % 2 !== 0 ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <p className="text-[#B88A00] uppercase tracking-widest font-bold text-xs mb-3">
                    Service {String(index + 1).padStart(2, "0")}
                  </p>

                  <h2 className="text-3xl md:text-4xl font-bold text-[#071A4D] mb-5">
                    {service.name}
                  </h2>

                  <div className="w-14 h-1 bg-[#F4C542] mb-6"></div>

                  <p className="text-gray-600 text-lg leading-relaxed mb-7">
                    {service.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-4">
                    {service.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F4C542] text-[#071A4D] flex items-center justify-center font-bold text-sm mt-0.5">
                          ✓
                        </span>

                        <span className="leading-relaxed">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-[#071A4D] hover:bg-[#0d286b] text-white font-bold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                    >
                      Learn More
                      <span>→</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))}

        </div>
      </section>

      {/* =====================================================
          CORE VALUES STRIP
      ====================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-12">
            <p className="text-[#B88A00] uppercase tracking-widest font-bold text-sm mb-3">
              Our Foundation
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-[#071A4D]">
              Everything We Do Is Built Around
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">

            {/* Integrity */}
            <div className="bg-[#071A4D] text-white rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F4C542] text-[#071A4D] flex items-center justify-center text-2xl font-bold">
                I
              </div>

              <h3 className="text-2xl font-bold mb-3">
                Integrity
              </h3>

              <p className="text-slate-300 leading-relaxed">
                Encouraging honesty, responsibility, respect, and strong
                character in every aspect of student life.
              </p>
            </div>

            {/* Excellence */}
            <div className="bg-white border-t-4 border-[#F4C542] rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#071A4D] text-[#F4C542] flex items-center justify-center text-2xl font-bold">
                E
              </div>

              <h3 className="text-2xl font-bold text-[#071A4D] mb-3">
                Excellence
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Inspiring students to pursue high standards in academic
                performance, personal development, and future goals.
              </p>
            </div>

            {/* Leadership */}
            <div className="bg-[#071A4D] text-white rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F4C542] text-[#071A4D] flex items-center justify-center text-2xl font-bold">
                L
              </div>

              <h3 className="text-2xl font-bold mb-3">
                Leadership
              </h3>

              <p className="text-slate-300 leading-relaxed">
                Preparing students to become confident, responsible, and
                positive contributors to their communities.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          MOTTO
      ====================================================== */}
      <section className="py-16 bg-[#F4C542] text-[#071A4D] text-center">
        <div className="max-w-4xl mx-auto px-6">

          <p className="uppercase tracking-[0.3em] font-bold text-sm mb-4">
            Our Motto
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold">
            Integrity + Excellence = Leadership
          </h2>

          <p className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed">
            We believe that strong character, quality education, and
            responsible leadership provide the foundation for a successful
            future.
          </p>

        </div>
      </section>

      {/* =====================================================
          ADMISSIONS CTA
      ====================================================== */}
      <section className="bg-[#071A4D] py-20">
        <div className="max-w-4xl mx-auto text-center px-6">

          <p className="text-[#F4C542] uppercase tracking-widest font-bold text-sm mb-4">
            Join Our School Community
          </p>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5">
            Ready to Begin Your Child&apos;s Journey?
          </h2>

          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-9 leading-relaxed">
            Discover an educational environment where students are encouraged
            to learn, grow, develop character, and prepare for leadership.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Link
              href="/admissions"
              className="inline-flex justify-center items-center bg-[#F4C542] hover:bg-[#dcae22] text-[#071A4D] px-8 py-3.5 font-bold rounded-lg shadow-lg transition duration-300"
            >
              Start Your Application →
            </Link>

            <Link
              href="/contact"
              className="inline-flex justify-center items-center border-2 border-white hover:bg-white hover:text-[#071A4D] text-white px-8 py-3.5 font-bold rounded-lg transition duration-300"
            >
              Contact Us
            </Link>

          </div>

        </div>
      </section>

    </div>
  );
}