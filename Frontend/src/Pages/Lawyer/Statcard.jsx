const StatCard = ({ icon, title, value, subtitle, className = "", onClick }) => {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`bg-white rounded-xl p-5 shadow-md flex items-center gap-4 ${className}`.trim()}
    >
      <div className="p-3 rounded-lg bg-[#0F1A3D] text-white">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-bold">{value}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </div>
    </Wrapper>
  );
};

export default StatCard;