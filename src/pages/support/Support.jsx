import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Support | Connectize",
    description: "Get help and support for Connectize. Browse FAQs, contact our team, and resolve any platform issues.",
  keywords: "support, help center, contact, FAQ, Connectize help",
  });

import React from 'react'
import * as Yup from "yup";
import { useFormik } from "formik";
import { validate } from 'uuid';
import Form from '../../components/form';
import { sendSupportMessage } from '../../api-services/support';
import { ImageSelect } from '../../components/form/customInput';

const validationSchema = Yup.object().shape({
  email: Yup.string()
  .email("Invalid Email Address")
  .required("Fill in a valid email address"),
  full_name: Yup.string().required("Add Full Name"),
  message: Yup.string().required("What do you need support with?").min(10),
  subject: Yup.string().optional(),
  images: Yup.mixed().optional()
})
const formValues = {
  email: "",
  full_name:"",
  message: "",
  subject:"",
  images: []
}
const Support = () => {
  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async({email,full_name,message,subject,images}, {resetForm}) =>{
      const success = await sendSupportMessage({email, full_name, message, subject, images, resetForm})
      if(success) {
        return
      }
    }
  })
  
  const fields = [
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter a valid email address",
      validate: true,
    },
    {
      name: "full_name",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your Full Name",
      validate: true,
    },
    {
      name: "subject",
      type: "text",
      label: "Subject (Optional)",
      placeholder: "Enter a subject to the topic",
      validate: false,
    },
    {
      name: "message",
      type: "textarea",
      label: "Message",
      placeholder: "What do you need support with?",
      validate: true,
    }
  ];
  return (
    <div className='bg-white rounded-lg p-6'>
      <Form
        formik={formik}
        status={"none"}
        inputArray={fields}
        bottomCustomComponents={
          <ImageSelect
       hasCaption={false}
       formik={formik}
       name="images"
       accept=".png, .jpeg"
       multiple={true}
     />
        }
        button={{
          type: "submit",
          text: "Send",
          submitText: "Sending...",
          style: "!md:w-[60%] mt-4",
        }}
      />
    </div>
  )
}

export default Support