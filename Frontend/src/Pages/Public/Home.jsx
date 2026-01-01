import React from "react";
import { Link } from 'react-router-dom';
import { GoLaw } from 'react-icons/go';
import { Search, CalendarCheck, ShieldCheck, FileText, CheckCircle, Clock, Globe } from 'lucide-react';
import home1 from '../../assets/home1.jpg';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const Home = () => {
  return (
    <>
    <div className="bg-[#F9FAFB] text-gray-900">

    <Header/>

     {/* Hero section */}
      <section className="bg-linear-to-r from-blue-900 to-blue-800 text-white">
        <div className="w-full px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Your Trusted Digital <br />
              Legal Partner in <span className="text-yellow-400">Nepal</span>
            </h1>
            <p className="text-gray-200 mb-8">
              Connect with verified lawyers, book appointments, and manage your
              legal cases securely — all in one platform.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 flex items-center bg-white rounded-lg px-4 py-3">
                <Search size={20} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name of location..."
                  className="w-full ml-2 outline-none text-gray-700"
                />
              </div>
              <button className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition">
                Find a Lawyer
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-2xl font-bold">3000+</p>
                <p className="text-gray-300">Active Clients</p>
              </div>
              <div>
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-gray-300">Cases Resolved</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4.8★</p>
                <p className="text-gray-300">Client Ratings</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src={home1}
              alt="Legal Consultation"
              className="rounded-xl shadow-lg w-full"
            />
          </div>
        </div>
      </section>

      {/* categories */}
      <section className="w-full px-12 py-16">
        <h2 className="text-2xl font-bold text-center mb-4">
          Browse by Legal Category
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Find specialized lawyers for your specific legal needs
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Family Law",
            "Criminal Law",
            "Corporate Law",
            "Immigration",
            "Property Law",
            "Civil Litigation",
          ].map((item) => (
            <div
              key={item}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold mb-2">{item}</h3>
              <p className="text-sm text-gray-600">
                Expert lawyers specializing in {item.toLowerCase()} cases.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-gray-100 py-16">
        <div className="w-full px-12">
          <h2 className="text-2xl font-bold text-center mb-12">
            How MeroNaya Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <Search className="mx-auto mb-4 text-blue-900" size={32} />
              <h4 className="font-semibold mb-2">Search & Discover</h4>
              <p className="text-sm text-gray-600">
                Find lawyers by category, experience, and ratings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <CalendarCheck className="mx-auto mb-4 text-blue-900" size={32} />
              <h4 className="font-semibold mb-2">Book Appointment</h4>
              <p className="text-sm text-gray-600">
                Schedule consultations instantly online.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <ShieldCheck className="mx-auto mb-4 text-blue-900" size={32} />
              <h4 className="font-semibold mb-2">Secure Consultation</h4>
              <p className="text-sm text-gray-600">
                Communicate securely with legal experts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <FileText className="mx-auto mb-4 text-blue-900" size={32} />
              <h4 className="font-semibold mb-2">Track Your Case</h4>
              <p className="text-sm text-gray-600">
                Monitor progress and manage documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED LAWYERS ================= */}
      <section className="w-full px-12 py-16">
        <h2 className="text-2xl font-bold mb-12">Featured Lawyers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Advocate Pukar Bohara", exp: "12 yrs exp.", rating: "4.8", cases: "156" },
            { name: "Advocate Pukar Bohara", exp: "12 yrs exp.", rating: "4.8", cases: "156" },
            { name: "Advocate Pukar Bohara", exp: "12 yrs exp.", rating: "4.8", cases: "156" },
            { name: "Advocate Pukar Bohara", exp: "12 yrs exp.", rating: "4.8", cases: "156" },
          ].map((lawyer, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <div className="relative pb-full">
                <div className="bg-gradient-to-r from-gray-400 to-gray-300 h-32"></div>
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gray-500 rounded-full border-4 border-white"></div>
              </div>
              <div className="pt-12 px-4 pb-4 text-center">
                <h3 className="font-semibold mb-1">{lawyer.name}</h3>
                <p className="text-xs text-gray-600 mb-3">Kathmandu</p>
                <div className="flex justify-center items-center gap-4 text-xs mb-4">
                  <span>⭐ {lawyer.rating}({lawyer.cases})</span>
                </div>
                <button className="bg-blue-900 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-blue-800 transition">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHY CHOOSE MERONAYA ================= */}
      <section className="bg-blue-900 text-white py-16">
        <div className="w-full px-12">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose MeroNaya?</h2>
          <p className="text-center text-gray-300 mb-12">We're revolutionizing legal services in Nepal</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <CheckCircle className="text-blue-900" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Verified Lawyers Only</h3>
                <p className="text-sm text-gray-300">Only verified, licensed lawyers with credentials checked thoroughly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Globe className="text-blue-900" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-sm text-gray-300">Clear consultation fees with no hidden charges.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-blue-900" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-sm text-gray-300">End-to-end encrypted communication and documents.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <FileText className="text-blue-900" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Digital Case Management</h3>
                <p className="text-sm text-gray-300">Organize and track all case documents in one place.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Clock className="text-blue-900" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-gray-300">Round-the-clock support to assist you.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Globe className="text-blue-900" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Multilingual</h3>
                <p className="text-sm text-gray-300">Support in English and Nepali languages.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="w-full px-12 py-20">
        <div className="bg-blue-900 rounded-xl p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              Ready to Connect with Your Legal Expert?
            </h2>
            <p className="text-gray-300">
              Start your legal journey with trusted professionals today.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/register"
              className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              Get Started
            </Link>
            <Link
              to="/"
              className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Find a Lawyer
            </Link>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
    </>
  );
};

export default Home;
