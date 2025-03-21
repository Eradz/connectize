import { EllipsisOutlined } from "@ant-design/icons";
import {
  Button,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import clsx from "clsx";
import React from "react";

const MoreOptions = ({
  children,
  className,
  triggerStyle,
  isOpen,
  onOpen,
  onClose,
}) => {
  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>
        <Button
          className={clsx(
            "!bg-transparent shrink-0 !p-0 mt-1 !h-5",
            triggerStyle
          )}
        >
          <EllipsisOutlined />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={clsx("!p-2 !mb-1 !mx-2", className)}>
        <PopoverArrow />
        <div className="space-y-4"> {children}</div>
      </PopoverContent>
    </Popover>
  );
};

export default MoreOptions;
