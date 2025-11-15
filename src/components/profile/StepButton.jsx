import React from "react";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

function StepButton({
  nextStep = "contact",
  stepText = "Next",
  stepDirection = "next",
  doStepChange = async () => false,
  disabled = false,
}) {
  const navigate = useNavigate();
  return (
    <Button
      disabled={disabled}
      onClick={async () => {
        if (stepDirection === "back") {
          navigate(`/${nextStep}`);
          return;
        }

        const canMove = await doStepChange();

        if (canMove) navigate(`/${nextStep}`);
      }}
      className={clsx(
        "shadow-sm flex justify-center items-center gap-1 p-4 hover:opacity-60 transition-all duration-300",
        {
          "!bg-gold": stepDirection === "next",
          "flex-row-reverse !bg-custom_yellow": stepDirection === "back",
          "cursor-not-allowed bg-opacity-50": disabled,
        }
      )}
    >
      <span>{stepText}</span>
      {stepDirection === "next" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
    </Button>
  );
}

export default StepButton;
