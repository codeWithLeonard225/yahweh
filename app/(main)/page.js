// app/(main)/page.js

import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Yahweh Academy International | Integrity, Excellence & Leadership",
  description:
    "Yahweh Academy International provides quality education, academic excellence, discipline, technology, and leadership development for students in Sierra Leone.",
};

export default function HomePage() {
  return (
    <div className="homepage-content bg-white">

      {/* =====================================================
          1. HERO SECTION
      ====================================================== */}
      <section className="relative min-h-[85vh] flex items-center text-white overflow-hidden">

        {/* Background */}
        <Image
          src="/images/yahweh-academy-bg.jpg"
          alt="Yahweh Academy International"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Dark Navy Overlay */}
        <div className="absolute inset-0 bg-[#071A4D]/75"></div>

        {/* Gold Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A4D]/95 via-[#071A4D]/70 to-transparent"></div>

        {/* Hero Content */}
        <div className="relative z-10 w-full px-6 py-20">
          <div className="max-w-6xl mx-auto">

            <div className="max-w-3xl">

              {/* School Logo */}
              <div className="mb-8">
                <Image
                  src="/icons/yahweh-academy-192x192.png"
                  alt="Yahweh Academy International Logo"
                  width={120}
                  height={120}
                  className="rounded-full bg-white p-2 shadow-2xl"
                />
              </div>

              {/* Small Heading */}
              <p className="uppercase tracking-[0.3em] text-[#F4C542] font-semibold text-sm mb-4">
                Yahweh Academy International
              </p>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                Integrity.
                <br />
                Excellence.
                <br />
                <span className="text-[#F4C542]">
                  Leadership.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mb-8">
                Empowering students through quality education, strong
                character, modern knowledge, and the skills needed to
                become responsible leaders of tomorrow.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">

                <Link
                  href="/admissions"
                  className="inline-flex justify-center items-center bg-[#F4C542] hover:bg-[#dcae22] text-[#071A4D] font-bold px-8 py-4 rounded-lg shadow-xl transition duration-300"
                >
                  Apply for Admission
                </Link>

                <Link
                  href="/about"
                  className="inline-flex justify-center items-center border-2 border-white hover:bg-white hover:text-[#071A4D] text-white font-semibold px-8 py-4 rounded-lg transition duration-300"
                >
                  Discover Our School
                </Link>

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          SCHOOL VALUES STRIP
      ====================================================== */}
      <section className="bg-[#F4C542] text-[#071A4D]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3">

          <div className="p-7 text-center border-b md:border-b-0 md:border-r border-[#071A4D]/20">
            <h3 className="text-2xl font-bold">
              Integrity
            </h3>
            <p className="mt-2 text-sm">
              Building honesty, responsibility and strong character.
            </p>
          </div>

          <div className="p-7 text-center border-b md:border-b-0 md:border-r border-[#071A4D]/20">
            <h3 className="text-2xl font-bold">
              Excellence
            </h3>
            <p className="mt-2 text-sm">
              Encouraging students to pursue their highest potential.
            </p>
          </div>

          <div className="p-7 text-center">
            <h3 className="text-2xl font-bold">
              Leadership
            </h3>
            <p className="mt-2 text-sm">
              Preparing responsible leaders for tomorrow's world.
            </p>
          </div>

        </div>
      </section>


      {/* =====================================================
          2. PRINCIPAL'S MESSAGE
      ====================================================== */}
      <section className="py-20 bg-white">

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Principal Image */}
          <div className="relative">

            <div className="absolute -top-5 -left-5 w-24 h-24 bg-[#F4C542] rounded-lg -z-0"></div>

            <Image
              src="/images/principal.jpg"
              alt="Principal of Yahweh Academy International"
              width={500}
              height={550}
              className="relative z-10 w-full max-w-md mx-auto h-[500px] object-cover rounded-2xl shadow-2xl"
            />

            <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-[#071A4D] rounded-lg -z-0"></div>

          </div>


          {/* Message */}
          <div>

            <p className="text-[#F4B400] font-bold uppercase tracking-widest text-sm mb-3">
              Welcome to Our School
            </p>

            <h2 className="text-4xl font-bold text-[#071A4D] mb-6">
              Message from the Proprietor
            </h2>

            <div className="w-20 h-1 bg-[#F4C542] mb-7"></div>

            <p className="text-gray-700 leading-relaxed mb-5">
              Welcome to <strong>Yahweh Academy International</strong>, a
              community committed to providing quality education and
              developing students who are confident, disciplined,
              knowledgeable, and prepared to make a positive difference
              in society.
            </p>

            <p className="text-gray-700 leading-relaxed mb-5">
              At Yahweh Academy International, we believe that education
              goes beyond the classroom. We focus on academic achievement,
              character development, creativity, technology, leadership,
              and the personal growth of every student.
            </p>

            <p className="text-gray-700 leading-relaxed">
              We welcome parents and guardians to partner with us as we
              guide our students toward a successful and meaningful future.
            </p>

            <p className="mt-7 font-bold text-[#071A4D]">
              — The Proprietor
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          3. WHY YAHWEH ACADEMY
      ====================================================== */}
      <section className="py-20 bg-slate-50">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">

            <p className="text-[#C99A00] font-bold uppercase tracking-widest text-sm mb-3">
              What We Stand For
            </p>

            <h2 className="text-4xl font-bold text-[#071A4D]">
              Why Yahweh Academy International?
            </h2>

            <p className="max-w-2xl mx-auto text-gray-600 mt-4">
              We provide an environment where students can learn,
              discover their abilities, build character, and prepare
              for the future.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">

            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border-t-4 border-[#F4C542]">

              <div className="w-14 h-14 rounded-xl bg-[#071A4D] text-[#F4C542] flex items-center justify-center text-2xl font-bold mb-6">
                01
              </div>

              <h3 className="text-xl font-bold text-[#071A4D] mb-3">
                Academic Excellence
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Strong academic programmes designed to help students
                achieve excellent results and develop a love for learning.
              </p>

            </div>


            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border-t-4 border-[#071A4D]">

              <div className="w-14 h-14 rounded-xl bg-[#F4C542] text-[#071A4D] flex items-center justify-center text-2xl font-bold mb-6">
                02
              </div>

              <h3 className="text-xl font-bold text-[#071A4D] mb-3">
                Character Building
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Developing responsible, respectful, disciplined and
                confident young people with strong values.
              </p>

            </div>


            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border-t-4 border-[#F4C542]">

              <div className="w-14 h-14 rounded-xl bg-[#071A4D] text-[#F4C542] flex items-center justify-center text-2xl font-bold mb-6">
                03
              </div>

              <h3 className="text-xl font-bold text-[#071A4D] mb-3">
                Technology
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Equipping students with digital skills and modern
                knowledge for an increasingly connected world.
              </p>

            </div>


            {/* Card 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border-t-4 border-[#071A4D]">

              <div className="w-14 h-14 rounded-xl bg-[#F4C542] text-[#071A4D] flex items-center justify-center text-2xl font-bold mb-6">
                04
              </div>

              <h3 className="text-xl font-bold text-[#071A4D] mb-3">
                Leadership
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Inspiring students to become confident thinkers,
                responsible citizens and future leaders.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          4. SCHOOL NEWS
      ====================================================== */}
      <section className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-6">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">

            <div>
              <p className="text-[#C99A00] font-bold uppercase tracking-widest text-sm mb-3">
                Stay Updated
              </p>

              <h2 className="text-4xl font-bold text-[#071A4D]">
                School News & Announcements
              </h2>
            </div>

            <Link
              href="/news"
              className="mt-5 md:mt-0 text-[#071A4D] font-bold hover:text-[#C99A00] transition"
            >
              View All News →
            </Link>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* News 1 */}
            <div className="group border border-gray-200 rounded-2xl p-7 hover:shadow-xl transition duration-300">

              <div className="flex items-center gap-3 mb-5">
                <span className="bg-[#071A4D] text-white text-xs font-bold px-4 py-2 rounded-full">
                  ADMISSIONS
                </span>

                <span className="text-gray-500 text-sm">
                  2026 Academic Year
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#071A4D] mb-3">
                Admissions Open
              </h3>

              <p className="text-gray-600 leading-relaxed mb-5">
                Applications are now open for students seeking admission
                to Yahweh Academy International.
              </p>

              <Link
                href="/admissions"
                className="font-bold text-[#C99A00] hover:text-[#071A4D]"
              >
                Learn More →
              </Link>

            </div>


            {/* News 2 */}
            <div className="group border border-gray-200 rounded-2xl p-7 hover:shadow-xl transition duration-300">

              <div className="flex items-center gap-3 mb-5">
                <span className="bg-[#F4C542] text-[#071A4D] text-xs font-bold px-4 py-2 rounded-full">
                  SCHOOL EVENT
                </span>

                <span className="text-gray-500 text-sm">
                  Announcement
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#071A4D] mb-3">
                Parent–Teacher Engagement
              </h3>

              <p className="text-gray-600 leading-relaxed mb-5">
                Parents and guardians are encouraged to work closely
                with the school to support student achievement and
                development.
              </p>

              <Link
                href="/calendar"
                className="font-bold text-[#C99A00] hover:text-[#071A4D]"
              >
                View Schedule →
              </Link>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          5. ACADEMIC EXCELLENCE SECTION
      ====================================================== */}
      <section className="relative py-24 overflow-hidden bg-[#071A4D] text-white">

        {/* Decorative Gold Circle */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F4C542]/10"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">

          <p className="text-[#F4C542] uppercase tracking-[0.25em] font-bold text-sm mb-5">
            Preparing Students for the Future
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-7">
            Education That Builds
            <span className="text-[#F4C542]"> Tomorrow's Leaders</span>
          </h2>

          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
            Our academic environment encourages critical thinking,
            creativity, discipline, collaboration and continuous
            improvement. We prepare students for examinations while
            developing the knowledge and skills they need beyond school.
          </p>

          <div className="mt-10">
            <Link
              href="/academics"
              className="inline-block bg-[#F4C542] hover:bg-[#dcae22] text-[#071A4D] font-bold px-8 py-4 rounded-lg transition duration-300"
            >
              Explore Our Academics
            </Link>
          </div>

        </div>
      </section>


      {/* =====================================================
          6. STUDENT & PARENT PORTAL
      ====================================================== */}
      <section className="py-20 bg-slate-100">

        <div className="max-w-6xl mx-auto px-6">

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* Left */}
              <div className="bg-[#071A4D] p-10 md:p-14 text-white">

                <p className="text-[#F4C542] font-bold uppercase tracking-widest text-sm mb-4">
                  Digital School
                </p>

                <h2 className="text-4xl font-bold mb-5">
                  Student & Parent Portal
                </h2>

                <p className="text-gray-300 leading-relaxed mb-8">
                  Access important school information online, including
                  academic results, timetables, fee records, attendance,
                  announcements and other school services.
                </p>

                <Link
                  href="/login"
                  className="inline-block bg-[#F4C542] hover:bg-[#dcae22] text-[#071A4D] font-bold px-8 py-4 rounded-lg transition duration-300"
                >
                  Login to Portal
                </Link>

              </div>


              {/* Right */}
              <div className="p-10 md:p-14">

                <h3 className="text-2xl font-bold text-[#071A4D] mb-7">
                  Portal Services
                </h3>

                <div className="space-y-5">

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#F4C542] rounded-lg flex items-center justify-center font-bold text-[#071A4D]">
                      ✓
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-800">
                        Academic Results
                      </h4>
                      <p className="text-gray-500 text-sm">
                        View student assessments and academic performance.
                      </p>
                    </div>
                  </div>


                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#F4C542] rounded-lg flex items-center justify-center font-bold text-[#071A4D]">
                      ✓
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-800">
                        Attendance
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Monitor attendance and student participation.
                      </p>
                    </div>
                  </div>


                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#F4C542] rounded-lg flex items-center justify-center font-bold text-[#071A4D]">
                      ✓
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-800">
                        School Announcements
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Stay informed about important school activities.
                      </p>
                    </div>
                  </div>


                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#F4C542] rounded-lg flex items-center justify-center font-bold text-[#071A4D]">
                      ✓
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-800">
                        Fees & Records
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Access school fee information and related records.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          7. FINAL CALL TO ACTION
      ====================================================== */}
      <section className="py-16 bg-[#F4C542] text-[#071A4D] text-center">

        <div className="max-w-4xl mx-auto px-6">

          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Integrity + Excellence = Leadership
          </h2>

          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join Yahweh Academy International and give your child an
            environment where knowledge, character and leadership can grow.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Link
              href="/admissions"
              className="bg-[#071A4D] hover:bg-[#0d286b] text-white font-bold px-8 py-4 rounded-lg transition duration-300"
            >
              Start Admission
            </Link>

            <Link
              href="/contact"
              className="bg-white hover:bg-gray-100 text-[#071A4D] font-bold px-8 py-4 rounded-lg transition duration-300"
            >
              Contact School
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}