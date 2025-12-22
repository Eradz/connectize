import React, { useState, useRef, useEffect } from 'react';

export default function Scroll({children}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabsRef = useRef(null);
  
  const tabs = ['Overview', 'Documents', 'Participants', 'Milestones', 'Activities', 'Run Valuation'];
  
  useEffect(() => {
    // Center active tab on mount and when it changes
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector('.tab-active');
      if (activeTabElement) {
        const tabLeft = activeTabElement.offsetLeft;
        const tabWidth = activeTabElement.offsetWidth;
        const containerWidth = tabsRef.current.offsetWidth;
        tabsRef.current.scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      }
    }
  }, [activeTab]);

  return (
      <div className="tabs-container">
        <div className="tabs-wrapper" ref={tabsRef}>
          {/* <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div> */}
          {children}
        </div>
      </div>
  );
}