import Link from "next/link";

import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gray-50 py-20 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-dark text-sm font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Welcome to VolunteerHub
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                Make a Difference with <br className="hidden sm:block" />
                <span className="text-primary">
                  VolunteerHub
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                Connect with meaningful volunteer opportunities or post positions to find passionate volunteers. 
                Together, we can create lasting impact in our communities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4">
                <Link
                  href="/opportunities"
                  className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center"
                >
                  Browse Opportunities
                </Link>
                <Link
                  href="/ngo/register"
                  className="h-12 px-8 rounded-xl bg-white text-gray-700 border-2 border-gray-300 hover:border-secondary font-semibold hover:bg-gray-50 transition-all inline-flex items-center justify-center"
                >
                  Register as NGO
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-xl">
                {/* Decorative blob/shape behind image could go here if desired */}
                <Image 
                  src="/images/hero-illustration.png" 
                  alt="Volunteers working together" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VolunteerHub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy to connect volunteers with organizations that need their skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Discovery",
                description: "Browse thousands of volunteer opportunities tailored to your interests and skills.",
                icon: "🔍",
                bgClass: "bg-secondary"
              },
              {
                title: "Verified NGOs",
                description: "Work with trusted organizations that are making real impact in communities.",
                icon: "✓",
                bgClass: "bg-accent"
              },
              {
                title: "Track Impact",
                description: "Monitor your volunteer hours and see the difference you're making.",
                icon: "📊",
                bgClass: "bg-primary"
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-2xl bg-gray-50 border border-gray-200 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10 transition-all"
              >
                <div className={`w-16 h-16 rounded-xl ${feature.bgClass} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-lg text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg opacity-90">
            Join thousands of volunteers and NGOs already using VolunteerHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/signup"
              className="h-12 px-8 rounded-xl bg-white text-secondary-dark font-semibold hover:bg-gray-100 transition-all inline-flex items-center justify-center shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/about"
              className="h-12 px-8 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-all inline-flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
