import AlertBanner from './components/AlertBanner';
import ActionCenter from './components/ActionCenter';
import KpiBoard from './components/KpiBoard';
import MonthlySalesCard from './components/MonthlySalesChart';
import styles from './styles.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.scrollWrapper}>
      <div className={styles.dashboardGrid}>
        
        {/* LINHA 1: BANNER (SOZINHO) */}
        <div className={styles.bannerArea}>
          <AlertBanner />
        </div>
        
        {/* LINHA 2 - COLUNA 1: KPI */}
        <div className={styles.kpiBoardArea}>
          <KpiBoard />
        </div>

        {/* LINHA 2 - COLUNA 2: MONTHLY (CENTRO) */}
        <div className={styles.MonthlySalesCard}>
          <MonthlySalesCard />
        </div>

        {/* LINHA 2 - COLUNA 3: SIDEBAR */}
        <div className={styles.sidebarContent}>
          <ActionCenter />
        </div>

      </div>
    </div>
  );
}
