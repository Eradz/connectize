import CreateCompanyIcon from '../icon/CreateCompany'
import { ArrowRightIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { webRoutes } from '../lib/webRoutes'


const CreateCompanyInvite = () => {
  return (
    <Link to={webRoutes.createCompany} className="bg-gray-900 flex justify-between items-center rounded-lg px-2 cursor-pointer">
              <CreateCompanyIcon/>
              <div className="flex items-center justify-between">
                <span className="text-white text-[10px]">
                  <p>Create a Company</p>
                  <p>Are you a company? click here to switch to a company account.</p>
                </span>
                <ArrowRightIcon color="#ffffff" />
              </div>
          </Link>
  )
}


export default CreateCompanyInvite