import { Button } from "@chakra-ui/react";

function PrimaryButton({ children = "Button text", ...rest }) {
  return (
    <Button
      className="!bg-gold w-fit !px-10 !py-1.5 !h-fit !rounded-full transition-all duration-300 active:scale-95 !text-sm hover:!bg-opacity-50 !min-w-[100px]"
      {...rest}
    >
      {children}
    </Button>
  );
}

export default PrimaryButton;
