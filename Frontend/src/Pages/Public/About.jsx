import React from 'react';
import { Shield, Users, Zap, Scale, CheckCircle2, Award } from 'lucide-react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

const About = () => {
  return (
    <div className="bg-white text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="bg-linear-to-b from-[#1a2b5a] via-[#2a3b6f] to-[#3b4c84] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">About MeroNaya</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Bridging the gap between clients and legal expertise through a modern, transparent, and accessible platform
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0F1A3D] mb-6">Our Mission</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                MeroNaya is dedicated to democratizing access to legal services in Nepal. We believe that everyone deserves fair, transparent, and affordable legal representation.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By connecting clients directly with verified lawyers, we eliminate unnecessary intermediaries and make legal services more accessible to everyone, regardless of their background or location.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[#0F1A3D]">
              <Scale size={48} className="text-[#0F1A3D] mb-4" />
              <h3 className="text-xl font-semibold text-[#0F1A3D] mb-3">Justice for All</h3>
              <p className="text-gray-600">
                We're committed to providing equal access to justice and making the legal system work better for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0F1A3D] mb-12">Why Choose MeroNaya</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <Shield size={32} className="text-[#0F1A3D] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0F1A3D] mb-2 text-lg">Verified Lawyers</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    All lawyers on our platform undergo strict KYC verification to ensure credibility and professional standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <Zap size={32} className="text-[#0F1A3D] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0F1A3D] mb-2 text-lg">Quick Matching</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Our intelligent system matches you with the most suitable lawyer based on specialization and expertise.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <Users size={32} className="text-[#0F1A3D] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0F1A3D] mb-2 text-lg">Community Driven</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Transparent ratings and reviews help you make informed decisions about your legal representation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <Award size={32} className="text-[#0F1A3D] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0F1A3D] mb-2 text-lg">Quality Assurance</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We maintain the highest standards of service quality and client satisfaction throughout the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0F1A3D] mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0F1A3D] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-[#0F1A3D] mb-3">Create Account</h3>
              <p className="text-gray-600 text-sm">
                Sign up as a client or lawyer with your basic information and verify your details.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#0F1A3D] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-[#0F1A3D] mb-3">Find Match</h3>
              <p className="text-gray-600 text-sm">
                Browse verified lawyers or post your case to receive proposals from the best matches.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#0F1A3D] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-[#0F1A3D] mb-3">Collaborate</h3>
              <p className="text-gray-600 text-sm">
                Work with your chosen lawyer and manage your case through our secure platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0F1A3D] mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#0F1A3D] mb-2">Transparency</h3>
                <p className="text-gray-600 text-sm">
                  We believe in complete transparency in pricing, credentials, and service delivery.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#0F1A3D] mb-2">Accessibility</h3>
                <p className="text-gray-600 text-sm">
                  Legal services should be accessible to everyone, everywhere in Nepal.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#0F1A3D] mb-2">Integrity</h3>
                <p className="text-gray-600 text-sm">
                  We maintain the highest ethical standards in all our operations and partnerships.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#0F1A3D] mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">
                  We continuously improve our platform to serve users better and more efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
