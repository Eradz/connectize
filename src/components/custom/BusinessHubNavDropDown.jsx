import { useState } from 'react';
import { webRoutes } from '../../lib/webRoutes';
import PlatformDashboardIcon from "../../icon/PlatformDashoardIcon"
import BriefCaseIcon  from '../../icon/briefCaseIcon';
import AISecondIcon from "../../icon/AISecondIcon"
import LogisticIcon from "../../icon/LogisticIcon"
import {ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { Link } from "react-router-dom";
import {DealIcon} from '../../icon/deal';
import {OuterBusinessHub} from "../../icon/BusinessHub";

const BusinessHubDropDown = () => {

const [isOpen, setIsOpen] = useState(false);
 const feedNavItems = [
    { name: "Platform Dashboard",
      to: webRoutes.dashboard,
      icon: <PlatformDashboardIcon/>,
      excerpt: "Overview of Platform Activities"
    },
    {
      name: "Deal Room",
      to: webRoutes.dealRoom,
      icon: <DealIcon width={36} height={36} fill="#F8F9FA"/>,
      excerpt: "Manage Oil and Gas Deals",
    },
    {
      name: "Workforce",
      to: webRoutes.workforce,
      icon: <BriefCaseIcon width={36} height={36} fill="#F8F9FA"/>,
      excerpt: "Job marketplace and event",
    },
    {
      name: "Ai services",
      to: webRoutes.aiServices,
      icon: <AISecondIcon width={36} height={36}/>,
      excerpt: "Ai powered insights",
    },
    {
      name: "Logistics Hub",
      to: webRoutes.logisticsHub,
      icon: <LogisticIcon width={36} height={36} fill="#F8F9FA"/>,
      excerpt: "Supply chain management",
    }
  ];
  return (

    <div className='bg-white'>


     <div className='hover:bg-gray-200' onClick={()=> setIsOpen(!isOpen)}>
              <Link to={webRoutes.businessHub} className="flex items-center justify-between p-2 py-2.5">
                <div className="flex items-center gap-2">
                  <span><OuterBusinessHub width={36} height={36} fill="#F8F9FA"/></span>
                  <div className="">
                    <span>Business Hub</span>
                  </div>
                </div>
                {isOpen ? <ChevronUpIcon/> : <ChevronDownIcon />}
              </Link>   
          </div>


      {isOpen && feedNavItems.map((item, index) => {
        return (
          <div className='hover:bg-gray-200'>
              <Link to={item.to} key={index} className="flex items-center justify-between p-2 py-2.5">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <div className="">
                    <span>{item.name}</span>
                    <p className='text-[12px]'>{item.excerpt}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUpIcon/> : <ChevronDownIcon />}
              </Link>   
          </div>
        )
      })}
    </div>
  )
}

export default BusinessHubDropDown