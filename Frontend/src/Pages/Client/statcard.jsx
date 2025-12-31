const statCard = ({ icon, title, value, subtitle }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md flex items-center gap-4">
      <div className="p-3 rounded-lg bg-blue-100 text-blue-900">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-bold">{value}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default statCard;
