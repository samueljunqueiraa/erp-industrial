import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './OrdemCorteListagem.module.css'; 
import { ordemService, type OrdemResumoDTO } from '../../services/ordemService';
// Adicionei o ícone Tag
import { Printer, Eye, FileText, Tag } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
// Importe o serviço
import { etiquetaService } from '../../services/etiquetaService'; 

const OrdemCorteListagem = () => {
  const [ordens, setOrdens] = useState<OrdemResumoDTO[]>([]);
  const [tamanhosRef, setTamanhosRef] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [listaOrdens, listaTams] = await Promise.all([
        ordemService.getAll(),
        ordemService.getTamanhos()
      ]);
      // Ordena: Mais recentes primeiro
      setOrdens(listaOrdens.sort((a, b) => b.id - a.id));
      setTamanhosRef(listaTams);
    } catch (error) {
      console.error('Erro ao buscar ordens');
    }
  };

  const handlePrint = (ordem: OrdemResumoDTO) => {
    ordemService.gerarPDF(ordem.id, ordem.produtoNome, tamanhosRef);
  };

  // --- NOVA FUNÇÃO: Imprimir Zebra ---
  const handlePrintEtiquetas = async (id: number) => {
    try {
      // Busca dados completos (com grade) antes de imprimir
      const ordemCompleta = await ordemService.getById(id);
      etiquetaService.gerarEtiquetasZebra(ordemCompleta, tamanhosRef);
    } catch (error) {
      alert('Erro ao carregar dados para etiqueta.');
    }
  };

  // Define a cor da etiqueta baseada no status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PLANEJADA': return styles.statusPlanejada;
      case 'EM_CORTE': return styles.statusEmProducao;
      case 'FINALIZADA': return styles.statusFinalizada;
      case 'CANCELADA': return styles.statusCancelada;
      default: return styles.statusPlanejada;
    }
  };

  const formatarData = (data: string | number[] | null | undefined) => {
    if (!data) return '-'; // Retorna traço se for nulo
    
    // Se vier array do Java [2026, 1, 29]
    if (Array.isArray(data)) {
        return new Date(data[0], data[1] - 1, data[2]).toLocaleDateString('pt-BR');
    }
    
    // Se vier string "2026-01-29"
    return new Date(data).toLocaleDateString('pt-BR');
};

  const formatStatus = (status: string) => status?.replace('_', ' ').toLowerCase() || 'Indefinido';

  return (
    <div className={styles.container}>
      
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Ordens de Corte</h2>
          <p className={styles.subtitle}>Gerencie o fluxo de corte e produção.</p>
        </div>
        <Link to="/producao/ordens/novo" className={styles.btnNew}>
          Nova Ordem
        </Link>
      </div>

      {/* Tabela dentro do Card */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Produto</th>
              <th>Referência</th>
              <th>Data Emissão</th>
              <th>Qtd. Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ordens.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                   <FileText size={48} className={styles.emptyIcon}/>
                   <p>Nenhuma ordem de corte encontrada.</p>
                   <Link to="/producao/ordens/novo" style={{color: '#2563eb', fontWeight: 600, textDecoration: 'none'}}>
                      Clique aqui para criar a primeira
                   </Link>
                </td>
              </tr>
            ) : (
              ordens.map(ordem => (
                <tr key={ordem.id}>
                  
                  {/* --- MUDANÇA 1: CÓDIGO SIMPLIFICADO --- */}
                  <td>
                    <span className={styles.colCodigo}>
                      OC-{ordem.id}
                    </span>
                  </td>
                  {/* -------------------------------------- */}
                  
                  <td className={styles.colProduto}>{ordem.produtoNome}</td>
                  
                  <td style={{color: '#64748b'}}>{ordem.produtoReferencia}</td>
                  <td>
                      {/* Se não tiver Emissão, mostra Criação? Ou mostra traço? */}
                      {formatarData(ordem.dataEmissao)}
                  </td>
                  
                  <td>
                    <span className={styles.qtdBadge}>
                      {ordem.quantidadeTotal} un
                    </span>
                  </td>
                  
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(ordem.status)}`}>
                      {formatStatus(ordem.status)}
                    </span>
                  </td>
                  
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`${styles.actionBtn} ${styles.btnPdf}`}
                        onClick={() => handlePrint(ordem)}
                        title="Imprimir PDF"
                      >
                        <Printer size={18} />
                      </button>
                      
                      {/* --- MUDANÇA 2: BOTÃO ZEBRA --- */}
                      <button 
                        className={`${styles.actionBtn}`} 
                        style={{color: '#475569'}}
                        onClick={() => handlePrintEtiquetas(ordem.id)}
                        title="Imprimir Etiquetas (Zebra)"
                      >
                        <Tag size={18} />
                      </button>
                      {/* ------------------------------ */}

                      <button 
                        className={`${styles.actionBtn} ${styles.btnView}`}
                        title="Visualizar"
                        onClick={() => navigate(`/producao/ordens/editar/${ordem.id}`)}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdemCorteListagem;