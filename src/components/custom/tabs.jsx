import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import clsx from "clsx";
import React from "react";

export const appGoldColor = "#F1C644";

export default function CustomTabs({
  tabsHeading,
  tabsPanels,
  tabListStyle,
  tabPanelsStyle,
  className,
  selectedStyle,
  tabsStyle = "w-full rounded-full font-medium !text-xs lg:!text-sm text-nowrap",
  variant = "solid-rounded",
}) {
  const getSelectedStyle = (variant) => {
    switch (variant) {
      case "solid-rounded":
        return { color: "black", bg: appGoldColor };
      case "outline":
        return { color: appGoldColor, borderColor: appGoldColor };
      case "unstyled":
        return {
          color: "black",
          borderBottom: `2px solid ${appGoldColor}`,
        };

      default:
        return { color: "black", bg: appGoldColor };
    }
  };

  const getInactiveStyle = (variant) => {
    switch (variant) {
      case "solid-rounded":
        return "";
      case "outline":
        return "";
      case "unstyled":
        return "text-gray-400";

      default:
        return "";
    }
  };

  return (
    <Tabs variant={variant} className={clsx("space-y-4 !relative", className)}>
      <TabList
        className={clsx("gap-1 !overflow-x-auto overflow-hidden", tabListStyle)}
      >
        {tabsHeading.map((item, index) => (
          <Tab
            key={index}
            className={clsx("w-full", tabsStyle, getInactiveStyle(variant))}
            _selected={selectedStyle || getSelectedStyle(variant)}
          >
            {item}
          </Tab>
        ))}
      </TabList>

      <TabPanels className={clsx("!w-full", tabPanelsStyle)}>
        {tabsPanels.map((panels, index) => (
          <TabPanel className={clsx("!p-0 !w-full")} key={index}>
            {panels}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
