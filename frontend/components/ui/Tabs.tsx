import React, { useState } from 'react';

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
  initialTab?: number;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {tabs[activeTab] && tabs[activeTab].content}
      </div>
    </div>
  );
};
