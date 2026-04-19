import React, { useState, useEffect } from 'react';
import styles from './ConsultaGrade.module.css';
import { ChevronDown, ChevronUp, Loader2, Search, FileDown } from 'lucide-react';
import { produtoService, type ProdutoBuscaDTO, type EstoqueGradeDTO } from '../../services/produtoService';

const SIZES = ['44', '46', '48', '50', '52', '54']; 

export const ConsultaGrade: React.FC = () => {
  const [termo, setTermo] = useState('');
  const [produtos, setProdutos] = useState<ProdutoBuscaDTO[]>([]);
  const [buscandoProdutos, setBuscandoProdutos] = useState(false);
  
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [estoquesCache, setEstoquesCache] = useState<Record<number, EstoqueGradeDTO>>({});
  const [loadingEstoque, setLoadingEstoque] = useState<Record<number, boolean>>({});
  
  // ESTADO NOVO: Controle de carregamento do PDF
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setBuscandoProdutos(true);
      try {
        const resultado = await produtoService.buscar(termo);
        setProdutos(resultado);
      } catch (error) {
        console.error("Erro ao buscar produtos", error);
      } finally {
        setBuscandoProdutos(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [termo]);

  const toggleExpand = async (produto: ProdutoBuscaDTO) => {
    const isExpanded = expandedIds.includes(produto.id);

    if (isExpanded) {
      setExpandedIds(expandedIds.filter(id => id !== produto.id));
      return;
    }

    setExpandedIds([...expandedIds, produto.id]);

    if (estoquesCache[produto.id]) return;

    const corIdSeguro = produto.corId ?? produto.cor?.id ?? 0;
    
    setLoadingEstoque(prev => ({ ...prev, [produto.id]: true }));
    try {
      const grade = await produtoService.consultarEstoqueGrade(produto.id, corIdSeguro);
      setEstoquesCache(prev => ({ ...prev, [produto.id]: grade }));
    } catch (error) {
      console.error("Erro ao consultar grade", error);
    } finally {
      setLoadingEstoque(prev => ({ ...prev, [produto.id]: false }));
    }
  };

  // FUNÇÃO NOVA: Integração real com o backend para baixar o PDF
  const handleExportPDF = async () => {
    setGerandoPdf(true);
    try {
      const blob = await produtoService.exportarPdfDisponibilidade(termo);
      
      // Cria um link invisível para forçar o download no navegador
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Grade_Disponibilidade_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar PDF", error);
      alert("Houve um erro ao gerar o PDF. Verifique o servidor.");
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>
          Consulta de Disponibilidade
        </h1>
        {/* BOTÃO ATUALIZADO: Mostra loading e desabilita enquanto gera */}
        <button 
          className={styles.exportBtn} 
          onClick={handleExportPDF} 
          disabled={gerandoPdf}
          style={{ opacity: gerandoPdf ? 0.7 : 1, cursor: gerandoPdf ? 'not-allowed' : 'pointer' }}
        >
          {gerandoPdf ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />} 
          {gerandoPdf ? 'Gerando...' : 'Exportar Grade | PDF'}
        </button>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <label>Buscar Produto ou Referência</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 12 }} />
            <input 
              type="text" 
              className={styles.filterInput}
              style={{ paddingLeft: 40 }}
              placeholder="Ex: Terno Gabardine, OC-0001..."
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.listContainer}>
        {buscandoProdutos && produtos.length === 0 ? (
          <div className={styles.loading}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            Buscando produtos...
          </div>
        ) : produtos.length === 0 ? (
          <div className={styles.noData}>Nenhum produto encontrado.</div>
        ) : null}

        {produtos.map(produto => {
          const isExpanded = expandedIds.includes(produto.id);
          const isLoadingStock = loadingEstoque[produto.id];
          const grade = estoquesCache[produto.id];
          const ref = produto.referenciaBase ?? produto.referencia ?? 'S/REF';
          const nomeCor = produto.nomeCor ?? produto.cor?.nome ?? '';

          return (
            <div key={produto.id} className={styles.productCard}>
              <div 
                className={`${styles.cardHeader} ${isExpanded ? styles.cardHeaderExpanded : ''}`} 
                onClick={() => toggleExpand(produto)}
              >
                <div className={styles.productInfo}>
                  <span className={styles.productRef}>CÓD: {ref}</span>
                  <span className={styles.productName}>
                    {produto.nome} {nomeCor && `- ${nomeCor}`}
                  </span>
                </div>
                <div>
                  {isExpanded ? <ChevronUp size={24} color="var(--text-secondary)" /> : <ChevronDown size={24} color="var(--text-secondary)" />}
                </div>
              </div>

              {isExpanded && (
                <div className={styles.cardBody}>
                  {isLoadingStock ? (
                    <div className={styles.loading}>
                      <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} /> 
                      Calculando saldos da fábrica...
                    </div>
                  ) : (
                    <div className={styles.gradeGrid}>
                      {SIZES.map(size => {
                        const fisico = grade?.[size]?.fisico || 0;
                        const producao = grade?.[size]?.producao || 0;
                        const total = fisico + producao;

                        return (
                          <div key={size} className={styles.sizeBox}>
                            <div className={styles.sizeLabel}>{size}</div>
                            
                            {total === 0 ? (
                              <div className={`${styles.stockItem} ${styles.stockZero}`}>
                                <span>-</span>
                                <span>Esgotado</span>
                              </div>
                            ) : (
                              <>
                                <div className={`${styles.stockItem} ${fisico > 0 ? styles.stockFisico : styles.stockZero}`}>
                                  <span>Físico:</span>
                                  <span>{fisico}</span>
                                </div>
                                <div className={`${styles.stockItem} ${producao > 0 ? styles.stockProducao : styles.stockZero}`}>
                                  <span>Produção:</span>
                                  <span>{producao}</span>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};