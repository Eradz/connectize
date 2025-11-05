import { SearchOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import React from 'react'
import Dropdown from '../../components/custom/Dropdown'

const dealRoomFilter = [
    {placeholder: "All Status", options: [{label: "All Status", value: "option-1"}, {label: "Option 2", value: "option-2"}]},
    {placeholder: "All Types", options: [{label: "All Types", value: "option-1"}, {label: "Option 2", value: "option-2"}]},
    {placeholder: "Newest First", options: [{label: "Newest First", value: "option-1"}, {label: "Option 2", value: "option-2"}]},
]
const dealRoom = () => {
  return (
    <div>
            <div className="bg-red-500 h-[20%] flex justify-between">
                <div>
                <h1 className='text-[40px]'>Deal Room</h1>
                <p className='text-[24px]'>Secure collaboration space for oil and gas deals</p>
                </div>
                <div className='bg-yellow-400 text-[20px]'>
                    + New Deal Room
                </div>
            </div>
            <div className='relative flex'> 
                <SearchOutlined className="absolute top-1/2 -translate-y-1/2 left-2.5 size-3 text-gray-400" />
                <input
                    type="search"
                    placeholder="Search Deal Rooms"
                    //   onKeyUp={handleSearch}
                    //   defaultValue={searchQuery}
                    className={"block w-full xs:!max-w-[250px] sm:!w-[400px] !max-w-[250px] py-1.5 px-3 border border-gray-200 bg-gray-100/70 rounded-full placeholder:text-xs text-sm focus:outline-0 focus:border-gold transition-all duration-300 indent-4"}
                />
            </div>
            {
                dealRoomFilter.map((filter, index) => (
                    <Dropdown
                        key={index}
                        placeholder={filter.placeholder}
                        options={filter.options}
                        onChange={(value, option) => {
                            console.log("Selected:", value, option);
                        }}
                    />
                ))
            }
    </div>
  )
}

export default dealRoom