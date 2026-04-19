import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import { 
  Bell, HelpCircle, Sun, Moon, UserPlus, ShoppingCart, Package, Sparkles, Menu, Plus 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import logoBranca from '../../assets/logo-branca.svg';

interface HeaderProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleTheme, isDarkMode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const newRecordRef = useRef<HTMLDivElement>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  
  const [notifications] = useState([
    { id: 1, text: 'Venda realizada' },
    { id: 2, text: 'Despesa lançada' },
  ]);
  const unreadCount = notifications.length;

  const initials = user?.name
    ? (user.name.trim().split(' ').length >= 2
        ? (user.name.trim().split(' ')[0][0] + user.name.trim().split(' ')[1][0])
        : user.name.substring(0, 2)
      ).toUpperCase()
    : 'US';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newRecordRef.current && !newRecordRef.current.contains(event.target as Node)) {
        setShowNewCard(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowNewCard(false);
  };

  // --- MÁGICA DA RESPONSIVIDADE ---
  // Esse evento avisa a Sidebar para abrir ou fechar
  const toggleMobileMenu = () => {
    window.dispatchEvent(new Event('toggleMobileMenu'));
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* NOVO: Botão Hambúrguer (Aparece só no Mobile) */}
        <button className={styles.hamburgerBtn} onClick={toggleMobileMenu}>
          <Menu color={isDarkMode ? '#ffffff' : '#0F172A'} size={26} />
        </button>
        <img src={isDarkMode ? logoBranca : logo} alt="Splindid." className={styles.logo} />
      </div>
      
      <div className={styles.center}>
        <div className={styles.searchBar} onClick={() => navigate('/agent')}>
          <Sparkles className={styles.searchIcon} size={20} color="#193782" />
          <input 
            className={styles.searchInput} 
            placeholder="Pergunte ao Agente Splindid..." 
            readOnly 
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      <div className={styles.right}>
        <button className={`${styles.iconBtn} ${styles.notification}`}>
          <span style={{ position: 'relative', display: 'flex' }}>
            <Bell color={isDarkMode ? '#0F172A' : '#ffffff'} size={22} />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </span>
        </button>

        {/* Adicionada a classe hideOnMobile para esconder a ajuda na tela pequena */}
        <a href="#" className={`${styles.iconBtn} ${styles.help} ${styles.hideOnMobile}`} style={{ display: 'flex', alignItems: 'center' }}>
          <HelpCircle color="#0F172A" size={22} />
        </a>

        <div style={{ position: 'relative', display: 'inline-block' }} ref={newRecordRef}>
          <button
            className={isDarkMode ? `${styles.newRecordBtn} ${styles.newRecordBtnDark}` : styles.newRecordBtn}
            onClick={() => setShowNewCard(!showNewCard)}
          >
            <span className={styles.btnTextDesktop}>+ Novo Registro</span>
            <span className={styles.btnTextMobile}><Plus size={20} /></span>
          </button>
          
          {showNewCard && (
            <div className={isDarkMode ? `${styles.newRecordCard} ${styles.newRecordCardDark}` : styles.newRecordCard}>
              <button className={styles.newRecordOption} onClick={() => handleNavigate('/config/usuarios')}>
                <UserPlus size={22} color={isDarkMode ? '#ffffff' : '#0F172A'} /><span>Novo Usuário</span>
              </button>
              <button className={styles.newRecordOption} onClick={() => handleNavigate('/comercial/pedido')}>
                <ShoppingCart size={22} color={isDarkMode ? '#ffffff' : '#0F172A'} /><span>Novo Pedido</span>
              </button>
              <button className={styles.newRecordOption} onClick={() => handleNavigate('/produtos/novo')}>
                <Package size={22} color={isDarkMode ? '#ffffff' : '#0F172A'} /><span>Novo Produto</span>
              </button>
            </div>
          )}
        </div>

        <button className={styles.themeSwitch} onClick={onToggleTheme}>
          <span className={styles.switchTrack}>
            <span className={styles.switchIcon} style={{ left: isDarkMode ? '30px' : '4px' }}>
              {isDarkMode ? <Moon color="#0F172A" size={24} /> : <Sun color="#FF8000" size={24} />}
            </span>
          </span>
        </button>
        
        <div className={styles.avatar}>{initials}</div>
      </div>
    </header>
  );
};