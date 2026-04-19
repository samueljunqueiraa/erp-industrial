import { useState, useEffect, useRef } from 'react';
import { Package, CheckCircle, Barcode, AlertTriangle, UserCheck } from 'lucide-react';
import { expedicaoService } from '../../services/expedicaoService';
import type { ConferenciaPedidoDTO, ItemConferenciaDTO } from '../../services/expedicaoService';
import styles from './Expedicao.module.css';

export default function ExpedicaoConferencia() {
  const [pedidos, setPedidos] = useState<ConferenciaPedidoDTO[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<ConferenciaPedidoDTO | null>(null);
  const [codigoInput, setCodigoInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'warning'; mensagem: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarPedidos();
  }, []);

  useEffect(() => {
    if (pedidoSelecionado && inputRef.current) {
      inputRef.current.focus();
    }
  }, [pedidoSelecionado]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const data = await expedicaoService.listarPedidosPendentes();
      setPedidos(data);
      if (pedidoSelecionado) {
        const atualizado = data.find(p => p.pedidoId === pedidoSelecionado.pedidoId);
        setPedidoSelecionado(atualizado || null);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarPedido = (pedido: ConferenciaPedidoDTO) => {
    setPedidoSelecionado(pedido);
    setCodigoInput('');
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && codigoInput.trim()) {
      handleConferir();
    }
  };

  const handleConferir = async () => {
    if (!pedidoSelecionado || !codigoInput.trim()) return;

    try {
      await expedicaoService.conferirItemPedido(pedidoSelecionado.pedidoId, codigoInput.trim());
      setFeedback({ tipo: 'success', mensagem: 'Item conferido com sucesso!' });
      setCodigoInput('');
      await carregarPedidos();
    } catch (error: any) {
      const msg = error.response?.data || 'Erro na conferência';
      setFeedback({ 
        tipo: 'error', 
        mensagem: typeof msg === 'string' ? msg : 'Produto não encontrado ou quantidade excedida' 
      });
      setCodigoInput('');
    }
    inputRef.current?.focus();
  };

  const calcularProgresso = (pedido: ConferenciaPedidoDTO): number => {
    if (!pedido.totalItens || pedido.totalItens === 0) return 0;
    return Math.round((pedido.itensConferidos / pedido.totalItens) * 100);
  };

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'FINALIZADO': return styles.concluido;
      case 'EM_ANDAMENTO': return styles.emAndamento;
      default: return styles.pendente;
    }
  };

  return (
    <div className={styles.container}>
      {/* --- SIDEBAR --- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Pedidos Pendentes</h3>
          <span>{pedidos.length}</span>
        </div>

        <div className={styles.pedidosList}>
          {loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Carregando...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>Tudo conferido!</p>
            </div>
          ) : (
            pedidos.map((pedido) => {
              const progresso = calcularProgresso(pedido);
              const isActive = pedidoSelecionado?.pedidoId === pedido.pedidoId;

              return (
                <div
                  key={pedido.pedidoId}
                  className={`${styles.pedidoCard} ${isActive ? styles.active : ''}`}
                  onClick={() => handleSelecionarPedido(pedido)}
                >
                  <div className={styles.pedidoCardHeader}>
                    {/* AQUI ESTAVA O ERRO: Mudamos de numeroPedido (GUID) para pedidoId (ID Curto) */}
                    <span className={styles.pedidoCardId}>Pedido #{pedido.pedidoId}</span>
                    <span className={styles.pedidoData}>{pedido.dataPedido || '--/--'}</span>
                  </div>
                  
                  <p className={styles.pedidoCardCliente}>{pedido.nomeCliente}</p>
                  
                  {/* AJUSTE VISUAL DO VENDEDOR */}
                  <div className={styles.pedidoCardInfo} style={{ justifyContent: 'flex-start', gap: '5px', marginBottom: '5px' }}>
                    <UserCheck size={12} color="#64748b" />
                    <span className={styles.pedidoCardVendedor}>
                       {/* Removemos o prefixo 'Vend:' hardcoded para ficar mais limpo */}
                       {pedido.nomeVendedor || 'Vendedor N/A'}
                    </span>
                  </div>

                  <div className={styles.pedidoCardInfo}>
                    <div className={styles.pedidoCardItens}>
                      <Package size={14} />
                      <span>{pedido.itensConferidos}/{pedido.totalItens} itens</span>
                    </div>
                    <span>{progresso}%</span>
                  </div>
                  
                  <div className={styles.progressBarTrack} style={{ height: '4px', marginTop: '6px' }}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${progresso}%` }} 
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className={styles.conferenciaArea}>
        {!pedidoSelecionado ? (
          <div className={styles.emptyState}>
            <Barcode className={styles.emptyStateIcon} />
            <p className={styles.emptyStateText}>Selecione um pedido para iniciar</p>
          </div>
        ) : (
          <>
            <header className={styles.headerPedido}>
              <div className={styles.headerPedidoInfo}>
                <h1 className={styles.headerPedidoCliente}>{pedidoSelecionado.nomeCliente}</h1>
                {/* Ajuste também aqui no Header Principal */}
                <span className={styles.headerPedidoId}>Pedido #{pedidoSelecionado.pedidoId}</span>
              </div>
              <div className={`${styles.headerPedidoStatus} ${getStatusClass(pedidoSelecionado.status)}`}>
                {pedidoSelecionado.status === 'FINALIZADO' ? <CheckCircle size={16} /> : <Package size={16} />}
                {pedidoSelecionado.status}
              </div>
            </header>

            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarLabel}>
                <span className={styles.progressBarText}>Progresso da Conferência</span>
                <span className={styles.progressBarPercent}>
                  {pedidoSelecionado.itensConferidos} / {pedidoSelecionado.totalItens} ({calcularProgresso(pedidoSelecionado)}%)
                </span>
              </div>
              <div className={styles.progressBarTrack}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${calcularProgresso(pedidoSelecionado)}%` }} 
                />
              </div>
            </div>

            <div className={styles.inputScannerContainer}>
              <label className={styles.inputScannerLabel}>
                <Barcode size={18} />
                Bipar Produto
              </label>
              <input
                ref={inputRef}
                type="text"
                className={styles.inputScanner}
                placeholder="Escaneie o código de barras..."
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {feedback && (
                <div className={`${styles.scanFeedback} ${styles[feedback.tipo]}`} style={{ marginTop: '1rem' }}>
                   {feedback.tipo === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                   <span>{feedback.mensagem}</span>
                </div>
              )}
            </div>

            <div className={styles.listaItens}>
              <div className={styles.listaItensHeader}>
                <h3 className={styles.listaItensTitle}>Itens do Pedido</h3>
                <span className={styles.listaItensCount}>{pedidoSelecionado.itens.length} produtos</span>
              </div>
              
              <div className={styles.listaItensGrid}>
                {pedidoSelecionado.itens.map((item: ItemConferenciaDTO, index: number) => (
                  <div 
                    key={`${item.sku}-${index}`} 
                    className={`${styles.itemCard} ${item.conferidoCompleto ? styles.conferidoCompleto : ''} ${item.qtdConferida > 0 && !item.conferidoCompleto ? styles.conferidoParcial : ''}`}
                  >
                    <div className={styles.itemCardHeader}>
                      <span className={styles.itemCardCodigo}>{item.sku}</span>
                    </div>
                    
                    <p className={styles.itemCardNome}>{item.nomeProduto}</p>
                    
                    <div className={styles.itemCardDetails}>
                      <span className={styles.itemCardDetail}>
                         <Barcode size={12} /> {item.codigoBarras}
                      </span>
                    </div>

                    <div className={styles.itemCardQuantidade}>
                      <span className={styles.itemCardQtdLabel}>Qtd:</span>
                      <span className={`${styles.itemCardQtdValue} ${item.conferidoCompleto ? styles.completo : item.qtdConferida > 0 ? styles.parcial : ''}`}>
                        {item.qtdConferida} / {item.qtdPedida}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}