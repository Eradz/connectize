import {
  first_nameKey,
  last_nameKey,
  genderKey,
  ageKey,
  website_urlKey,
  social_media_urlKey,
  personal_emailKey,
  phone_numberKey,
  nationalityKey,
  stateKey,
  cityKey,
  roleKey,
  company_addressKey,
  postal_codeKey,
  bioKey,
} from ".";
import { getLocalData } from "../helpers/overview";

/* 

User payload PUT

{
    "id": 22,
    "first_name": null,
    "last_name": null,
    "email": "crushclever1@gmail.com",
    "gender": null,
    "date_of_birth": null,
    "bio": null,
    "role": null,
    "company": null,
    "verified": false,
    "country": null,
    "city": null,
    "phone_number": null,
    "region": null,
    "address": null,
    "avatar": null,
    "companies": []
}

*/

export const overviewFields = [
  {
    type: "grid",
    disabled: true,
    gridInputs: [
      {
        name: genderKey,
        type: "text",
        label: "Gender",
        placeholder: "Male/Female",
      },

      {
        name: ageKey,
        type: "date",
        label: "Age",
        placeholder: "What is your role as a representative",
      },
      {
        name: phone_numberKey,
        type: "tel",
        label: "Phone Number",
        placeholder: "Phone number",
      },
      {
        name: personal_emailKey,
        type: "email",
        label: "Personal Email",
        placeholder: "example@personal_email.com",
      },
      {
        name: website_urlKey,
        type: "text",
        label: "Website link",
        placeholder: "westlandoil.com",
      },
      {
        name: social_media_urlKey,
        type: "text",
        label: "Social media link",
        placeholder: "e.g linkedin",
      },
    ],
  },
];

/**
 * @type {ProfileOverviewFields}
 */
export const overviewFormValues = {
  first_name: getLocalData(first_nameKey),
  last_name: getLocalData(last_nameKey),
  gender: getLocalData(genderKey),
  age: getLocalData(ageKey),
  phone_number: getLocalData(phone_numberKey),
  personal_email: getLocalData(personal_emailKey),
  website_url: getLocalData(website_urlKey),
  social_media_url: getLocalData(social_media_urlKey),
  nationality: getLocalData(nationalityKey),
  state: getLocalData(stateKey),
  city: getLocalData(cityKey),
  company_address: getLocalData(company_addressKey),
  postal_code: getLocalData(postal_codeKey),
  role: getLocalData(roleKey),
  bio: getLocalData(bioKey),
  image: "",
};
