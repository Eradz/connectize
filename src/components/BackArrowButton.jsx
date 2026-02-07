import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const BackArrowButton = ({ className }) => {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      className={clsx("w-[15%] md:w-[6%] bg-white p-2 h-[50%] hover:bg-gray-100 rounded-lg transition-colors mb-4 md:mr-4", className)}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700" />
    </button>
  )
}

export default BackArrowButton