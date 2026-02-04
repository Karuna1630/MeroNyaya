import React, { useMemo, useState, useEffect } from "react";
import { Search, ShieldCheck, Star, Briefcase, Calendar, CheckCircle2, MapPin } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { fetchVerifiedLawyers } from "../slices/lawyerSlice";
import { LAW_CATEGORIES, URGENCY_LEVELS } from "../../utils/lawCategories";

const specializations = [
	"All Specializations",
	...LAW_CATEGORIES,
];

const sortOptions = [
	"Top Rated",
	"Price: Low to High",
	"Price: High to Low",
	"Experience",
];

const FindLawyers = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { verifiedLawyers = [] } = useSelector((state) => state.lawyer || {});
	
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSpec, setSelectedSpec] = useState("All Specializations");
	const [feeCap, setFeeCap] = useState(5000);
	const [sortBy, setSortBy] = useState("Top Rated");

	useEffect(() => {
		dispatch(fetchVerifiedLawyers());
	}, [dispatch]);

	const filteredLawyers = useMemo(() => {
		return verifiedLawyers.filter((lawyer) => {
			const matchesSpec =
				selectedSpec === "All Specializations" ||
				lawyer.specialization === selectedSpec;
			const matchesFee = (lawyer.consultation_fee || 0) <= feeCap;
			const matchesSearch =
				(lawyer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
				(lawyer.specialization || "").toLowerCase().includes(searchTerm.toLowerCase());

			return matchesSpec && matchesFee && matchesSearch;
		});
	}, [searchTerm, selectedSpec, feeCap, verifiedLawyers]);

	const sortedLawyers = useMemo(() => {
		const clone = [...filteredLawyers];

		switch (sortBy) {
			case "Price: Low to High":
				return clone.sort((a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0));
			case "Price: High to Low":
				return clone.sort((a, b) => (b.consultation_fee || 0) - (a.consultation_fee || 0));
			case "Experience":
				return clone.sort((a, b) => (b.experience || 0) - (a.experience || 0));
			default:
				return clone.sort((a, b) => (b.rating || 0) - (a.rating || 0));
		}
	}, [filteredLawyers, sortBy]);

	return (
		<div className="bg-[#F7F8FB] min-h-screen text-slate-900">
			<Header />
			{/* ================= WHITE TOP SECTION ================= */}
			<section className="bg-white">
				<div className="w-full px-12 py-10 space-y-6">
					<div className="text-center space-y-2">
						<h1 className="text-2xl sm:text-3xl font-semibold text-[#0F1A3D]">
							Find Your Legal Expert
						</h1>
						<p className="text-slate-600">
							Browse through our network of verified lawyers across Nepal
						</p>
					</div>

					<div className="flex justify-center">
						<div className="w-full max-w-2xl flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-4 py-3 shadow-sm">
							<Search size={18} className="text-slate-400" />
							<input
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search by name or specialization..."
								className="w-full bg-transparent outline-none"
							/>
						</div>
					</div>
				</div>
			</section>

			<main className="w-full px-12 pb-16">
				<section className="pt-2">

					<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2">
					<aside className="md:col-span-4 lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-8">
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

						<div className="md:col-span-8 lg:col-span-9 space-y-4">
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

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{sortedLawyers.map((lawyer) => (
									<div
										key={lawyer.id}
										className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col"
									>
										{/* Header Section: Avatar and Name */}
										<div className="flex items-start gap-4 mb-4">
											<div className="relative">
												<img
													src={lawyer.profile_image || `https://ui-avatars.com/api/?name=${lawyer.name}&background=0F1A3D&color=fff`}
													alt={lawyer.name}
													className="w-20 h-20 rounded-full object-cover border border-gray-100"
												/>
												<div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
											</div>
											
											<div className="flex-1">
												<div className="flex items-center gap-1.5 mb-1.5">
													<h3 className="font-bold text-[#0F1A3D] text-lg">{lawyer.name}</h3>
													{lawyer.is_kyc_verified && (
														<CheckCircle2 size={18} className="text-gray-400" />
													)}
												</div>
												
												<span className="inline-block px-3 py-1 bg-[#1A2B5A] text-white text-[11px] font-medium rounded-full mb-3 uppercase tracking-wider">
													{lawyer.specializations || lawyer.specialization}
												</span>
												
												<div className="flex items-center gap-4 text-xs text-gray-500">
													<div className="flex items-center gap-1">
														<Briefcase size={14} className="text-gray-400" />
														<span>{lawyer.years_of_experience || lawyer.experience || 0} yrs</span>
													</div>
													<div className="flex items-center gap-1">
														<Star size={14} className={lawyer.average_rating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
														<span className="text-gray-700 font-semibold">
															{lawyer.average_rating > 0 ? lawyer.average_rating.toFixed(1) : "No reviews"}
														</span>
													</div>
												</div>
											</div>
										</div>

										{/* Location and Price Section */}
										<div className="flex items-center justify-between mb-4 px-1">
											<div className="flex items-center gap-1.5 text-gray-600 text-sm">
												<MapPin size={16} className="text-gray-400" />
												<span>{lawyer.city || lawyer.district || "N/A"}</span>
											</div>
											<div className="text-[#0F1A3D] font-bold text-lg">
												Rs. {(lawyer.consultation_fee || 0).toLocaleString()}
											</div>
										</div>

										{/* Bio */}
										{lawyer.bio && (
											<div className="mb-4 text-sm text-gray-600">
												<p className="text-gray-600 line-clamp-2">{lawyer.bio}</p>
											</div>
										)}

										{/* Details Grid */}
										<div className="mb-5 space-y-3 text-sm">
											<div className="grid grid-cols-2 gap-3">
												<div>
													<p className="text-xs text-gray-400 mb-1">Date of Birth</p>
													<p className="text-gray-700 font-medium">{lawyer.dob || "N/A"}</p>
												</div>
												<div>
													<p className="text-xs text-gray-400 mb-1">District</p>
													<p className="text-gray-700 font-medium">{lawyer.district || "N/A"}</p>
												</div>
											</div>
											<div>
												<p className="text-xs text-gray-400 mb-1">Phone</p>
												<p className="text-gray-700 font-medium">{lawyer.phone || "N/A"}</p>
											</div>
										</div>

										{/* Footer Action */}
										<div className="mt-auto">
											<button 
												onClick={() => navigate(`/lawyer/${lawyer.id}`)}
												className="w-full py-2.5 px-4 bg-[#0F1A3D] text-white rounded-lg font-semibold text-sm hover:bg-[#1a2b5a] transition"
											>
												View Profile
											</button>
										</div>
									</div>
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
