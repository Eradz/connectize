import React from 'react'

const EmptyDealRoom = () => {
  return (
    <div className='flex flex-col items-center text-center py-10'>
      <BigDealRoom />
      <span className='text-[#6C757D]'>
        <p className='text-2xl font-normal'>No Deal room found</p>
        <p>Get started by creating your first deal room</p>
      </span>
    </div>
  )
}

export default EmptyDealRoom