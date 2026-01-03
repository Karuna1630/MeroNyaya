import React from "react";
import { Link } from 'react-router-dom';
import { GoLaw } from 'react-icons/go';
import { Search, CalendarCheck, ShieldCheck, FileText } from 'lucide-react';
import home1 from '../../assets/home1.jpg';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const Home = () => {
  return (
    <>
    <div className="bg-[#F9FAFB] text-gray-900">

    <Header/>

     {/* Hero section */}
      <section className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Your Trusted Digital <br />
              Legal Partner in <span className="text-yellow-400">Nepal</span>
            </h1>
            <p className="text-gray-200 mb-8">
              Connect with verified lawyers, book appointments, and manage your
              legal cases securely — all in one platform.
            </p>

            <div className="flex gap-4">
              <button className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold">
                Find a Lawyer
              </button>
              <button className="border border-white px-6 py-3 rounded-lg font-semibold">
                Browse Categories
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src={home1}
              alt="Legal Consultation"
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* categories */}
      <section className="max-w-7xl mx-auto px-6 py-16">
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
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">
            How MeroNaya Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <Search className="mx-auto mb-4 text-blue-900" />
              <h4 className="font-semibold mb-2">Search & Discover</h4>
              <p className="text-sm text-gray-600">
                Find lawyers by category, experience, and ratings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <CalendarCheck className="mx-auto mb-4 text-blue-900" />
              <h4 className="font-semibold mb-2">Book Appointment</h4>
              <p className="text-sm text-gray-600">
                Schedule consultations instantly online.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <ShieldCheck className="mx-auto mb-4 text-blue-900" />
              <h4 className="font-semibold mb-2">Secure Consultation</h4>
              <p className="text-sm text-gray-600">
                Communicate securely with legal experts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <FileText className="mx-auto mb-4 text-blue-900" />
              <h4 className="font-semibold mb-2">Track Your Case</h4>
              <p className="text-sm text-gray-600">
                Monitor progress and manage documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-blue-900 rounded-xl p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Ready to Connect with Your Legal Expert?
            </h2>
            <p className="text-gray-200">
              Start your legal journey with trusted professionals today.
            </p>
          </div>
          <Link
            to="/register"
            className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold"
          >
            Get Started
          </Link>
        </div>
      </section>
      <Footer/>
    </div>
    </>
  );
};

export default Home;
