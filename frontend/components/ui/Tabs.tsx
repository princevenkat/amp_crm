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
        <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={`${activeTab === index
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                } whitespace-nowrap m-0 lg:py-4 px-4 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
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
