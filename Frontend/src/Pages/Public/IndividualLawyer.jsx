import React, { useState } from "react";
import { MapPin, Star, MessageCircle, Phone, Video, Clock, AlertCircle } from "lucide-react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const IndividualLawyer = () => {
  const [selectedConsultationType, setSelectedConsultationType] = useState("Chat");

  const lawyer = {
    name: "Advocate Priya Sharma",
    specialization: "Civil & Corporate Law",
    location: "Kathmandu",
    rating: 4.8,
    reviews: 480,
    cases: 156,
    fee: 2500,
    status: "Active",
    about:
      "With over 8 years of experience in civil and corporate law, Advocate Priya Sharma has provided legal counseling to various corporate bodies and individuals. She specializes in corporate formation, M&A transactions, and corporate governance matters. Priya ensures her clients receive the finest legal advice backed by extensive knowledge of the market and a dedication to providing timely advice on the issues that matter most.",
    education: [
      "Bachelor of Laws (LL.B)",
      "Master of Laws (LL.M), International Law",
    ],
    awards: [
      "Excellence in Legal Practice",
      "Young Lawyer Of The Year - 2022",
    ],
    reviews_list: [
      {
        name: "Rajesh K.",
        rating: 5,
        text: "Excellent legal advice for my property case. Very professional and responsive.",
        time: "5 months ago",
      },
      {
        name: "Priya M.",
        rating: 5,
        text: "Best lawyer! Very helpful with corporate issues. Case expeditious and prompt.",
        time: "1 month ago",
      },
    ],
  };

  const consultationTypes = [
    { icon: MessageCircle, label: "Chat", value: "Chat" },
    { icon: Phone, label: "Call", value: "Call" },
    { icon: Video, label: "Video", value: "Video" },
  ];

  const availableTimes = [
    { day: "Mon", available: true },
    { day: "Tue", available: true },
    { day: "Wed", available: true },
    { day: "Thu", available: true },
    { day: "Fri", available: true },
    { day: "Sat", available: false },
  ];

  return (
    <div className="bg-[#F7F8FB] min-h-screen text-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        {/* Breadcrumb */}
        <div className="pt-6 pb-4 text-sm text-slate-600">
          <span className="hover:text-[#0F1A3D] cursor-pointer">Lawyer</span>
          <span className="mx-2">›</span>
          <span>{lawyer.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Lawyer Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a285b] to-[#0F1A3D] flex items-center justify-center text-white font-bold text-3xl border-4 border-yellow-400">
                    P
                  </div>
                  <div className="absolute bottom-0 right-0 bg-yellow-400 text-[#0F1A3D] px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star size={12} className="fill-current" /> {lawyer.rating}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-[#0F1A3D] mb-1">
                    {lawyer.name}
                  </h1>
                  <p className="text-slate-600 mb-3">{lawyer.specialization}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} /> {lawyer.location}
                    </span>
                    <span className="text-yellow-500 font-semibold">
                      ⭐ {lawyer.reviews} reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0F1A3D] mb-4">About</h2>
              <p className="text-sm leading-relaxed text-slate-700 mb-4">
                {lawyer.about}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center border-t pt-4">
                  <p className="text-2xl font-bold text-[#0F1A3D]">{lawyer.cases}</p>
                  <p className="text-xs text-slate-500 mt-1">Cases Handled</p>
                </div>
                <div className="text-center border-t pt-4">
                  <p className="text-2xl font-bold text-[#0F1A3D]">{lawyer.reviews}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Reviews</p>
                </div>
                <div className="text-center border-t pt-4">
                  <p className="text-2xl font-bold text-yellow-500">
                    ⭐ {lawyer.rating}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Rating</p>
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0F1A3D] mb-4">
                Education
              </h2>
              <ul className="space-y-2">
                {lawyer.education.map((edu, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">▪</span>
                    {edu}
                  </li>
                ))}
              </ul>
            </div>

            {/* Awards Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0F1A3D] mb-4">Awards</h2>
              <ul className="space-y-2">
                {lawyer.awards.map((award, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">▪</span>
                    {award}
                  </li>
                ))}
              </ul>
            </div>

            {/* Client Reviews Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0F1A3D] mb-4">
                Client Reviews
              </h2>
              <div className="space-y-4">
                {lawyer.reviews_list.map((review, idx) => (
                  <div key={idx} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{review.name}</p>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{review.time}</p>
                    </div>
                    <p className="text-sm text-slate-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Consultation Fee Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0F1A3D]">
                  Consultation Fee
                </h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Active
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-slate-500 mb-1">Starting from</p>
                <p className="text-3xl font-bold text-[#0F1A3D]">
                  Rs. {lawyer.fee.toLocaleString()}
                </p>
              </div>

              {/* Consultation Type */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#0F1A3D]">
                  Consultation Type
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {consultationTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedConsultationType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSelectedConsultationType(type.value)}
                        className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg transition border ${
                          isSelected
                            ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs font-semibold">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Times */}
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-[#0F1A3D]">
                  Available Times
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time.day}
                      disabled={!time.available}
                      className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                        time.available
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-slate-50 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {time.day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  10:00 AM - 3:00 PM
                </p>
              </div>

              {/* Book Now Button */}
              <button className="w-full mt-6 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#1b2762] to-[#1c3e8a] shadow hover:shadow-lg transition">
                Book Now
              </button>
            </div>

            {/* Need Help Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#0F1A3D] mb-2">
                Need Help?
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Send a message to get more information
              </p>
              <button className="w-full px-4 py-3 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition">
                Send Message
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Verified Lawyer
                </p>
                <p className="text-xs text-blue-700">
                  All information and credentials have been verified by our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndividualLawyer;
