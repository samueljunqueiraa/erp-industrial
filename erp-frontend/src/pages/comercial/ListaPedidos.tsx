import React, { useEffect, useState } from 'react';
import styles from './ListaPedidos.module.css';
import { vendaService } from '../../services/vendaService';
import { clienteService } from '../../services/clienteService';
import { FileText, ChevronLeft, ChevronRight, X} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PedidoListagem {
  id: number;
  numeroPedido: string;
  clienteId: number;
  dataCriacao: string;
  valorTotal: number;
  status: string;
  vendedorNome?: string; 
}

const ListaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoListagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<any[]>([]);
  const [buscaTexto, setBuscaTexto] = useState(''); 
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [listaVendedores, setListaVendedores] = useState<string[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [listaPedidos, listaClientes] = await Promise.all([
          vendaService.listar(),
          clienteService.listar() 
      ]);

      const ordenados = listaPedidos.sort((a: any, b: any) => b.id - a.id);
      setPedidos(ordenados);
      setClientes(listaClientes);
      const vendedoresUnicos = Array.from(new Set(
        ordenados
          .map((p: any) => p.vendedorNome)
          .filter((v: any) => v) 
      )) as string[];
      setListaVendedores(vendedoresUnicos);

    } catch (error) {
      console.error("Erro ao carregar", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (id: number) => {
    try { await vendaService.downloadPdf(id); } 
    catch (error) { alert("Erro ao baixar PDF"); }
  };

  // --- LÓGICA DE FILTRAGEM AVANÇADA ---
  const pedidosFiltrados = pedidos.filter(p => {
    const nomeCliente = getNomeCliente(p.clienteId).toLowerCase();
    const termo = buscaTexto.toLowerCase();
    const matchTexto = 
        p.numeroPedido?.toLowerCase().includes(termo) ||
        p.id.toString().includes(termo) ||
        nomeCliente.includes(termo);
    let matchData = true;
    if (dataInicio) {
        const dataPed = p.dataCriacao.substring(0, 10); 
        if (dataPed < dataInicio) matchData = false;
    }

    if (dataFim) {
        const dataPed = p.dataCriacao.substring(0, 10);
        if (dataPed > dataFim) matchData = false;
    }

    let matchVendedor = true;
    if (filtroVendedor) {
        matchVendedor = p.vendedorNome === filtroVendedor;
    }

    return matchTexto && matchData && matchVendedor;
  });

  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaTexto, dataInicio, dataFim, filtroVendedor]);

  const limparFiltros = () => {
    setBuscaTexto('');
    setDataInicio('');
    setDataFim('');
    setFiltroVendedor('');
  };

  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const pedidosAtuais = pedidosFiltrados.slice(indiceInicial, indiceFinal);

  const mudarPagina = (nova: number) => {
    if (nova >= 1 && nova <= totalPaginas) setPaginaAtual(nova);
  };

  function getNomeCliente(id: number) {
    if (!id) return 'Consumidor Final';
    const c = clientes.find(cli => cli.id === id);
    return c ? c.nome : `ID #${id}`;
  }

  function formatMoney(val: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  }

  function formatDate(dateString: string) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FINALIZADO': return <span className={`${styles.badge} ${styles.badgeFinalizado}`}>Finalizado</span>;
      case 'CANCELADO': return <span className={`${styles.badge} ${styles.badgeCancelado}`}>Cancelado</span>;
      default: return <span className={`${styles.badge} ${styles.badgeAberto}`}>Em Aberto</span>;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Histórico de Pedidos</h1>
        <Link to="/comercial/pedido" className={styles.novoBtn}>+ Novo Pedido</Link>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className={styles.filterContainer}>
        
        {/* Busca Textual */}
        <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
            <label>Buscar Pedido</label>
            <input 
                type="text" 
                className={styles.filterInput} 
                placeholder="Nº Pedido, OC ou Cliente..." 
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
            />
        </div>

        {/* Vendedor */}
        <div className={styles.filterGroup}>
            <label>Vendedor</label>
            <select 
                className={styles.filterSelect}
                value={filtroVendedor}
                onChange={(e) => setFiltroVendedor(e.target.value)}
            >
                <option value="">Todos</option>
                {listaVendedores.map((v, idx) => (
                    <option key={idx} value={v}>{v}</option>
                ))}
            </select>
        </div>

        {/* Data Início */}
        <div className={styles.filterGroup}>
            <label>De:</label>
            <input 
                type="date" 
                className={styles.filterInput} 
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
            />
        </div>

        {/* Data Fim */}
        <div className={styles.filterGroup}>
            <label>Até:</label>
            <input 
                type="date" 
                className={styles.filterInput} 
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
            />
        </div>

        {/* Botão Limpar */}
        {(buscaTexto || dataInicio || dataFim || filtroVendedor) && (
            <button className={styles.clearBtn} onClick={limparFiltros}>
                <X size={16} /> Limpar
            </button>
        )}
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <>
            <table className={styles.dataTable}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Nº Pedido</th>
                  <th className={styles.th}>Data</th>
                  <th className={styles.th}>Cliente</th>
                  <th className={styles.th}>Vendedor</th> {/* Nova Coluna Opcional */}
                  <th className={styles.th}>Total</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {pedidosAtuais.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.noData}>
                        Nenhum pedido encontrado com esses filtros.
                    </td>
                  </tr>
                ) : (
                  pedidosAtuais.map((pedido) => (
                    <tr key={pedido.id}>
                      <td className={styles.td}><strong>#{pedido.id}</strong></td>
                      <td className={styles.td}>{formatDate(pedido.dataCriacao)}</td>
                      <td className={styles.td}>{getNomeCliente(pedido.clienteId)}</td>
                      <td className={styles.td}>{pedido.vendedorNome || '-'}</td>
                      <td className={styles.td} style={{ fontWeight: 600 }}>
                        {formatMoney(pedido.valorTotal)}
                      </td>
                      <td className={styles.td}>{getStatusBadge(pedido.status)}</td>
                      <td className={styles.td} style={{ textAlign: 'center' }}>
                        <button 
                          className={styles.pdfBtn} 
                          onClick={() => handleDownloadPdf(pedido.id)}
                          title="Baixar Nota"
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Paginação (igual ao anterior) */}
            {totalPaginas > 0 && (
                <div className={styles.paginationRow}>
                    <span className={styles.paginationInfo}>
                        Mostrando {pedidosAtuais.length} de {pedidosFiltrados.length}
                    </span>
                    <div className={styles.paginationControls}>
                        <button 
                            className={styles.pageBtn} 
                            disabled={paginaAtual === 1}
                            onClick={() => mudarPagina(paginaAtual - 1)}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className={styles.pageIndicator}>Pág {paginaAtual} de {totalPaginas}</span>
                        <button 
                            className={styles.pageBtn} 
                            disabled={paginaAtual === totalPaginas}
                            onClick={() => mudarPagina(paginaAtual + 1)}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListaPedidos;