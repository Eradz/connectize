import HeadingText from "../../HeadingText";
import Form from "../../form";
import * as Yup from "yup";
import { useFormik } from "formik";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { createService } from "../../../api-services/services";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "../../../icon";

const validationSchema = Yup.object().shape({
  //   image_1: Yup.mixed()
  //     .required("Please select an image")
  //     .test("file-size", largeFileText, checkFileSize)
  //     .test("file-format", unSupportedText, checkFileFormat),
  //   image_2: Yup.mixed()
  //     .optional()
  //     .test("file-size", largeFileText, checkFileSize)
  //     .test("file-format", unSupportedText, checkFileFormat),
  //   image_3: Yup.mixed()
  //     .optional()
  //     .test("file-size", largeFileText, checkFileSize)
  //     .test("file-format", unSupportedText, checkFileFormat),
  //   image_4: Yup.mixed()
  //     .optional()
  //     .test("file-size", largeFileText, checkFileSize)
  //     .test("file-format", unSupportedText, checkFileFormat),
  //   image_caption1: Yup.string().optional(),
  //   image_caption2: Yup.string().optional(),
  //   image_caption3: Yup.string().optional(),
  //   image_caption4: Yup.string().optional(),
  service_title: Yup.string()
    .max(250, "Should not be more that 250 characters")
    .required("Field cannot be empty"),
  service_category: Yup.string().required("Field cannot be empty"),
  service_description: Yup.string()
    .max(1450, "Should not be more that 1450 characters")
    .required("Field cannot be empty"),
  service_subtitle: Yup.string()
    .max(450, "Should not be more that 450 characters")
    .required("Field cannot be empty"),
});

const fields = [
  {
    type: "grid",
    gridInputs: [
      {
        name: "service_title",
        type: "text",
        label: "Service Title",
        placeholder: "Should not be more that 250 characters",
      },

      {
        name: "service_category",
        type: "select",
        label: "Choose Category",
        placeholder: "Service type",
        options: [
          "AVIATION SUPPORT SERVICES",
          "CALIBRATION SERVICES",
          "OFFSHORE PIPELINE LAYING",
          "MAJOR CONSTRUCTION SERVICES",
          "DRILLING/PRODUCTION SERVICES",
          "EXPLORATION",
          "TECHNICAL CONSULTANCY",
          "SPECIAL TRANSPORTATION SERVICES",
          "DREDGING SERVICE",
          "WASTE MANAGEMENT SERVICES",
          "UNDERWATER INSPECTION & SERVICES",
          "HOSPITAL/MEDICAL",
          "HEAVY DUTY EQUIPMENT SUPPLY",
          "INSTALLATION & MAINTENANCE SERVICES",
          "COMMUNICATION SERVICES",
          "BANKING/FINANCIAL SERVICES",
          "INTERNATIONAL FREIGHT/CLEARING AND FORWARDING",
          "INSURANCE",
          "AUTOMOBILE SERVICES",
          "HYPERBARIC SERVICES",
          "HOSPITALITY SERVICES",
          "MANUFACTURING SERVICES",
          "ENVIRONMENTAL RESTORATION SERVICES",
          "LOCAL GAS DISTRIBUTION SERVICES",
          "ROPE ACCESS",
          "SPECIALISED OIL AND GAS TRAINING SERVICES",
          "ONSHORE PIPELINE LAYING",
          "HEAVY EQUIPMENT HIRE & LEASING ONLY",
          "FACILITY MAINTENANCE SERVICES",
          "INCINERATOR AND TDU",
          "POLLUTION CONTROL",
          "OIL AND GAS TRADING",
          "SUBSURFACE / RESERVOIR MANAGEMENT",
          "LABORATORY SERVICES",
          "HYDROCARBON MEASUREMENT",
          "SUPPLY OF CATALYST AND CHEMICALS",
          "FPSO/FLNG/FLPG SERVICES",
          "FLOATING, STORAGE AND OFFLOADING (FSO)",
          "MOBILE OFFSHORE PRODUCTION UNIT (MOPU) /OFFSHORE PROCESSING UNIT (OPU)",
          "NATURALLY OCCURRING RADIOACTIVE MATERIALS (NORM) MANAGEMENT SERVICES",
          "WASTE MANAGEMENT FACILITY OPERATIONS SERVICES",
          "ROBOTIC UNDERWATER SERVICES",
          "MARINE SERVICES/INSTALLATION",
          "FINANCIAL SERVICES",
          "REFINERY SERVICES",
          "PETROCHEMICAL PLANT",
          "OIL AND GAS TRAINING",
          "ENGINEERING DESIGN/SUPPORT SERVICES",
          "DECOMMISSIONING SERVICES",
          "CERTIFICATION SERVICES",
          "3RD PARTY FPSO/ FSO LEASING AND OPERATION SERVICES",
          "LAB, SAFETY & CHEMICAL SUPPLIES SERVICES",
          "CHEMICAL PRODUCTION SERVICES",
          "DIVING SERVICES",
          "Welding",
          "Plumbing",
          "Painting",
          "Photography Mechanical And Civil Maintenance",
          "Equipment/Material Supply",
          "Water Borehole",
          "Protocol And Logistics",
          "Laboratory",
          "Onshore Waste Management ",
          "Survey",
          "Integrity Test",
          "Haulage  ",
          "Medical/Pharmaceutical",
          "Hospitality",
          "Printing",
          "Automobile",
          "Installation And Maintenance",
          "Chemical/Mud Testing",
          "Consultancy",
          "Storage /Preservation",
          "Petroleum Quality Monitoring",
          "Environmental Quality Monitoring",
        ],
      },
      {
        name: "service_subtitle",
        type: "textarea",
        label: "Summary of service",
        placeholder: "Should not be more than 450 characters",
      },
      {
        name: "service_description",
        type: "textarea-md",
        label: "Short description",
        placeholder: "Should not be more than 1450 characters",
      },
      // {
      //   name: "company",
      //   type: "select",
      //   label: "Select company",
      //   placeholder: "Select company to attach service to",
      //   options: companies?.map((company) => company?.company_name),
      // },
    ],
  },
];

export default function ServiceAdminMain({ serviceToEdit }) {
  const navigate = useNavigate();

  const editId = serviceToEdit?.id;

  const initialValues = {
    service_title:
      serviceToEdit?.title || localStorage.getItem("service_title") || "",
    service_category:
      serviceToEdit?.category?.toUpperCase() ||
      localStorage.getItem("service_category") ||
      "",
    service_description:
      serviceToEdit?.description ||
      localStorage.getItem("service_description") ||
      "",
    service_subtitle:
      serviceToEdit?.sub_title ||
      localStorage.getItem("service_subtitle") ||
      "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const service = await createService(values, resetForm, editId);
      if (service) {
        for (let value in values) {
          localStorage.removeItem(value);
        }

        navigate("/services");
        return;
      }
    },
  });

  useEffect(() => {
    document.title = editId
      ? "Update a Service in Connectize"
      : "Add a New Service in Connectize";
    formik.setValues(initialValues);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section>
      <div className="bg-white p-3 rounded-md space-y-4 mb-8">
        <div className="flex items-center">
          {editId && (
            <Link
              to={`/services/${editId}`}
              className="mr-2 flex items-center justify-center rounded-full size-8 bg-light_grey/50"
            >
              <ArrowLeft className={"size-6"} />
            </Link>
          )}
          <HeadingText>
            {serviceToEdit ? "Edit Service" : "List new Services"}
          </HeadingText>

          {/* <Close /> */}
        </div>

        <Form
          formik={formik}
          gridClassName={"grid-cols-1 xl:grid-cols-2 gap-x-3"}
          status={"none"}
          inputArray={fields}
          button={{
            type: "submit",
            text: serviceToEdit ? "Edit Service | " : "Add service  | ",
            icon: <ChevronRightIcon />,
            submitText: serviceToEdit
              ? "Editing service..."
              : "Adding service...",
            style: "!w-fit mt-10 text-sm",
          }}
        />
      </div>
    </section>
  );
}
