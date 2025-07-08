import React from 'react';

export default function RtlProvider({ children }) {
  React.useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.body.classList.add('rtl');
    
    return () => {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    };
  }, []);

  return <>{children}</>;
}