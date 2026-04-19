import React, { useState, useEffect } from 'react';
import styles from './PainelProducao.module.css';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

// Fases na ordem exata da fábrica
const FASES_PRODUCAO = [
  { id: 'PLANEJADA', titulo: 'PCP' },
  { id: 'EM_CORTE', titulo: 'Corte' },
  { id: 'COSTURA', titulo: 'Costura' },
  { id: 'ACABAMENTO', titulo: 'Acabamento/QA' },
  { id: 'FINALIZADA', titulo: 'Concluída' }
];

const PainelProducao: React.FC = () => {
  const [ordens, setOrdens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const carregarOrdens = async () => {
    setCarregando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      // MOCK COM VOLUME MAIOR (Como na vida real)
      setOrdens([
        { id: 1, codigoOrdem: 'OC-101', status: 'PLANEJADA', quantidadeTotal: 50, dataEmissao: '2026-02-23', produto: { nome: 'TERNO GABARDINE PRETO' } },
        { id: 2, codigoOrdem: 'OC-102', status: 'EM_CORTE', quantidadeTotal: 30, dataEmissao: '2026-02-23', produto: { nome: 'CALÇA SOCIAL AZUL' } },
        { id: 3, codigoOrdem: 'OC-103', status: 'COSTURA', quantidadeTotal: 100, dataEmissao: '2026-02-22', produto: { nome: 'COLETE OXFORD' } },
        { id: 4, codigoOrdem: 'OC-104', status: 'ACABAMENTO', quantidadeTotal: 25, dataEmissao: '2026-02-21', produto: { nome: 'TERNO RISCA DE GIZ' } },
        { id: 5, codigoOrdem: 'OC-105', status: 'FINALIZADA', quantidadeTotal: 40, dataEmissao: '2026-02-20', produto: { nome: 'TERNO SLIM FIT' } },
      ]);
    } catch (error) {
      console.error("Erro ao carregar OCs", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarOrdens();
  }, []);

  const getProximaFase = (statusAtual: string) => {
    const indexAtual = FASES_PRODUCAO.findIndex(f => f.id === statusAtual);
    if (indexAtual >= 0 && indexAtual < FASES_PRODUCAO.length - 1) {
      return FASES_PRODUCAO[indexAtual + 1];
    }
    return null;
  };

  const handleAvancarFase = async (id: number, proximaFaseId: string, tituloFase: string) => {
    if (!window.confirm(`Mover OC para: ${tituloFase}?`)) return;

    setProcessandoId(id);
    try {
      alert(`Enviado para ${tituloFase}!`);
      carregarOrdens();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessandoId(null);
    }
  };

  const renderStepper = (statusAtual: string) => {
    const indexAtual = FASES_PRODUCAO.findIndex(f => f.id === statusAtual);
    const tituloAtual = FASES_PRODUCAO[indexAtual]?.titulo || 'Desconhecido';

    return (
      <div style={{ width: '100%' }}>
        <div className={styles.stepperContainer}>
          {FASES_PRODUCAO.map((fase, idx) => (
            <React.Fragment key={fase.id}>
              {/* Bolinha */}
              <div 
                className={`${styles.stepDot} ${idx < indexAtual ? styles.completed : idx === indexAtual ? styles.active : ''}`}
                title={fase.titulo}
              />
              {/* Linha (não renderiza no último passo) */}
              {idx < FASES_PRODUCAO.length - 1 && (
                <div className={`${styles.stepLine} ${idx < indexAtual ? styles.completed : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <span className={styles.statusLabel}>{tituloAtual}</span>
      </div>
    );
  };

  if (carregando && ordens.length === 0) {
    return (
      <div className={styles.pageWrapper} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 size={40} className="animate-spin" color="#000" />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Fluxo de Produção Diário</h1>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.producaoTable}>
          <thead>
            <tr>
              <th>Ordem / Data</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th style={{ width: '30%' }}>Progresso na Fábrica</th>
              <th style={{ textAlign: 'center' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {ordens.map((oc) => {
              const proximaFase = getProximaFase(oc.status);

              return (
                <tr key={oc.id}>
                  <td>
                    <span className={styles.ocNumber}>{oc.codigoOrdem}</span>
                    <span className={styles.subText}>{oc.dataEmissao}</span>
                  </td>
                  <td>
                    <span className={styles.ocText}>{oc.produto?.nome}</span>
                  </td>
                  <td>
                    <span className={styles.ocText} style={{ fontSize: '1.1rem' }}>{oc.quantidadeTotal}</span>
                  </td>
                  <td>
                    {renderStepper(oc.status)}
                  </td>
                  <td style={{ display: 'flex', justifyContent: 'center' }}>
                    {proximaFase ? (
                      <button 
                        className={styles.btnAvançar}
                        onClick={() => handleAvancarFase(oc.id, proximaFase.id, proximaFase.titulo)}
                        disabled={processandoId === oc.id}
                      >
                        {processandoId === oc.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            Avançar <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className={styles.btnFinalizado}>
                        <CheckCircle size={18} /> Estoque Físico
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {ordens.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Nenhuma Ordem de Corte ativa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PainelProducao;