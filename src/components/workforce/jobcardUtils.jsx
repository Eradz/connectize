import { Eye, Users } from "lucide-react";

  export const getExperienceBadgeColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  export const formatSalary = (min, max, currency = 'USD') => {
    const formatAmount = (amount) => {
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
      return amount.toString();
    };

    if (min && max) {
      return `$${formatAmount(min)} - $${formatAmount(max)}`;
    } else if (min) {
      return `$${formatAmount(min)}+`;
    } else if (max) {
      return `Up to $${formatAmount(max)}`;
    }
    return 'Salary not specified';
  };
  export const JobCount = ({job, text}) => {
    return (
      <div className={`flex items-center space-x-1 text-[${text || '12px'}] text-gray-500`}>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {job.applications_count || 0} applicants
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {/* <DealIcon className="w-6 h-6" fill={"#ffffff"}/> */}
                    {job.views_count || 0} views
                  </div>
    </div>
    )
  }