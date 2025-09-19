import React from 'react'
import * as Yup from "yup";
import { useFormik } from "formik";
import { validate } from 'uuid';
import Form from '../../components/form';

const validationSchema = Yup.object().shape({
  email: Yup.string()
  .email("Invalid Email Address")
  .required("Fill in a valid email address"),
  full_name: Yup.string().required("Add Full Name"),
  message: Yup.string().required("What do you need support with?").min(10),
  subject: Yup.string().optional(),
})
const formValues = {
  email: "",
  full_name:"",
  message: "",
  subject:"",
  image: ""
}
const Support = () => {
  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async({email,full_name,message,subject,image}, {resetForm}) =>{
      const success = true
  
      if(success) {
        return
      }
    }
  })
  
  const fields = [
    {
      name: "email",
      type: "email",
      label: "User email",
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
      label: "Subject",
      placeholder: "Enter a subject to the topic (Optional)",
      validate: false,
    },
    {
      name: "message",
      type: "textarea",
      label: "Message",
      placeholder: "What do you need support with?",
      validate: true,
    },
    {
      name: "images",
      type: "file",
      label: "Image",
      placeholder: "Upload an image for the issue (Optional)",
      validate: false
    }
  ];
  return (
    <div className='bg-white rounded-lg p-6'>
      <Form
        formik={formik}
        status={"none"}
        inputArray={fields}
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