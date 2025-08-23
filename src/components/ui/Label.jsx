import React from 'react';
import { clsx } from 'clsx';

const Label = React.forwardRef(({ 
  htmlFor,
  className,
  children,
  ...props 
}, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={clsx(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";

export { Label };
