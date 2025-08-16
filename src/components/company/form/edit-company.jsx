import { Button } from "@chakra-ui/react";
import { getCountries } from "@loophq/country-state-list";
import { UpdateIcon } from "@radix-ui/react-icons";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import * as Yup from "yup";
import { editCompanyInformation } from "../../../api-services/companies";
import cities from "../../../lib/data/cities.json";
import Form from "../../form";
import ProfileSection from "../../userProfile/profile-section";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function EditCompanyForm({ company }) {
  const countries = getCountries();

  const navigate = useNavigate();

  const initialValues = {
    company_name: company?.company_name || "",
    email: company?.email || "",
    about: company?.about || "",
    website: company?.website || "",
    office_address: company?.office_address || "",
    country: company?.country || "",
    state: company?.state || "",
    city: company?.city || "",
    tag_line: company?.tag_line || "",
    organization_type: company?.organization_type || "",
  };

  const validationSchema = Yup.object({
    company_name: Yup.string().required("Company name is required"),
    email: Yup.string().email("Invalid email address").optional(),
    about: Yup.string().optional(),
    website: Yup.string().url("Invalid website URL").optional(),
    office_address: Yup.string().optional(),
    country: Yup.string().required("Country is required"),
    state: Yup.string().required("State is required"),
    city: Yup.string().optional(),
    tag_line: Yup.string().optional(),
    organization_type: Yup.string().required("Organization type is required"),
  });

  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const handleSubmit = async () => {
    setLoading(true);

    const toastId = toast.loading("Updating company information");

    try {
      await editCompanyInformation(formik.values);

      toast.success("Updated profile information Successfully", {
        id: toastId,
      });

      // if (update.id) {
      //   navigate(`/${update.company_name}`);
      // }
    } catch (err) {
      toast.error("Failed to update profile information", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const countriesString = countries.map((country) => country.name);

  const stateForCountry =
    countries.find((country) => country.name === formik.values["country"])
      ?.states || [];

  //     const countryName = formik.values["country"]
  //     const stateName = formik.values['state']

  // const {data: citiesFor, isLoading: isLoadingGetCitiesForState} = useQuery({
  //   queryKey: ["cities", {countryName,stateName }],
  //   queryFn: async () => {
  //     try {
  //       const res=      await axios.get(process.env.NODE_ENV=== "production" ? "" : "http://192.168.8.101:6000",{params:{countryName,stateName}})

  //       return res.data || []
  //     } catch (error) {
  //       toast.error("Could not get list of cities for " + stateName + " " + countryName)
  //       throw error
  //     }
  //   }
  // })

  const citiesForState =
    cities
      .filter((city) => city.state_name === formik.values["state"])
      .map((city) => city.name) || [];

  const companyFields = [
    {
      type: "grid",
      gridInputs: [
        {
          name: "company_name",
          type: "text",
          label: "Company's Name",
          placeholder: "E.g The Large Company",
        },
        {
          name: "tag_line",
          type: "text",
          label: "Company's tagline",
          placeholder: "E.g best in production...",
        },
        {
          name: "email",
          type: "email",
          label: "Company's email",
          placeholder: "E.g me@yourcompany.com",
        },
        {
          name: "website",
          type: "url",
          label: "Company's website",
          placeholder: "E.g https://www.yourcompany.com",
        },
        {
          name: "office_address",
          type: "text",
          label: "Office Address",
          placeholder: "E.g 24 Larkin Smith, Eket Akwa Ibom State",
        },
        {
          name: "country",
          type: "select",
          label: "Country",
          placeholder: "Select country",
          options: countriesString,
        },
        {
          name: "state",
          type: "select",
          label: "State",
          placeholder: "Select state",
          options: stateForCountry,
        },
        {
          name: "city",
          type: "select",
          label: "Region/City",
          placeholder: "Select city",
          options: citiesForState,
        },
        {
          name: "organization_type",
          type: "select",
          label: "Company type",
          placeholder: "Select company type",
          options: [
            "Drilling Contractor Company",
            "Integrated Oil & Gas Company",
            "Independent Oil & Gas Company",
            "Oil Service Company",
            "Oil Equipment Manufacturer",
            "Media Company",
            "Security",
            "Renewable Energy Company",
            "Oil Refining",
          ],
        },

        {
          name: "about",
          type: "textarea",
          label: "Short description",
          placeholder: "write a short description of your company here...",
        },
      ],
    },
  ];

  useEffect(() => {
    formik.setValues(initialValues);
  }, [!!company]);

  return (
    <ProfileSection title="">
      <Form
        formik={formik}
        status={"none"}
        inputArray={companyFields}
        hasButton={false}
      />

      <div className="flex justify-between mb-6 mt-20">
        <div></div>
        <Button
          className="!bg-gold hover:!bg-opacity-60"
          disabled={loading}
          onClick={handleSubmit}
          leftIcon={<UpdateIcon className={loading ? "animate-spin" : ""} />}
        >
          Update Information
        </Button>
      </div>
    </ProfileSection>
  );
}
