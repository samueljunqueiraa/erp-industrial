import React, { useState, useEffect } from 'react';
import styles from './ContasReceber.module.css';
import {Search, CheckCircle, X, Loader2 } from 'lucide-react';
import { financeiroService, type ContaReceberDTO } from '../../services/produtoService';

const ContasReceber: React.FC = () => {
  // --- ESTADOS DA TELA ---
  const [contas, setContas] = useState<ContaReceberDTO[]>([]);
  const [carregando, setCarregando] = useState(false);
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  
  // --- CONTROLE DO MODAL DE BAIXA ---
  const [contaSelecionada, setContaSelecionada] = useState<ContaReceberDTO | null>(null);
  const [processandoBaixa, setProcessandoBaixa] = useState(false);
  
  // Dados do formulário de Baixa
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [comprovante, setComprovante] = useState<File | null>(null);

  // --- BUSCA DE DADOS REAIS NA API ---
  const carregarDados = async () => {
    setCarregando(true);
    try {
      const dados = await financeiroService.listarContas(filtroStatus, busca);
      setContas(dados);
    } catch (error) {
      console.error("Erro ao carregar contas a receber", error);
    } finally {
      setCarregando(false);
    }
  };

  // Efeito para recarregar quando o usuário digitar ou mudar o status
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      carregarDados();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [busca, filtroStatus]);

  // --- FUNÇÕES UTILITÁRIAS ---
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (dataIso: string) => {
    if (!dataIso) return '-';
    const partes = dataIso.split('-');
    if (partes.length !== 3) return dataIso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`; 
  };

  // --- AÇÕES DO MODAL ---
  const abrirModalBaixa = (conta: ContaReceberDTO) => {
    setContaSelecionada(conta);
    setDataPagamento(new Date().toISOString().split('T')[0]); // Hoje por padrão
    setFormaPagamento('PIX'); // Padrão
    setComprovante(null); // Limpa resquícios anteriores
  };

  const handleConfirmarBaixa = async () => {
    if (!contaSelecionada) return;
    
    // Trava de segurança: Obriga o upload
    if (!comprovante) {
      alert("Por favor, anexe o comprovante de pagamento antes de confirmar a baixa.");
      return;
    }

    setProcessandoBaixa(true);
    try {
      await financeiroService.baixarConta({
        contaId: contaSelecionada.id,
        dataPagamento: dataPagamento,
        formaPagamento: formaPagamento,
        comprovante: comprovante 
      });

      alert(`A conta do cliente ${contaSelecionada.cliente} foi baixada com sucesso!`);
      
      // Limpa e recarrega
      setContaSelecionada(null);
      setComprovante(null);
      carregarDados();
      
    } catch (error) {
      console.error("Erro ao processar baixa", error);
      alert("Erro ao enviar o comprovante. Verifique o servidor.");
    } finally {
      setProcessandoBaixa(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>
          Contas a Receber
        </h1>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filterGroup} style={{ flex: 2 }}>
          <label>Buscar Cliente ou Documento</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 12 }} />
            <input 
              type="text" 
              className={styles.filterInput}
              style={{ paddingLeft: 40 }}
              placeholder="Ex: Splindid, NF-123..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)} 
            />
          </div>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Status</label>
          <select 
            className={styles.filterSelect}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ABERTO">Em Aberto</option>
            <option value="ATRASADO">Atrasados</option>
            <option value="RECEBIDO">Recebidos</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.dataTable}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Documento</th>
              <th className={styles.th}>Cliente</th>
              <th className={styles.th}>Vencimento</th>
              <th className={styles.th}>Valor</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Ação</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            
            {carregando && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 className="animate-spin" size={24} color="#16a34a" style={{ margin: '0 auto' }} />
                  <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Carregando contas...</p>
                </td>
              </tr>
            )}
            
            {!carregando && contas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Nenhuma conta a receber encontrada.
                </td>
              </tr>
            )}

            {!carregando && contas.map((conta) => (
              <tr key={conta.id}>
                <td className={styles.td}><strong>{conta.documento}</strong></td>
                <td className={styles.td}>{conta.cliente}</td>
                <td className={styles.td}>{formatarData(conta.dataVencimento)}</td>
                <td className={styles.td} style={{ fontWeight: 'bold' }}>
                  {formatarMoeda(conta.valorTotal)}
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${
                    conta.status === 'ABERTO' ? styles.badgeAberto : 
                    conta.status === 'ATRASADO' ? styles.badgeAtrasado : styles.badgeRecebido
                  }`}>
                    {conta.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <button 
                    className={styles.actionBtn} 
                    onClick={() => abrirModalBaixa(conta)}
                    disabled={conta.status === 'RECEBIDO'}
                  >
                    {conta.status === 'RECEBIDO' ? 'Baixado' : 'Baixar Título'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE BAIXA: O botão que diz "Tá Pago" */}
      {contaSelecionada && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Baixar Conta - {contaSelecionada.documento}</h2>
              <button className={styles.closeModalBtn} onClick={() => setContaSelecionada(null)} disabled={processandoBaixa}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Cliente: <strong>{contaSelecionada.cliente}</strong><br/>
              Valor a Baixar: <strong>{formatarMoeda(contaSelecionada.valorTotal)}</strong>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.filterGroup}>
                <label>Data do Recebimento</label>
                <input 
                  type="date" 
                  className={styles.filterInput} 
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  disabled={processandoBaixa}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>Forma de Pagto</label>
                <select 
                  className={styles.filterSelect}
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  disabled={processandoBaixa}
                >
                  <option value="PIX">PIX</option>
                  <option value="TED">Transferência / TED</option>
                  <option value="BOLETO">Boleto Bancário</option>
                  <option value="DINHEIRO">Dinheiro Espécie</option>
                </select>
              </div>
            </div>

            {/* O Campo Principal: O Comprovante */}
            <div className={styles.filterGroup} style={{ width: '100%', marginTop: '16px' }}>
              <label>Anexar Comprovante (Obrigatório)</label>
              <input 
                type="file" 
                accept=".pdf, image/jpeg, image/png"
                className={styles.filterInput} 
                onChange={(e) => setComprovante(e.target.files ? e.target.files[0] : null)}
                disabled={processandoBaixa}
                style={{ padding: '8px', cursor: 'pointer', height: 'auto' }}
              />
              {comprovante && (
                <span style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '6px', fontWeight: 'bold' }}>
                  ✓ {comprovante.name} anexado.
                </span>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setContaSelecionada(null)} disabled={processandoBaixa}>
                Cancelar
              </button>
              <button 
                className={styles.confirmBtn} 
                onClick={handleConfirmarBaixa}
                disabled={processandoBaixa}
                style={{ opacity: processandoBaixa ? 0.7 : 1, cursor: processandoBaixa ? 'not-allowed' : 'pointer' }}
              >
                {processandoBaixa ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} 
                {processandoBaixa ? 'Enviando...' : 'Confirmar Baixa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContasReceber;