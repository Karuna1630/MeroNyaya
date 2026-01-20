import React, { useMemo, useState } from "react";
import { MapPin, Search, ShieldCheck, Star, Briefcase, Calendar } from "lucide-react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const specializations = [
	"All Specializations",
	"Family Law",
	"Property Law",
	"Criminal Law",
	"Civil Litigation",
	"Banking & Finance",
	"Labor Law",
	"Immigration Law",
];

const locations = [
	"All Locations",
	"Kathmandu",
	"Lalitpur",
	"Pokhara",
	"Butwal",
	"Bharatpur",
	"Biratnagar",
	"Birgunj",
];

const sortOptions = [
	"Top Rated",
	"Price: Low to High",
	"Price: High to Low",
	"Experience",
];

const lawyers = [
	{
		name: "Advocate Priya Sharma",
		specialization: "Family Law",
		experience: 12,
		location: "Kathmandu",
		rating: 4.9,
		reviews: 15,
		fee: 2500,
		verified: true,
		availability: "Available",
		engagements: 112,
		gradient: "from-[#1a285b] via-[#1a2f6d] to-[#101934]",
		letter: "P",
	},
	{
		name: "Advocate Suraj Thapa",
		specialization: "Property Law",
		experience: 9,
		location: "Kathmandu",
		rating: 4.7,
		reviews: 12,
		fee: 4000,
		verified: true,
		availability: "Busy",
		engagements: 86,
		gradient: "from-[#0f1f4c] via-[#0e2b74] to-[#0a1840]",
		letter: "S",
	},
	{
		name: "Advocate Kamala Poudel",
		specialization: "Immigration Law",
		experience: 7,
		location: "Pokhara",
		rating: 4.8,
		reviews: 20,
		fee: 4000,
		verified: true,
		availability: "Unavailable",
		engagements: 74,
		gradient: "from-[#243b55] via-[#274780] to-[#111a2c]",
		letter: "K",
	},
	{
		name: "Advocate Ram Bahadur",
		specialization: "Criminal Law",
		experience: 10,
		location: "Bharatpur",
		rating: 4.9,
		reviews: 18,
		fee: 3500,
		verified: true,
		availability: "Available",
		engagements: 92,
		gradient: "from-[#162447] via-[#0f1b3a] to-[#0a152c]",
		letter: "R",
	},
	{
		name: "Advocate Arjit Rai",
		specialization: "Civil Litigation",
		experience: 8,
		location: "Birgunj",
		rating: 4.8,
		reviews: 22,
		fee: 2300,
		verified: true,
		availability: "Available",
		engagements: 104,
		gradient: "from-[#1a285b] via-[#1a2f6d] to-[#101934]",
		letter: "A",
	},
	{
		name: "Advocate Deepak Khadka",
		specialization: "Immigration Law",
		experience: 11,
		location: "Biratnagar",
		rating: 4.8,
		reviews: 19,
		fee: 3800,
		verified: true,
		availability: "Available",
		engagements: 88,
		gradient: "from-[#0f1f4c] via-[#0e2b74] to-[#0a1840]",
		letter: "D",
	},
];

const FindLawyers = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSpec, setSelectedSpec] = useState("All Specializations");
	const [selectedLocation, setSelectedLocation] = useState("All Locations");
	const [feeCap, setFeeCap] = useState(5000);
	const [sortBy, setSortBy] = useState("Top Rated");

	const filteredLawyers = useMemo(() => {
		return lawyers.filter((lawyer) => {
			const matchesSpec =
				selectedSpec === "All Specializations" ||
				lawyer.specialization === selectedSpec;
			const matchesLocation =
				selectedLocation === "All Locations" ||
				lawyer.location === selectedLocation;
			const matchesFee = lawyer.fee <= feeCap;
			const matchesSearch =
				lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				lawyer.specialization.toLowerCase().includes(searchTerm.toLowerCase());

			return matchesSpec && matchesLocation && matchesFee && matchesSearch;
		});
	}, [searchTerm, selectedLocation, selectedSpec, feeCap]);

	const sortedLawyers = useMemo(() => {
		const clone = [...filteredLawyers];

		switch (sortBy) {
			case "Price: Low to High":
				return clone.sort((a, b) => a.fee - b.fee);
			case "Price: High to Low":
				return clone.sort((a, b) => b.fee - a.fee);
			case "Experience":
				return clone.sort((a, b) => b.experience - a.experience);
			default:
				return clone.sort((a, b) => b.rating - a.rating);
		}
	}, [filteredLawyers, sortBy]);

	return (
		<div className="bg-[#F7F8FB] min-h-screen text-slate-900">
			<Header />
			<main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
				<section className="pt-10 space-y-6">
					<div className="text-center space-y-2">
						<h1 className="text-2xl sm:text-3xl font-semibold text-[#0F1A3D]">Find Your Legal Expert</h1>
						<p className="text-sm sm:text-base text-slate-600">Browse through our network of verified lawyers across Nepal</p>
					</div>

					<div className="max-w-3xl mx-auto">
						<div className="flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-4 py-3 shadow-sm">
							<Search size={18} className="text-slate-400" />
							<input
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								type="text"
								placeholder="Search by name or specialization..."
								className="w-full outline-none text-slate-800 placeholder-slate-400 bg-transparent"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8 items-start">
						<aside className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-8">
						<div className="space-y-4">
							<h3 className="text-sm font-semibold text-[#0F1A3D]">Specialization</h3>
							<div className="space-y-2 text-sm text-slate-600">
								{specializations.map((item) => {
									const isActive = selectedSpec === item;
									return (
										<button
											key={item}
											onClick={() => setSelectedSpec(item)}
											className={`w-full text-left px-3 py-2 rounded-lg transition border ${
												isActive
													? "bg-[#0F1A3D] text-white border-[#0F1A3D] shadow-sm"
													: "hover:bg-slate-50 border-transparent"
											}`}
										>
											{item}
										</button>
									);
								})}
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-sm font-semibold text-[#0F1A3D]">Location</h3>
							<div className="space-y-2 text-sm text-slate-600">
								{locations.map((item) => {
									const isActive = selectedLocation === item;
									return (
										<button
											key={item}
											onClick={() => setSelectedLocation(item)}
											className={`w-full text-left px-3 py-2 rounded-lg transition border ${
												isActive
													? "bg-[#0F1A3D] text-white border-[#0F1A3D] shadow-sm"
													: "hover:bg-slate-50 border-transparent"
											}`}
										>
											{item}
										</button>
									);
								})}
							</div>
						</div>

							<div className="space-y-4">
								<div className="flex items-center justify-between text-sm font-semibold text-[#0F1A3D]">
									<span>Consultation Fee</span>
									<span className="text-xs font-medium text-slate-500">Rs. {feeCap}</span>
								</div>
								<input
									type="range"
									min="1000"
									max="5000"
									step="100"
									value={feeCap}
									onChange={(e) => setFeeCap(Number(e.target.value))}
									className="w-full accent-[#0F1A3D]"
								/>
								<div className="flex justify-between text-xs text-slate-500">
									<span>Rs. 1,000</span>
									<span>Rs. 5,000</span>
								</div>
							</div>
						</aside>

						<div className="space-y-5">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div className="text-sm text-slate-600">Showing {sortedLawyers.length} lawyers</div>
								<div className="flex items-center gap-2 text-sm text-slate-600">
									<span>Sort by</span>
									<select
										value={sortBy}
										onChange={(e) => setSortBy(e.target.value)}
										className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white shadow-sm"
									>
										{sortOptions.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
								</div>
							</div>

							  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
								{sortedLawyers.map((lawyer) => (
									<article
										key={lawyer.name}
										className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
									>
									<div className={`relative h-28 bg-gradient-to-r ${lawyer.gradient}`}>
										<div className="absolute top-3 left-3 w-11 h-11 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white font-semibold text-lg">
											{lawyer.letter}
										</div>
										<div className="absolute bottom-3 left-4 text-white text-sm font-semibold flex items-center gap-2">
											<ShieldCheck size={16} className="text-green-200" />
											We Verified
										</div>
										<div className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white">
											{lawyer.availability}
										</div>
									</div>

									<div className="p-5 space-y-4">
										<div className="flex items-start justify-between gap-3">
											<div className="space-y-1">
												<h3 className="text-lg font-semibold text-[#0F1A3D]">{lawyer.name}</h3>
												<div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
													<span className="inline-flex items-center gap-1">
														<Briefcase size={16} className="text-slate-500" />
														{lawyer.specialization}
													</span>
													<span className="inline-flex items-center gap-1">
														<Calendar size={16} className="text-slate-500" />
														{lawyer.experience} yrs exp.
													</span>
												</div>
											</div>
											<div className="text-right space-y-1">
												<div className="inline-flex items-center gap-1 text-yellow-500 font-semibold text-sm bg-yellow-50 px-2 py-1 rounded-full">
													<Star size={14} className="fill-current" />
													{lawyer.rating}
													<span className="text-xs text-slate-500">({lawyer.reviews})</span>
												</div>
												<div className="text-sm text-slate-500 flex items-center justify-end gap-1">
													<MapPin size={14} />
													{lawyer.location}
												</div>
											</div>
										</div>

										<div className="flex items-center justify-between text-sm text-slate-600">
											<div className="flex items-center gap-2">
												<span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">Verified</span>
												<span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">{lawyer.engagements} engagements</span>
											</div>
											<div className="text-right font-semibold text-[#0F1A3D]">
												<div className="text-xs text-slate-500">Consultation fee</div>
												<div>Rs. {lawyer.fee.toLocaleString()}</div>
											</div>
										</div>

										<div className="flex items-center justify-between pt-2">
											<p className="text-xs text-slate-500">Transparent pricing & fast response</p>
											<button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#1b2762] to-[#1c3e8a] shadow hover:shadow-md transition">
												View Profile
											</button>
										</div>
									</div>
									</article>
								))}
							</div>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default FindLawyers;
