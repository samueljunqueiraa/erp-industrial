import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import { House, Users, Briefcase, Truck, Factory, Landmark, Settings, LogOut, ChevronRight, Package, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', icon: <House className={styles.menuIcon} />, to: '/dashboard' },
  {
    label: 'Comercial',
    icon: <Briefcase className={styles.menuIcon} />,
    submenu: [
      { label: 'Pedido', to: '/comercial/pedido' },
      { label: 'Pedidos Realizados', to: '/comercial/pedidos' },
      { label: 'Disponibilidade (Grade)', to: '/comercial/disponibilidade' },
      { label: 'Clientes', to: '/comercial/clientes' },
      { label: 'Gestão de Carteira', to: '/comercial/gestao-carteira' }
    ]
  },
  { 
    label: 'Produtos', 
    icon: <Package className={styles.menuIcon} />, 
    to: '/produtos' 
  },
  {
    label: 'Expedição',
    icon: <Truck className={styles.menuIcon} />,
    submenu: [
      { label: 'Almoxarifado', to: '/expedicao/almoxarifado' },
      { label: 'Estoque', to: '/expedicao/estoque' },
      { label: 'Conferência Saída', to: '/expedicao/conferencia' }
    ]
  },
  {
    label: 'Indústria',
    icon: <Factory className={styles.menuIcon} />,
    submenu: [
      { label: 'Ordem de Corte', to: '/producao/ordens' },
      { label: 'Produção', to: '/industria/producao' },
      { label: 'Terminal (Fábrica)', to: '/industria/terminal' },
      { label: 'Qualidade', to: '/industria/qualidade' },
      { label: 'Manutenção', to: '/industria/manutencao' }
    ]
  },
  { 
    label: 'Financeiro',
    icon: <Landmark className={styles.menuIcon} />,
    submenu: [
      { label: 'Contas a Receber', to: '/financeiro/contas-receber' },
      { label: 'Contas a Pagar', to: '/financeiro/contas-pagar' },
      { label: 'Fluxo de Caixa', to: '/financeiro/fluxo-caixa' }
    ]
  },
  { 
    label: 'Gestão de Usuários', 
    icon: <Users className={styles.menuIcon} />,
    to: '/gestao-usuarios' 
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation(); 
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false); 

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener('toggleMobileMenu', handleToggle);
    return () => window.removeEventListener('toggleMobileMenu', handleToggle);
  }, []);

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      {isMobileOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu}></div>
      )}

      <aside className={clsx(styles.sidebar, isMobileOpen && styles.sidebarOpen)}>
        
        {/* Botão de fechar */}
        <div className={styles.sidebarHeader}>
          <span className={styles.greeting}>Olá, {user?.name || ''}</span>
          <button className={styles.closeBtn} onClick={closeMobileMenu}>
            <X size={28} />
          </button>
        </div>
        
        <nav className={styles.menu}>
          <ul className={styles.menuList}>
            {menuItems.map((item) => {
              let isActive = false;
              if (item.label === 'Dashboard') {
                isActive = location.pathname === '/dashboard';
              } else if (item.to) {
                isActive = location.pathname.startsWith(item.to);
              } else if (Array.isArray(item.submenu)) {
                isActive = item.submenu.some(sub => location.pathname === sub.to);
              }

              if (item.to) {
                return (
                  <li
                    key={item.label}
                    className={clsx(styles.menuItem, isActive && styles.menuItemActive)}
                  >
                    <Link
                      to={item.to}
                      className={styles.menuLink}
                      style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                      onClick={() => {
                          closeMobileMenu(); 
                          setTimeout(() => window.location.reload(), 100);
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              } else if (item.submenu) {
                return (
                  <React.Fragment key={item.label}>
                    <li
                      className={clsx(styles.menuItem, isActive && !openMenu && styles.menuItemActive, openMenu === item.label && styles.menuItemOpen)}
                      onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <ChevronRight className={clsx(styles.menuChevron, openMenu === item.label && styles.menuChevronOpen)} />
                    </li>
                    {openMenu === item.label && Array.isArray(item.submenu) && (
                      <ul className={styles.menuList} style={{ paddingLeft: 32 }}>
                        {item.submenu.map((sub) => (
                          <li key={sub.label} className={clsx(styles.menuItem, location.pathname === sub.to && styles.menuItemActive)}>
                            <Link
                              to={sub.to}
                              className={styles.menuLink}
                              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                              onClick={() => {
                                  closeMobileMenu(); 
                                  setTimeout(() => window.location.reload(), 100);
                              }}
                            >
                              <span>{sub.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </React.Fragment>
                );
              } else {
                return (
                  <li
                    key={item.label}
                    className={clsx(styles.menuItem, isActive && styles.menuItemActive)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </li>
                );
              }
            })}
          </ul>
        </nav>
        <div className={styles.footer}>
          <button className={styles.footerBtn}>
            <Settings size={20} /> Configurações
          </button>
          <button className={styles.footerBtn}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;