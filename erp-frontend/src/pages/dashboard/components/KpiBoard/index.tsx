import React from 'react';
import styles from './styles.module.css';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useDashboardMetrics } from '../../hooks/useDashboard';

const MonthSummary: React.FC = () => {
  // Agora trazendo também o estado de "error"
  const { metrics, loading, error } = useDashboardMetrics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // 1. Estado de Carregamento
  if (loading) {
    return (
      <div className={styles.cardContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 size={32} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 2. Estado de Erro (Caso o Java esteja desligado)
  if (error || !metrics) {
    return (
      <div className={styles.cardContainer} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: '10px' }}>
        <AlertCircle size={32} color="#EF4444" />
        <span style={{ color: '#EF4444', fontWeight: 600 }}>Erro ao carregar dados</span>
        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Verifique se o backend Java está rodando.</span>
      </div>
    );
  }

  // 3. Estado de Sucesso (Dados Reais)
  return (
    <div className={styles.cardContainer}>
      <div className={styles.blueStrip} />

      <div className={styles.content}>
        
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>Resumo do mês</h2>
            <span className={styles.month}>{metrics.month}</span>
          </div>
          <button className={styles.dateButton}>
            <span>{metrics.dateRange}</span>
            <Calendar size={20} color="#64748B" strokeWidth={2.5} />
          </button>
        </div>

        <div className={styles.metrics}>
          
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Faturamento</span>
            <div className={styles.metricValueRow}>
              {/* styles[metrics.revenue.status] pega 'green', 'yellow' ou 'red' do JSON */}
              <div className={`${styles.square} ${styles[metrics.revenue.status]}`} />
              <span className={styles.value}>{formatCurrency(metrics.revenue.value)}</span>
            </div>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Ticket Médio de Venda</span>
            <div className={styles.metricValueRow}>
              <div className={`${styles.square} ${styles[metrics.ticket.status]}`} />
              <span className={styles.value}>{formatCurrency(metrics.ticket.value)}</span>
            </div>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Total de Pedidos</span>
            <div className={styles.metricValueRow}>
              <div className={`${styles.square} ${styles[metrics.orders.status]}`} />
              <span className={styles.value}>{metrics.orders.value}</span>
            </div>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Usuários Cadastrados</span>
            <div className={styles.metricValueRow}>
              <span className={styles.value}>{metrics.users}</span>
            </div>
          </div>

        </div>

        <div className={styles.legendBox}>
          <span className={styles.legendTitle}>Explicação dos Índices:</span>
          <div className={styles.legendRow}>
            <div className={styles.legendItem}>
              <div className={`${styles.dot} ${styles.green}`} /> Performando
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.dot} ${styles.yellow}`} /> Atenção
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.dot} ${styles.red}`} /> Alerta
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MonthSummary;