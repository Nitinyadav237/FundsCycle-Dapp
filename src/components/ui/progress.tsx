export const Progress = ({ value, className = "" }: any) => (
  <div className={`w-full bg-gray-200 rounded-full ${className}`}>
    <div 
      className="bg-blue-600 h-full rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)