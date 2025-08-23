import React, { createContext, useContext, useState } from 'react';
import clsx from 'clsx';

// Context for managing tab state
const TabsContext = createContext();

const Tabs = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className = "",
  orientation = "horizontal",
  ...props 
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);
  
  const currentValue = value !== undefined ? value : activeTab;
  
  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue = {
    value: currentValue,
    onValueChange: handleValueChange,
    orientation
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div 
        className={clsx(
          orientation === "vertical" ? "flex" : "",
          className
        )} 
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = "", ...props }) => {
  const { orientation } = useContext(TabsContext);
  
  return (
    <div
      className={clsx(
        "inline-flex items-center justify-start",
        orientation === "horizontal" 
          ? "h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 space-x-1" 
          : "flex-col h-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-1 space-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ 
  value, 
  children, 
  disabled = false, 
  className = "",
  ...props 
}) => {
  const { value: activeValue, onValueChange, orientation } = useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        orientation === "horizontal" 
          ? "rounded-md px-3 py-1.5 min-w-[80px]" 
          : "rounded-md px-3 py-2 w-full text-left",
        isActive
          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ 
  value, 
  children, 
  className = "",
  forceMount = false,
  ...props 
}) => {
  const { value: activeValue } = useContext(TabsContext);
  const isActive = activeValue === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      className={clsx(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !isActive && forceMount && "hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
