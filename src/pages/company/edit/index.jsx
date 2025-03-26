import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import { getSingleCompany } from "../../../api-services/companies";
import EditCompanyForm from "../../../components/company/form/edit-company";
import HeadingText from "../../../components/HeadingText";
import SEO from "../../../components/SEO";
import { useAuth } from "../../../context/userContext";

function EditCompanyPage() {
  const { company: companyName } = useParams();
  const { user: currentUser } = useAuth();

  const { data: company, isLoading } = useQuery({
    queryKey: ["companies", companyName],
    queryFn: () => getSingleCompany(companyName),
    enabled: !!companyName && !!currentUser,
  });
  return (
    <main className="min-h-[85vh]">
      <SEO
        title="Edit your Company Information | Connectize"
        description="Edit your company profile on Connectize, the leading social platform for the oil and gas industry. Showcase your business, connect with professionals, attract investors, and collaborate on industry projects. Build your network and grow your brand today!"
        relativeImagePath="create-company.png"
      />

      <HeadingText>Edit Company Information</HeadingText>
      <EditCompanyForm company={company} />
    </main>
  );
}

export default EditCompanyPage;
