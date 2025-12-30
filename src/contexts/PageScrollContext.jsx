import { createContext, useContext } from 'react';

const PageScrollContext = createContext(null);

export const PageScrollProvider = ({ value, children }) => (
  <PageScrollContext.Provider value={value}>
    {children}
  </PageScrollContext.Provider>
);

export const usePageScroll = () => {
  const context = useContext(PageScrollContext);
  if (!context) {
    throw new Error('usePageScroll must be used within a PageScrollProvider');
  }
  return context;
};

