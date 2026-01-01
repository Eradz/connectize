import { RefreshCcw } from 'lucide-react'

const RefreshButton = ({ refreshActivities, active, loading }) => {
  return (
    <button
        onClick={() => refreshActivities({active})}
        disabled={loading}
        className="flex items-center px-3 py-2 bg-pale_yellow rounded-lg hover:bg-gold disabled:opacity-50 text-sm mb-1"
    >
        <RefreshCcw  className={`w-4 h-4 md:mr-1 ${loading ? "animate-spin" : ""}`} />
        <span className='hidden md:block'>{loading ? 'Loading...' : 'Refresh'}</span>
    </button>
  )
}

export default RefreshButton