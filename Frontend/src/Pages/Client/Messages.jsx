import React, { useMemo } from "react";
import {
	Search,
	Paperclip,
	Send,
	Download,
	FileText,
	MoreVertical,
} from "lucide-react";
import Sidebar from "./sidebar";
import DashHeader from "./DashHeader";
import lawyerPic from "../../assets/lawyerpic.jpg";

const conversations = [
	{
		id: 1,
		name: "Adv. Rajesh Sharma",
		subtitle: "I've uploaded the court sub...",
		time: "10:30 AM",
		unread: 2,
		online: true,
		avatar: lawyerPic,
	},
	{
		id: 2,
		name: "Adv. Priya Sharma",
		subtitle: "The hearing went well today",
		time: "Yesterday",
		unread: 0,
		online: true,
		avatar: lawyerPic,
	},
	{
		id: 3,
		name: "Adv. Sita Karki",
		subtitle: "Please review the contract ...",
		time: "Dec 3",
		unread: 1,
		online: true,
		avatar: lawyerPic,
	},
];

const chatThread = [
	{
		id: "m1",
		author: "other",
		text: "Perfect! I've received the documents. I'll review them and get back to you.",
		time: "10:15 AM",
	},
	{
		id: "m2",
		author: "me",
		text: "I've uploaded the court submission documents",
		time: "10:30 AM",
	},
	{
		id: "m3",
		author: "me",
		attachment: {
			name: "Court_Submission.pdf",
			size: "1.8 MB",
		},
		time: "10:30 AM",
	},
];

const Messages = () => {
	const selected = useMemo(() => conversations[0], []);

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar />

			<main className="flex-1">
				<DashHeader title="Messages" subtitle="Chat with your lawyers" />

				<div className="p-6">
					<div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,26,61,0.08)] p-4 xl:p-6 min-h-[70vh]">
						<div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 xl:gap-6 h-full">
							{/* Conversation List */}
							<div className="flex flex-col border rounded-2xl border-gray-200 bg-white">
								<div className="p-4 border-b border-gray-200">
									<div className="relative">
										<Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
										<input
											type="text"
											placeholder="Search conversations..."
											className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
										/>
									</div>
								</div>

								<div className="flex-1 overflow-y-auto">
									{conversations.map((conv) => (
										<div
											key={conv.id}
											className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
												conv.id === selected.id ? "bg-gray-50" : ""
											}`}
										>
											<div className="relative">
												<img
													src={conv.avatar}
													alt={conv.name}
													className="w-12 h-12 rounded-full object-cover"
												/>
												{conv.online && (
													<span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
												)}
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between">
													<h4 className="font-semibold text-sm text-gray-900 truncate">
														{conv.name}
													</h4>
													<span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
														{conv.time}
													</span>
												</div>
												<p className="text-sm text-gray-600 truncate">{conv.subtitle}</p>
											</div>

											{conv.unread > 0 && (
												<span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F1A3D] text-white text-xs font-semibold">
													{conv.unread}
												</span>
											)}
										</div>
									))}
								</div>
							</div>

							{/* Chat Panel */}
							<div className="flex flex-col h-full border rounded-2xl border-gray-200 bg-white">
								{/* Chat header */}
								<div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
									<div className="flex items-center gap-3">
										<img
											src={selected.avatar}
											alt={selected.name}
											className="w-12 h-12 rounded-full object-cover"
										/>
										<div>
											<h4 className="font-semibold text-gray-900">{selected.name}</h4>
											<p className="text-sm text-gray-500 flex items-center gap-2">
												<span className="flex items-center gap-1">
													<span className="w-2 h-2 rounded-full bg-green-500" /> Online
												</span>
												<span className="text-gray-400">•</span>
												Property Law
											</p>
										</div>
									</div>
									<button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="More actions">
										<MoreVertical size={18} className="text-gray-500" />
									</button>
								</div>

								{/* Messages */}
								<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white">
									{chatThread.map((msg) => {
										const isMe = msg.author === "me";
										return (
											<div key={msg.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
												<div
													className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border ${
														isMe
															? "bg-blue-50 border-blue-100 text-gray-900"
															: "bg-white border-gray-200 text-gray-900"
													}`}
												>
													{msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
													{msg.attachment && (
														<div className="mt-2 flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
															<div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-gray-500">
																<FileText size={18} />
															</div>
															<div className="flex-1">
																<p className="text-sm font-medium text-gray-900">
																	{msg.attachment.name}
																</p>
																<p className="text-xs text-gray-500">{msg.attachment.size}</p>
															</div>
															<button
																className="p-2 rounded-full hover:bg-gray-200 transition"
																aria-label="Download attachment"
															>
																<Download size={16} className="text-gray-600" />
															</button>
														</div>
													)}
													<div className="text-xs text-gray-500 mt-2 text-right">{msg.time}</div>
												</div>
											</div>
										);
									})}
								</div>

								{/* Composer */}
								<div className="px-4 py-4 border-t border-gray-200 bg-white">
									<div className="flex items-center gap-3 rounded-full border border-gray-200 px-3 py-2.5 shadow-sm">
										<button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Attach file">
											<Paperclip size={18} className="text-gray-500" />
										</button>
										<input
											type="text"
											placeholder="Type a message..."
											className="flex-1 border-0 focus:ring-0 focus:outline-none text-sm"
										/>
										<button
											className="w-10 h-10 rounded-full bg-[#0F1A3D] text-white flex items-center justify-center hover:bg-blue-950 transition"
											aria-label="Send message"
										>
											<Send size={16} />
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Messages;
