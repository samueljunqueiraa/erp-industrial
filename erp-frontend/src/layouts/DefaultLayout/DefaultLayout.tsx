import React, { useState, useCallback } from 'react';
import styles from './DefaultLayout.module.css';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Header } from '../../components/Header/Header';
import { Outlet } from 'react-router-dom';

export const DefaultLayout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.body.classList.toggle('dark', next);
      return next;
    });
  }, []);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Header onToggleTheme={handleToggleTheme} isDarkMode={isDarkMode} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
