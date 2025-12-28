import React from "react";
import Sidebar from "./sidebar";
import StatCard from "./statcard";
import {
  Briefcase,
  Calendar,
  MessageSquare,
  CreditCard,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Welcome back, Karuna!
          </h2>
          <p className="text-sm text-gray-500">
            Here’s an overview of your legal matters and appointments
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Briefcase size={20} />}
            title="Active Cases"
            value="4"
            subtitle="2 New cases"
          />
          <StatCard
            icon={<Calendar size={20} />}
            title="Appointments"
            value="2"
            subtitle="Upcoming"
          />
          <StatCard
            icon={<MessageSquare size={20} />}
            title="Messages"
            value="12"
            subtitle="3 Unread"
          />
          <StatCard
            icon={<CreditCard size={20} />}
            title="Total Spent"
            value="Rs. 25,000"
            subtitle="This year"
          />
        </div>

        {/* GRID SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* RECENT CASES */}
          <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Recent Cases</h3>
              <span className="text-sm text-yellow-500 cursor-pointer">
                View All
              </span>
            </div>

            {[
              "Property Dispute – Land Registration",
              "Divorce Proceedings",
              "Business Contract Review",
              "Family Law – Inheritance Matter",
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between py-3 border-b last:border-none"
              >
                <p className="text-sm">{item}</p>
                <span className="text-xs text-blue-900 font-semibold">
                  In Progress
                </span>
              </div>
            ))}
          </div>

          {/* NOTIFICATIONS */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Notifications</h3>
              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                3 New
              </span>
            </div>

            {[
              "Case update received",
              "Appointment reminder",
              "Payment confirmation",
            ].map((note, i) => (
              <div key={i} className="mb-3">
                <p className="text-sm">{note}</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
