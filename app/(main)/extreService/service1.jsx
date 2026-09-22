// app/(main)/services/page.js

import Image from "next/image";
import Link from "next/link";

// Local metadata export for page-specific SEO
export const metadata = {
  title: "School Services | Programs, Facilities, and Support | Grace International School",
  description:
    "Explore the comprehensive services offered by Grace International School, including academic programs (Primary, Secondary), state-of-the-art facilities, and student support.",
};

// Placeholder data for service categories
const serviceCategories = [
  { 
    name: "Academic Programs", 
    description: "Rigorous and internationally benchmarked curricula for all stages of development.", 
    icon: "📘",
    details: [
      "Primary School (Ages 5-11): Foundational literacy, numeracy, and character building.",
      "Secondary School (Ages 12-18): Preparation for WASSCE and international examinations.",
      "Digital Literacy Focus: Integrated coding, robotics, and online learning tools."
    ],
    image: "/images/service-academics.jpg" 
  },
  { 
    name: "Student Support & Life", 
    description: "A holistic approach to well-being, growth, and extracurricular engagement.", 
    icon: "🧘",
    details: [
      "Guidance & Counseling: Academic planning and personal well-being support.",
      "Extracurricular Clubs: Sports, Debate, Arts, and STEM clubs.",
      "Health & Safety: On-site nurse station and strict safety protocols."
    ],
    image: "/images/service-support.jpg"
  },
  { 
    name: "Modern Facilities", 
    description: "State-of-the-art learning environments designed for the 21st century.", 
    icon: "💡",
    details: [
      "Science & Computer Labs: Fully equipped labs for practical learning.",
      "Library & Media Center: Extensive digital and print resources.",
      "Sports Grounds & Gymnasium: Dedicated spaces for physical education and athletics."
    ],
    image: "/images/service-facilities.jpg"
  },
];

export default function ServicesPage1() {
  return (
    <div className="services-page-content">

      {/* =====================================================
          1. HERO HEADER: Service Overview
      ====================================================== */}
      <section className="bg-green-500 py-16 px-6 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Comprehensive Services for Every Student
        </h1>
        <p className="text-xl max-w-3xl mx-auto opacity-90">
          Grace International School offers a complete ecosystem of learning, support, and resources designed to ensure student success and holistic development.
        </p>
      </section>

      {/* =====================================================
          2. SERVICE CATEGORIES (Detailed Blocks)
      ====================================================== */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-20">
        
        {serviceCategories.map((service, index) => (
          <div 
            key={service.name} 
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
          >
            
            {/* Visual Column */}
            <div className={`relative h-72 w-full rounded-xl shadow-2xl overflow-hidden ${index % 2 !== 0 ? 'lg:order-2' : 'lg:order-1'}`}>
              <Image
                src={service.image} 
                alt={service.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            {/* Content Column */}
            <div className={`p-4 ${index % 2 !== 0 ? 'lg:order-1' : 'lg:order-2'}`}>
              <span className="text-4xl mb-4 inline-block">{service.icon}</span>
              <h2 className="text-3xl font-bold text-blue-900 mb-4">{service.name}</h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed border-l-4 border-green-500 pl-4">
                {service.description}
              </p>
              
              {/* Detailed Bullet Points */}
              <ul className="space-y-3 text-gray-600">
                {service.details.map((detail, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-600 mr-2 text-xl font-bold">&check;</span>
                    {detail}
                  </li>
                ))}
              </ul>
              
              <Link
                href="/contact"
                className="mt-6 inline-block text-white bg-blue-700 hover:bg-blue-800 font-semibold px-6 py-3 rounded-full transition duration-300 shadow-md"
              >
                Inquire About {service.name} &rarr;
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* =====================================================
          3. Admissions CTA
      ====================================================== */}
      <section className="bg-gray-100 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center p-6">
          <h2 className="text-3xl font-bold text-blue-800 mb-4">Ready to Enroll?</h2>
          <p className="text-gray-600 text-lg mb-6">
            Begin the journey towards a world-class education for your child today.
          </p>
          <Link
            href="/admissions"
            className="bg-red-500 hover:bg-red-600 text-white text-lg font-bold px-8 py-3 rounded-full shadow-lg transition duration-300"
          >
            Start Your Application &rarr;
          </Link>
        </div>
      </section>

    </div>
  );
}