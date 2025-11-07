import { SearchOutlined } from '@ant-design/icons'
import Dropdown from '../../components/custom/Dropdown'
import GridIcon from '../../icon/GridIcon'
import ListIcon from '../../icon/ListIcon'
import BigDealRoom from '../../icon/BigDealRoom'

const dealRoomFilter = [
    {placeholder: "All Status", options: [{label: "All Status", value: "option-1"}, {label: "Option 2", value: "option-2"}]},
    {placeholder: "All Types", options: [{label: "All Types", value: "option-1"}, {label: "Option 2", value: "option-2"}]},
    {placeholder: "Newest First", options: [{label: "Newest First", value: "option-1"}, {label: "Option 2", value: "option-2"}]},
]
const dealRoom = () => {
  return (
    <div className="py-8 ">
        <div>
            <div className="h-[20%] flex justify-between gap-2">
                <div>
                <h1 className='text-[40px]'>Deal Room</h1>
                <p className='text-[24px]'>Secure collaboration space for oil and gas deals</p>
                </div>
                <div className='bg-[#FFE7A4] py-[10px] px-3 text-[20px] rounded-[10px] h-[50px]'>
                    + New Deal Room
                </div>
            </div>
            <div className='flex w-full gap-2'> 
                <div className='relative w-[30%] flex '>
                <SearchOutlined className="absolute top-1/2 -translate-y-1/2 left-2.5 size-3 text-gray-400" />
                <input
                    type="search"
                    placeholder="Search Deal Rooms"
                    //   onKeyUp={handleSearch}
                    //   defaultValue={searchQuery}
                    className={"block xs:!max-w-[250px] sm:!w-[400px] !max-w-[250px] py-1.5 px-3 border border-gray-200 bg-white rounded-sm placeholder:text-xs text-sm focus:outline-0 focus:border-gold transition-all duration-300 indent-4"}
                />
                </div>
                    {
                        dealRoomFilter.map((filter, index) => (
                            <Dropdown
                                key={index}
                                width='80%'
                                className='mr-[-35px]'
                                placeholder={filter.placeholder}
                                options={filter.options}
                                onChange={(value, option) => {
                                    console.log("Selected:", value, option);
                                }}
                            />
                        ))
                    }
                <div className='flex justify-between items-center bg-white px-3 w-full'>
                    <div className='flex items-center gap-1 cursor-pointer'>
                        <GridIcon />
                        <span>Grid</span>
                    </div>
                    <span className='w-[1px] h-[23px] bg-[#00000033]'></span>
                    <div className='flex items-center gap-1 cursor-pointer'>
                        <ListIcon />
                        <span>List</span>
                    </div>
                </div>
            </div>
                    <div className='flex flex-col items-center text-center py-10'>
                        <BigDealRoom />
                        <span className='text-[#6C757D]'>
                            <p className='text-2xl font-normal'>No Deal room found</p>
                            <p>Get started by creating your first deal room</p>
                        </span>
                    </div>
        </div>
    </div>
  )
}

export default dealRoom