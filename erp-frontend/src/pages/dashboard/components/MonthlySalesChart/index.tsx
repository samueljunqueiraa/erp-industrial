import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import styles from './styles.module.css';
import { useMonthlySales } from '../../hooks/useMonthlySales';

const MonthlySalesCard: React.FC = () => {
  const { data,  atualizarMeta } = useMonthlySales();
  const [isEditing, setIsEditing] = useState(false);
  const [tempMeta, setTempMeta] = useState("");

  const handleEditClick = () => {
    setTempMeta(data.metaMensal.toString());
    setIsEditing(true);
  };

  const handleSaveMeta = async () => {
    const novaMeta = parseFloat(tempMeta);
    if (isNaN(novaMeta) || novaMeta < 0) return;

    const sucesso = await atualizarMeta(novaMeta);
    if (sucesso) {
      setIsEditing(false);
    } else {
      alert("Erro ao salvar meta. Verifique sua permissão.");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const percentage = Math.min(100, Math.max(0, (data.totalVendido / (data.metaMensal || 1)) * 100));
  const progressColor = percentage >= 100 ? '#10B981' : percentage >= 70 ? '#3B82F6' : '#F59E0B';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        
        <span className={styles.title}>Total de Vendas</span>
        <span className={styles.badge}>Mensal</span>
      </div>

      <div className={styles.mainContent}>
        <span className={styles.label}>Um resumo das vendas totais do mês</span>
        <h2 className={styles.value}>{formatCurrency(data.totalVendido)}</h2>
      </div>

      <div className={styles.metaContainer}>
        <div className={styles.metaHeader}>
          <span className={styles.metaLabel}>Meta do Mês:</span>
          
          {isEditing ? (
            <div className={styles.editControls}>
              <input 
                type="number" 
                className={styles.metaInput}
                value={tempMeta}
                onChange={(e) => setTempMeta(e.target.value)}
                autoFocus
              />
              <button onClick={handleSaveMeta} className={styles.actionBtn} title="Salvar">
                <Check size={16} color="#10B981" />
              </button>
              <button onClick={() => setIsEditing(false)} className={styles.actionBtn} title="Cancelar">
                <X size={16} color="#EF4444" />
              </button>
            </div>
          ) : (
            <div className={styles.metaDisplay}>
              <span className={styles.metaValue}>{formatCurrency(data.metaMensal)}</span>
              <button onClick={handleEditClick} className={styles.editBtn} title="Alterar Meta">
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Barra de Progresso */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressBarBg}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${percentage}%`, backgroundColor: progressColor }} 
            />
          </div>
          <span className={styles.progressText}>{percentage.toFixed(1)}% atingido</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesCard;