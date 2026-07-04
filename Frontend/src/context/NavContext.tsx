import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export const NavbarContext = createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([false, () => undefined]);
export const NavbarColorContext = createContext<[string, React.Dispatch<React.SetStateAction<string>>]>(['white', () => undefined]);

type NavContextProps = {
  children: ReactNode;
};

const NavContext = ({ children }: NavContextProps) => {
  const [navColor, setNavColor] = useState('white');
  const [navOpen, setNavOpen] = useState(false);

  const locate = useLocation().pathname;
  useEffect(() => {
    if (locate === '/projects' || locate === '/agence') {
      setNavColor('black');
    } else {
      setNavColor('white');
    }
  }, [locate]);

  return (
    <div>
      <NavbarContext.Provider value={[navOpen, setNavOpen]}>
        <NavbarColorContext.Provider value={[navColor, setNavColor]}>
          {children}
        </NavbarColorContext.Provider>
      </NavbarContext.Provider>
    </div>
  );
};

export default NavContext;
