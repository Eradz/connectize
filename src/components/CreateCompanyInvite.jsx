import CreateCompanyIcon from '../icon/CreateCompany'
import { ArrowRightIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { webRoutes } from '../lib/webRoutes'
import { useAuth } from '../context/userContext'

const CreateCompanyInvite = () => {
  const { user } = useAuth();

  return (
    <Link to={webRoutes.createCompany} className="bg-gray-900 flex justify-between items-center rounded-lg px-2 cursor-pointer">
              <CreateCompanyIcon/>
              <div className="flex items-center justify-between">
                <span className="text-white text-[10px]">
                  <p>{user?.user_type === "company" ? "Create a Company" : "Update your Profile"}</p>
                  <p>{user?.user_type === "company" ? "Are you a company? click here to switch to a company account." : "Complete your user profile to get access to more features."}</p>
                </span>
                <ArrowRightIcon color="#ffffff" />
              </div>
          </Link>
  )
}


export default CreateCompanyInvite