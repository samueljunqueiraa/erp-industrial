import React, { useEffect, useState } from 'react';
import { expedicaoService, type ItemEstoqueDTO } from '../../services/expedicaoService';
import { RefreshCw, Layers, ClipboardList } from 'lucide-react'; 
import styles from './Estoque.module.css'; 

const Estoque: React.FC = () => {
  const [itens, setItens] = useState<ItemEstoqueDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarEstoque = () => {
    setLoading(true);
    expedicaoService.listarEstoque()
      .then(data => setItens(data))
      .catch(err => console.error("Erro ao buscar estoque", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarEstoque();
  }, []);

  const calcularProgresso = (conferido: number, planejado: number) => {
    if (planejado === 0) return 0;
    return Math.min(100, (conferido / planejado) * 100);
  };

  return (
    <div className={styles.container}>
      
      {/* CABEÇALHO */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
           <h1 className={styles.title}>Estoque Físico e Vendas</h1>
        </div>
        <button className={styles.btnAtualizar} onClick={carregarEstoque}>
           <RefreshCw size={18} /> 
           Atualizar Lista
        </button>
      </div>

      {/* TABELA */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
            <thead className={styles.thead}>
                <tr>
                    <th className={styles.th}>SKU / Referência</th>
                    <th className={styles.th}>Produto</th>
                    <th className={styles.th}>Ordem</th>
                    
                    {/* 1. TOTAL DA OC (Novo pedido) */}
                    <th className={styles.th} style={{textAlign: 'center'}}>Total ORD/COR</th>

                    {/* 2. PRODUÇÃO (Mantido conforme original com a barra) */}
                    <th className={styles.th}>Produção (Conf. / Plan.)</th>

                    {/* 3. VENDAS (Novo cálculo) */}
                    <th className={styles.th} style={{textAlign: 'center'}}>Vendas / Saída</th>

                    {/* 4. SALDO (Mantido) */}
                    <th className={styles.th} style={{textAlign: 'right'}}>Saldo Galpão</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={7} className={styles.loading}>Carregando dados...</td></tr>
                ) : itens.length === 0 ? (
                    <tr><td colSpan={7} className={styles.empty}>Nenhum registro encontrado.</td></tr>
                ) : (
                    itens.map((item, idx) => {
                        const percent = calcularProgresso(item.conferido, item.planejado);
                        const isCompleto = item.conferido >= item.planejado;
                        
                        // CÁLCULO DE VENDAS (Frontend puro)
                        const vendidos = Math.max(0, item.conferido - item.saldo);

                        return (
                        <tr key={idx} className={styles.tr}>
                            <td className={styles.td}>
                                <span className={styles.sku}>{item.sku}</span>
                            </td>
                            <td className={styles.td}>
                                <span className={styles.produto}>{item.produto}</span>
                            </td>
                            <td className={styles.td}>
                                <span className={styles.ordemTag}>{item.ordem}</span>
                            </td>

                            {/* COLUNA 1: TOTAL OC */}
                            <td className={styles.td} style={{textAlign: 'center'}}>
                                <span style={{
                                    backgroundColor: '#e5e7eb',
                                    color: '#374151',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <ClipboardList size={14} />
                                    {item.planejado}
                                </span>
                            </td>

                            {/* COLUNA 2: PRODUÇÃO COM BARRA */}
                            <td className={styles.td}>
                                <div className={styles.progressoWrapper}>
                                    <span style={{fontSize: '0.9rem', fontWeight: 600, color: '#2563eb'}}>
                                        {item.conferido} <span style={{color:'#585858', fontWeight:500}}>/ {item.planejado}</span>
                                    </span>
                                    <div className={styles.barraProgresso}>
                                        <div 
                                            className={`${styles.barraPreenchida} ${isCompleto ? styles.completo : ''}`} 
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            </td>

                            {/* COLUNA 3: VENDAS (Card Vermelho) */}
                            <td className={styles.td} style={{textAlign: 'center'}}>
                                {vendidos > 0 ? (
                                    <span style={{
                                        backgroundColor: '#fee2e2',
                                        color: '#b91c1c',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {vendidos}
                                    </span>
                                ) : (
                                    <span style={{color: '#9ca3af', fontSize: '0.8rem'}}>-</span>
                                )}
                            </td>

                            {/* COLUNA 4: SALDO (Card Verde) */}
                            <td className={styles.td}>
                                <div className={styles.saldo}>
                                    <Layers size={24} style={{marginRight: 8, color: item.saldo > 0 ? '#0b8815' : '#9ca3af'}}/>
                                    <span style={{
                                        color: item.saldo > 0 ? '#0b8815' : '#6b7280',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.saldo} UN
                                    </span>
                                </div>
                            </td>
                        </tr>
                    )})
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Estoque;