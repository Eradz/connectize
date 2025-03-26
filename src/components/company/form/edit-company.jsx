import { ErrorMessage, Field, Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import SEO from "../../SEO";

export default function EditCompanyForm({ company }) {
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
    city: Yup.string().required("City is required"),
    tag_line: Yup.string().optional(),
    organization_type: Yup.string().required("Organization type is required"),
  });

  const handleSubmit = (values) => {
    console.log("Updated Company Info:", values);
    // Add your update logic here
  };

  const listingFields = [
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
          name: "company_tagline",
          type: "text",
          label: "Company's tagline",
          placeholder: "E.g best in production...",
        },
        {
          name: "company_email",
          type: "email",
          label: "Company's email",
          placeholder: "E.g me@yourcompany.com",
        },
        {
          name: "company_website",
          type: "url",
          label: "Company's website",
          placeholder: "E.g https://www.yourcompany.com",
        },
        {
          name: "company_address",
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
          name: "city",
          type: "select",
          label: "Region/City",
          placeholder: "Select city",
          options: stateForCountry,
        },
        {
          name: "company_category",
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
          name: "company_size",
          type: "select",
          label: "Company's size",
          placeholder: "Select range",
          options: [
            "0-10 employees",
            "11-50 employees",
            "50 and above employees",
          ],
        },
        {
          name: "company_description",
          type: "textarea",
          label: "Short description",
          placeholder: "write a short description of your company here...",
        },
      ],
    },
  ];

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <label htmlFor="company_name">Company Name</label>
              <Field type="text" name="company_name" id="company_name" />
              <ErrorMessage
                name="company_name"
                component="div"
                className="error"
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <Field type="email" name="email" id="email" />
              <ErrorMessage name="email" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="about">About</label>
              <Field as="textarea" name="about" id="about" />
              <ErrorMessage name="about" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="website">Website</label>
              <Field type="url" name="website" id="website" />
              <ErrorMessage name="website" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="office_address">Office Address</label>
              <Field type="text" name="office_address" id="office_address" />
              <ErrorMessage
                name="office_address"
                component="div"
                className="error"
              />
            </div>
            <div>
              <label htmlFor="country">Country</label>
              <Field type="text" name="country" id="country" />
              <ErrorMessage name="country" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="state">State</label>
              <Field type="text" name="state" id="state" />
              <ErrorMessage name="state" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="city">City</label>
              <Field type="text" name="city" id="city" />
              <ErrorMessage name="city" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="tag_line">Tag Line</label>
              <Field type="text" name="tag_line" id="tag_line" />
              <ErrorMessage name="tag_line" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="organization_type">Organization Type</label>
              <Field
                type="text"
                name="organization_type"
                id="organization_type"
              />
              <ErrorMessage
                name="organization_type"
                component="div"
                className="error"
              />
            </div>
            <button type="submit" disabled={isSubmitting}>
              Update Company
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
}
