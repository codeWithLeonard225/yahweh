// app/about/page.js

import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us | Yahweh Academy International",
  description:
    "Learn about Yahweh Academy International and our commitment to academic excellence, character development, technology, discipline, and leadership in Sierra Leone.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="relative h-[55vh] min-h-[420px] flex items-center">

        <Image
          src="/images/about.jpg"
          alt="Yahweh Academy International"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#071A4D]/80"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 text-white">

          <p className="text-[#F4C542] uppercase tracking-[0.25em] font-bold text-sm mb-5">
            About Our School
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-5">
            Yahweh Academy
            <span className="text-[#F4C542]"> International</span>
          </h1>

          <div className="w-20 h-1 bg-[#F4C542] mx-auto mb-6"></div>

          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Building a generation of knowledgeable, disciplined,
            responsible, and confident young leaders through quality
            education and character development.
          </p>

        </div>
      </section>


      {/* =====================================================
          WHO WE ARE
      ====================================================== */}
      <section className="py-20 bg-white">

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">

          {/* Text */}
          <div>

            <p className="text-[#B88A00] uppercase tracking-widest font-bold text-sm mb-3">
              Who We Are
            </p>

            <h2 className="text-4xl font-bold text-[#071A4D] mb-6">
              Education With Purpose
            </h2>

            <div className="w-16 h-1 bg-[#F4C542] mb-7"></div>

            <p className="text-gray-700 leading-relaxed mb-5">
              <strong>Yahweh Academy International</strong> is an
              educational institution committed to providing quality
              education in a supportive, disciplined, and inspiring
              environment.
            </p>

            <p className="text-gray-700 leading-relaxed mb-5">
              We believe that true education goes beyond examination
              results. Our approach focuses on developing the whole
              student by combining academic learning, character
              development, creativity, digital literacy, and leadership.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Our goal is to help students discover their potential,
              develop confidence, and acquire the knowledge and skills
              required to contribute positively to their families,
              communities, and society.
            </p>

          </div>


          {/* Image */}
          <div className="relative">

            <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#F4C542] rounded-xl"></div>

            <Image
              src="/images/classroom.jpg"
              alt="Yahweh Academy International Classroom"
              width={600}
              height={450}
              className="relative z-10 w-full h-[420px] object-cover rounded-2xl shadow-2xl"
            />

            <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-[#071A4D] rounded-xl"></div>

          </div>

        </div>
      </section>


      {/* =====================================================
          VISION & MISSION
      ====================================================== */}
      <section className="py-20 bg-slate-50">

        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-12">

            <p className="text-[#B88A00] uppercase tracking-widest font-bold text-sm mb-3">
              Our Direction
            </p>

            <h2 className="text-4xl font-bold text-[#071A4D]">
              Vision & Mission
            </h2>

          </div>


          <div className="grid md:grid-cols-2 gap-8">

            {/* Vision */}
            <div className="bg-[#071A4D] text-white p-9 rounded-2xl shadow-xl">

              <div className="w-14 h-14 bg-[#F4C542] text-[#071A4D] rounded-xl flex items-center justify-center text-2xl font-bold mb-6">
                V
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Our Vision
              </h3>

              <p className="text-slate-300 leading-relaxed">
                To become an institution recognized for developing
                academically successful, morally responsible,
                technologically capable, and confident young people
                who are prepared to make meaningful contributions
                to society.
              </p>

            </div>


            {/* Mission */}
            <div className="bg-white p-9 rounded-2xl shadow-xl border-t-4 border-[#F4C542]">

              <div className="w-14 h-14 bg-[#071A4D] text-[#F4C542] rounded-xl flex items-center justify-center text-2xl font-bold mb-6">
                M
              </div>

              <h3 className="text-2xl font-bold text-[#071A4D] mb-4">
                Our Mission
              </h3>

              <p className="text-gray-600 leading-relaxed">
                To provide a safe, supportive, and technology-aware
                learning environment where students receive quality
                education, develop strong character, discover their
                talents, and gain the knowledge and skills necessary
                for lifelong success.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          CORE VALUES
      ====================================================== */}
      <section className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">

            <p className="text-[#B88A00] uppercase tracking-widest font-bold text-sm mb-3">
              What Guides Us
            </p>

            <h2 className="text-4xl font-bold text-[#071A4D]">
              Our Core Values
            </h2>

            <p className="max-w-2xl mx-auto text-gray-600 mt-4">
              The principles that shape our school community and guide
              the development of every student.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">

            {/* Integrity */}
            <div className="bg-[#071A4D] text-white p-8 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition duration-300">

              <div className="text-[#F4C542] text-3xl font-bold mb-5">
                01
              </div>

              <h3 className="text-xl font-bold mb-3">
                Integrity
              </h3>

              <p className="text-slate-300 leading-relaxed">
                Encouraging honesty, responsibility, trustworthiness,
                and doing what is right.
              </p>

            </div>


            {/* Excellence */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#F4C542] hover:-translate-y-1 hover:shadow-xl transition duration-300">

              <div className="text-[#B88A00] text-3xl font-bold mb-5">
                02
              </div>

              <h3 className="text-xl font-bold text-[#071A4D] mb-3">
                Excellence
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Inspiring students and staff to continuously pursue
                high standards in learning and personal development.
              </p>

            </div>


            {/* Discipline */}
            <div className="bg-[#071A4D] text-white p-8 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition duration-300">

              <div className="text-[#F4C542] text-3xl font-bold mb-5">
                03
              </div>

              <h3 className="text-xl font-bold mb-3">
                Discipline
              </h3>

              <p className="text-slate-300 leading-relaxed">
                Building self-control, respect, responsibility, and
                positive habits that support success.
              </p>

            </div>


            {/* Leadership */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#071A4D] hover:-translate-y-1 hover:shadow-xl transition duration-300">

              <div className="text-[#B88A00] text-3xl font-bold mb-5">
                04
              </div>

              <h3 className="text-xl font-bold text-[#071A4D] mb-3">
                Leadership
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Preparing students to become confident, responsible,
                and positive contributors to their communities.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          WHY CHOOSE US
      ====================================================== */}
      <section className="py-20 bg-slate-50">

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">

          <div>

            <p className="text-[#B88A00] uppercase tracking-widest font-bold text-sm mb-3">
              The Yahweh Difference
            </p>

            <h2 className="text-4xl font-bold text-[#071A4D] mb-6">
              Why Choose Yahweh Academy?
            </h2>

            <div className="w-16 h-1 bg-[#F4C542] mb-8"></div>

            <p className="text-gray-600 leading-relaxed mb-8">
              We are committed to creating a school environment where
              students are encouraged to learn, grow, participate,
              and develop the confidence needed to face the future.
            </p>

            <div className="space-y-5">

              {[
                "Dedicated and supportive teachers",
                "Strong focus on academic achievement",
                "Safe and disciplined learning environment",
                "Development of digital and modern skills",
                "Character and leadership development",
                "Positive partnership with parents and guardians",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[#F4C542] text-[#071A4D] flex items-center justify-center font-bold">
                    ✓
                  </div>

                  <p className="text-gray-700 font-medium">
                    {item}
                  </p>
                </div>
              ))}

            </div>

          </div>


          {/* Stats */}
          <div className="bg-[#071A4D] rounded-3xl p-10 text-white shadow-2xl">

            <p className="text-[#F4C542] uppercase tracking-widest font-bold text-sm mb-8">
              Our Commitment
            </p>

            <div className="grid grid-cols-2 gap-6">

              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-3xl font-extrabold text-[#F4C542]">
                  01
                </h3>
                <p className="text-slate-300 mt-2 text-sm">
                  Quality Education
                </p>
              </div>

              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-3xl font-extrabold text-[#F4C542]">
                  02
                </h3>
                <p className="text-slate-300 mt-2 text-sm">
                  Character Building
                </p>
              </div>

              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-3xl font-extrabold text-[#F4C542]">
                  03
                </h3>
                <p className="text-slate-300 mt-2 text-sm">
                  Digital Skills
                </p>
              </div>

              <div className="border border-white/10 rounded-xl p-6">
                <h3 className="text-3xl font-extrabold text-[#F4C542]">
                  04
                </h3>
                <p className="text-slate-300 mt-2 text-sm">
                  Future Leadership
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          MOTTO SECTION
      ====================================================== */}
      <section className="py-16 bg-[#F4C542] text-[#071A4D] text-center">

        <div className="max-w-4xl mx-auto px-6">

          <p className="uppercase tracking-[0.3em] font-bold text-sm mb-4">
            Our Motto
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold">
            Integrity + Excellence = Leadership
          </h2>

          <p className="mt-5 text-lg max-w-2xl mx-auto">
            We believe that strong character, quality education, and
            responsible leadership are essential for building a better future.
          </p>

        </div>

      </section>


      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="bg-[#071A4D] py-16">

        <div className="max-w-4xl mx-auto text-center px-6">

          <p className="text-[#F4C542] uppercase tracking-widest font-bold text-sm mb-4">
            Become Part of Our Community
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Give Your Child a Strong Foundation for the Future
          </h2>

          <p className="text-slate-300 text-lg mb-8">
            Discover what Yahweh Academy International can offer your child.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Link
              href="/admissions"
              className="inline-block bg-[#F4C542] hover:bg-[#dcae22] text-[#071A4D] px-8 py-3 font-bold rounded-lg shadow-lg transition duration-300"
            >
              Apply for Admission
            </Link>

            <Link
              href="/contact"
              className="inline-block border-2 border-white hover:bg-white hover:text-[#071A4D] text-white px-8 py-3 font-bold rounded-lg transition duration-300"
            >
              Contact Us
            </Link>

          </div>

        </div>
      </section>

    </div>
  );
}