import { Input } from "@chakra-ui/react";
import clsx from "clsx";
import { inputClassNames } from "./customInput";

export default function PhoneInput({
  placeholder,
  onChange,
  onBlur,
  value,
  name,
  className,
  validate,
  error,
}) {
  const handleChange = (e) => {
    let inputValue = e.target.value;
    
    // Allow: digits, spaces, hyphens, parentheses, and the + symbol
    // Remove any characters that aren't these
    inputValue = inputValue.replace(/[^\d\s\-\(\)\+]/g, '');
    
    // Create a synthetic event with the cleaned value
    // Note: spread on DOM elements doesn't copy prototype properties like 'name',
    // so we must explicitly include name for formik.handleChange to work
    const syntheticEvent = {
      target: {
        name: name,
        value: inputValue,
      },
    };
    
    onChange(syntheticEvent);
  };

  return (
    <div className="relative w-full">
      <Input
        autoComplete="tel"
        className={clsx(className, inputClassNames, "focus:!outline-none", {
          "!border-green-800 !bg-green-50/50": validate && !error,
          "!border-[#9e3818] !bg-[#9e3818]/5 animate-shake": error,
        })}
        type="tel"
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        value={value}
        id={name}
        name={name}
        inputMode="tel"
      />
    </div>
  );
}
