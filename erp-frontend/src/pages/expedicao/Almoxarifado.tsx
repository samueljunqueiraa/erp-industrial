import { useState, useRef, useEffect } from 'react';
import { expedicaoService, type OrdemResumo } from '../../services/expedicaoService';
import styles from './Almoxarifado.module.css';
import { ScanBarcode, History, Package, AlertCircle } from 'lucide-react';
import MaisInfo from './MaisInfo';

const Almoxarifado = () => {
  const [ordemIdInput, setOrdemIdInput] = useState('');
  const [listaOrdens, setListaOrdens] = useState<OrdemResumo[]>([]);
  
  const [codigo, setCodigo] = useState('');
  const [statusLeitura, setStatusLeitura] = useState<'AGUARDANDO' | 'SUCESSO' | 'ERRO'>('AGUARDANDO');
  const [dadosResultado, setDadosResultado] = useState<any>(null);
  const [mensagemErro, setMensagemErro] = useState('');
  const [historicoSessao, setHistoricoSessao] = useState<string[]>([]);

  const scannerInputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null); 
  // Removi o ordemInputRef pois estamos usando selectRef agora

  // 1. Carrega a lista de ordens usando o serviço corrigido
  useEffect(() => {
    expedicaoService.listarOrdens()
        .then(data => setListaOrdens(data))
        .catch(err => console.error("Erro no load:", err));
  }, []);

  // 2. Gerenciamento de Foco (CORRIGIDO: Agora chamamos a função)
  useEffect(() => {
    const gerenciarFoco = () => {
        if (!ordemIdInput) {
             if (selectRef.current) selectRef.current.focus();
        } else {
            if (scannerInputRef.current) scannerInputRef.current.focus();
        }
    };
    
    // CHAMADA QUE FALTAVA
    gerenciarFoco();
    
    const interval = setInterval(() => {
        // Se tem ordem e o foco não está no select, joga pro scanner
        if (ordemIdInput && document.activeElement !== selectRef.current) {
            if (scannerInputRef.current) scannerInputRef.current.focus();
        }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [ordemIdInput]);

// Função auxiliar BLINDADA contra 1969
  const formatarData = (data: string | number[] | undefined | null) => {
      // Se for nulo, undefined ou zero, retorna aviso
      if (!data) return 'Data n/d';
      
      const dataObj = Array.isArray(data) 
        ? new Date(data[0], data[1]-1, data[2]) 
        : new Date(data);

      // Validação extra: Se o ano for menor que 2000, considera inválido
      if (dataObj.getFullYear() < 2000) return 'Data n/d';

      return dataObj.toLocaleDateString('pt-BR');
  };

  const handleScannerKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const skuLido = codigo.trim();
      setCodigo('');
      
      if (!skuLido) return;

      if (!ordemIdInput) {
        setStatusLeitura('ERRO');
        setMensagemErro('Selecione uma Ordem de Corte primeiro!');
        return;
      }

      await processarEntrada(skuLido);
    }
  };

  const processarEntrada = async (sku: string) => {
    try {
      setStatusLeitura('AGUARDANDO');

      const data = await expedicaoService.biparEntrada({
          codigoBarras: sku,
          ordemId: ordemIdInput ? parseInt(ordemIdInput) : null 
      });
      
      setStatusLeitura('SUCESSO');
      
      setDadosResultado({
        produto: data.nomeProduto,
        referencia: sku,
        cor: 'Padrão', 
        tamanho: 'UN',
        novoSaldo: data.novoSaldoEstoque,
        // CORREÇÃO: Usando os nomes certos (qtdConferida / qtdTotal)
        progresso: (data.qtdConferida !== undefined && data.qtdTotal !== undefined) 
            ? `${data.qtdConferida} / ${data.qtdTotal}` 
            : null
      });

      const hora = new Date().toLocaleTimeString();
      setHistoricoSessao(prev => [`✅ ${sku} - ${hora}`, ...prev]);

    } catch (error: any) {
      console.error(error);
      setStatusLeitura('ERRO');
      setMensagemErro(error.message || "Erro desconhecido");
      
      const hora = new Date().toLocaleTimeString();
      setHistoricoSessao(prev => [`❌ ${sku} - ${hora}`, ...prev]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainArea}>
        <header className={styles.header}>
           <div className={styles.iconWrapper}>
             <ScanBarcode size={28} color="#2563eb" />
           </div>
           <div>
             <h1 className={styles.title}>Entrada de Estoque</h1>
             <p className={styles.subtitle}>Conferência de Produção</p>
           </div>
        </header>

        {/* SELETOR DE ORDEM */}
        <div className={styles.filterBar}>
            <span className={styles.labelOC}>Selecione a Ordem:</span>
            
            <select 
                ref={selectRef}
                className={styles.selectOC} 
                value={ordemIdInput}
                onChange={(e) => setOrdemIdInput(e.target.value)}
            >
                <option value="">-- Selecione --</option>
                {listaOrdens.map(ordem => (
                    <option key={ordem.id} value={ordem.id}>
                        OC-{ordem.id} | {ordem.codigoOrdem || 'S/ Cod'} | {formatarData( ordem.dataEmissao)}
                    </option>
                ))}
            </select>

            {!ordemIdInput && (
                <span className={styles.avisoSelect}>
                    <AlertCircle size={16}/> Selecione p/ liberar
                </span>
            )}
        </div>

        <div className={styles.cardWrapper}>
            <MaisInfo status={statusLeitura} dados={dadosResultado} mensagem={mensagemErro} />
        </div>

        <div className={styles.inputWrapper}>
            <p>{ordemIdInput ? "Leitor ATIVO." : "Aguardando seleção de Ordem..."}</p>
            <input 
                ref={scannerInputRef}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onKeyDown={handleScannerKeyDown}
                className={styles.hiddenInput}
                disabled={!ordemIdInput}
                placeholder={ordemIdInput ? "Aguardando leitura..." : "Bloqueado"}
            />
        </div>
      </div>

      <aside className={styles.sidebar}>
         <div className={styles.sidebarHeader}>
            <History size={20} />
            <h3>Sessão Atual</h3>
         </div>
         <div className={styles.historyList}>
            {historicoSessao.length === 0 && (
                <div className={styles.emptyHistory}>
                    <Package size={32} />
                    <p>Nenhum item bipado.</p>
                </div>
            )}
            {historicoSessao.map((item, idx) => (
                <div key={idx} className={item.includes('❌') ? styles.historyItemErro : styles.historyItemSuccess}>
                    {item}
                </div>
            ))}
         </div>
      </aside>
    </div>
  );
};

export default Almoxarifado;