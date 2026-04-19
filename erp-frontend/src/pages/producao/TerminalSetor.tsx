import React, { useState, useEffect } from 'react';
import styles from './TerminalSetor.module.css';
import { CheckSquare, Loader2 } from 'lucide-react';
import { producaoService } from '../../services/producaoService';
import { type OrdemCorteDTO } from '../../services/ordemService';

interface ConfigSetor {
  id: string;
  nome: string;
  statusVisivel: string;
  acaoTexto: string;
  proximoStatus: string;
}

const TerminalSetor: React.FC = () => {
  const [roleUsuario, setRoleUsuario] = useState<string>('');
  const [nomeUsuario, setNomeUsuario] = useState<string>('Operador');

  useEffect(() => {
    try {
      const token = localStorage.getItem('erp_token');
      if (token) {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
           const decodedPayload = JSON.parse(atob(payloadBase64));
           setRoleUsuario(decodedPayload.papel || decodedPayload.role || 'OPERADOR');
           setNomeUsuario(decodedPayload.nomeCompleto || decodedPayload.sub || 'Operador');
        }
      }
    } catch (error) {
       console.error("Erro ao ler credenciais locais", error);
    }

    setRoleUsuario('OPERADOR_CORTE'); 
  }, []);

  const getConfigSetor = (role: string): ConfigSetor | null => {
    switch (role) {
      case 'OPERADOR_CORTE': 
        return { id: 'CORTE', nome: 'Setor de Corte', statusVisivel: 'PLANEJADA', acaoTexto: 'Finalizar Corte', proximoStatus: 'EM_CORTE' };
      case 'OPERADOR_COSTURA': 
        return { id: 'COSTURA', nome: 'Setor de Costura', statusVisivel: 'EM_CORTE', acaoTexto: 'Finalizar Costura', proximoStatus: 'COSTURA' };
      case 'QA':
      case 'GERENTE_FABRIL': 
        return { id: 'ACABAMENTO', nome: 'Controle de Qualidade', statusVisivel: 'COSTURA', acaoTexto: 'Aprovar Lote', proximoStatus: 'FINALIZADA' };
      default:
        return null; 
    }
  };

  const setorAtivo = getConfigSetor(roleUsuario);

  const [ordens, setOrdens] = useState<OrdemCorteDTO[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const carregarOrdens = async () => {
    if (!setorAtivo) return;
    
    setCarregando(true);
    try {
      const dados = await producaoService.listarOrdensFocoProducao(setorAtivo.statusVisivel);
      setOrdens(dados);
    } catch (error) {
      console.error('Erro ao carregar ordens do setor', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (setorAtivo) carregarOrdens();
  }, [setorAtivo?.id]);

  const handleLiberarLote = async (id: number | undefined) => {
    if (!id || !setorAtivo) return;
    if (!window.confirm(`Confirmar liberação deste lote para a próxima etapa?`)) return;

    setProcessandoId(id);
    try {
      await producaoService.avancarFase(id, setorAtivo.proximoStatus, nomeUsuario, `Liberado no terminal: ${setorAtivo.nome}`);
      alert('Lote liberado com sucesso!');
      carregarOrdens(); 
    } catch (error) {
      console.error('Erro ao liberar lote', error);
      alert('Falha ao processar avanço de fase.');
    } finally {
      setProcessandoId(null);
    }
  };

  if (!setorAtivo) {
    return (
      <div className={`${styles.pageWrapper} ${styles.restrictedAccess}`}>
        <h2>Acesso Operacional Restrito</h2>
        <p>Seu perfil atual ({roleUsuario || 'Nenhum'}) não possui um terminal de apontamento de fábrica designado.</p>
        
        <div className={styles.devTools}>
             <button onClick={() => setRoleUsuario('OPERADOR_CORTE')}>Simular Corte</button>
             <button onClick={() => setRoleUsuario('OPERADOR_COSTURA')}>Simular Costura</button>
             <button onClick={() => setRoleUsuario('QA')}>Simular QA</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>
          Terminal: {setorAtivo.nome}
        </h1>
      </div>
      
      <div>
        <h2 className={styles.sectionTitle}>
          Lotes Aguardando Ação ({ordens.length})
        </h2>

        {carregando ? (
          <div className={styles.loadingContainer}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : ordens.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhum lote pendente para o seu setor no momento.
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {ordens.map(oc => (
              <div key={oc.id} className={styles.card}>
                <div>
                  <div className={styles.cardHeader}>
                    <span className={styles.ocNumber}>{oc.codigoOrdem}</span>
                  </div>
                  <div className={styles.productName}>
                    {oc.produtoReferencia || 'Produto não especificado'} 
                  </div>
                </div>

                <button 
                  className={styles.actionButton}
                  onClick={() => handleLiberarLote(oc.id)}
                  disabled={processandoId === oc.id}
                >
                  {processandoId === oc.id ? <Loader2 className="animate-spin" size={20} /> : <CheckSquare size={20} />}
                  {setorAtivo.acaoTexto}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalSetor;