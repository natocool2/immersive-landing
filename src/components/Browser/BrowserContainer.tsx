import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrowserTab } from "./BrowserTab";
import { BrowserFrame } from "./BrowserFrame";

interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

export const BrowserContainer = () => {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<Tab[]>([
    { 
      id: '1', 
      url: 'https://duckduckgo.com', 
      title: 'DuckDuckGo',
      favicon: 'https://duckduckgo.com/favicon.ico'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  const createNewTab = useCallback(() => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: 'https://duckduckgo.com',
      title: 'Nova Aba',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (newTabs.length === 0) {
        // Create a new tab if all tabs are closed
        const newTab: Tab = {
          id: Date.now().toString(),
          url: 'https://duckduckgo.com',
          title: 'Nova Aba',
        };
        return [newTab];
      }
      return newTabs;
    });

    // If closing active tab, switch to another tab
    if (activeTabId === tabId) {
      setTabs(prev => {
        const newTabs = prev.filter(tab => tab.id !== tabId);
        if (newTabs.length > 0) {
          const newActiveTab = newTabs[newTabs.length - 1];
          setActiveTabId(newActiveTab.id);
        } else {
          // This will be handled by the effect above
          setActiveTabId(Date.now().toString());
        }
        return prev;
      });
    }
  }, [activeTabId]);

  const updateTabUrl = useCallback((tabId: string, url: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, url } : tab
    ));
  }, []);

  const updateTabTitle = useCallback((tabId: string, title: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, title } : tab
    ));
  }, []);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex flex-col h-screen bg-black/40 backdrop-blur-lg">
      {/* Tab Bar */}
      <div className="flex items-end gap-1 px-4 pt-4 bg-black/20">
        {/* Back to Home Button */}
        <motion.button
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white mr-4 mb-2"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Voltar à página inicial"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <AnimatePresence mode="popLayout">
          {tabs.map((tab) => (
            <BrowserTab
              key={tab.id}
              id={tab.id}
              title={tab.title}
              url={tab.url}
              favicon={tab.favicon}
              isActive={tab.id === activeTabId}
              onActivate={() => setActiveTabId(tab.id)}
              onClose={() => closeTab(tab.id)}
            />
          ))}
        </AnimatePresence>
        
        {/* New Tab Button */}
        <motion.button
          className="p-2 hover:bg-white/10 rounded-t-lg transition-colors ml-2"
          onClick={createNewTab}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4 text-white/60" />
        </motion.button>
      </div>

      {/* Browser Content */}
      <div className="flex-1 p-4 pt-0">
        {activeTab && (
          <BrowserFrame
            key={activeTab.id}
            url={activeTab.url}
            onUrlChange={(url) => updateTabUrl(activeTab.id, url)}
            onTitleChange={(title) => updateTabTitle(activeTab.id, title)}
            isActive={true}
          />
        )}
      </div>
    </div>
  );
};