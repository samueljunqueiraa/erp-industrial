import { useEffect, useState, type FormEvent } from 'react';
import { FiPrinter } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './OrdemCorteStyle.module.css';
import { produtoService, type ProdutoDTO } from '../../services/produtoService';
import { ordemService, type TamanhoDTO, type OrdemCorteDTO } from '../../services/ordemService';
import { aviamentoService, type AviamentoDTO } from '../../services/aviamentoService';
import { etiquetaService } from '../../services/etiquetaService';

const OrdemCorteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditing = !!id; 

  const [loading, setLoading] = useState(false);
  const [detalhesTexto, setDetalhesTexto] = useState({ tecido: '', cor: '' });

  // Listas
  const [listaProdutos, setListaProdutos] = useState<ProdutoDTO[]>([]);
  const [listaTamanhos, setListaTamanhos] = useState<TamanhoDTO[]>([]);
  const [listaBotoes, setListaBotoes] = useState<AviamentoDTO[]>([]);
  const [listaLinhas, setListaLinhas] = useState<AviamentoDTO[]>([]);
  const [listaZiperes, setListaZiperes] = useState<AviamentoDTO[]>([]);

  // Estados do Formulário
  const [produtoId, setProdutoId] = useState<number>(0);
  const [observacao, setObservacao] = useState('');
  const [status, setStatus] = useState('PLANEJADA');
  
  const [aviamentos, setAviamentos] = useState({
    botao: '',
    linha: '',
    ziper: ''
  });

  const [gradeQtd, setGradeQtd] = useState<Record<number, string>>({}); 

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      const [prods, tams, botoes, linhas, ziperes] = await Promise.all([
        produtoService.getAll(),
        ordemService.getTamanhos(),
        aviamentoService.getByTipo('BOTAO'),
        aviamentoService.getByTipo('LINHA'),
        aviamentoService.getByTipo('ZIPER')
      ]);

      setListaProdutos(prods);
      setListaTamanhos(tams);
      setListaBotoes(botoes);
      setListaLinhas(linhas);
      setListaZiperes(ziperes);

      if (isEditing) {
        carregarDadosOrdem(Number(id));
      }

    } catch (error) {
      console.error(error);
      alert('Erro ao carregar listas.');
    }
  };

  const carregarDadosOrdem = async (ordemId: number) => {
    try {
      setLoading(true);
      const ordem = await ordemService.getById(ordemId);
      
      setProdutoId(ordem.produtoId);
      setObservacao(ordem.observacao || '');
      setStatus(ordem.status || 'PLANEJADA');
      
      setAviamentos({
        botao: ordem.botaoCodigo || '',
        linha: ordem.linhaCor || '',
        ziper: ordem.zipperCor || ''
      });

      setDetalhesTexto({
        tecido: ordem.produtoTecido || '',
        cor: ordem.produtoCor || ''
      });

      const gradeState: Record<number, string> = {};
      if (ordem.grade) {
        ordem.grade.forEach(item => {
            gradeState[item.tamanhoId] = String(item.quantidade);
        });
      }
      setGradeQtd(gradeState);

    } catch (error) {
      alert('Erro ao buscar dados da ordem.');
      navigate('/producao/ordens');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!produtoId) return alert('Selecione um Produto!');

    setLoading(true);

    const gradeFormatada = Object.entries(gradeQtd).map(([tamId, qtd]) => ({
      tamanhoId: Number(tamId),
      quantidade: Number(qtd)
    })).filter(item => item.quantidade > 0);

    const payload: OrdemCorteDTO = {
      produtoId,
      botaoCodigo: aviamentos.botao,
      linhaCor: aviamentos.linha,
      zipperCor: aviamentos.ziper,
      observacao,
      grade: gradeFormatada,
      status: status
    };

    try {
      if (isEditing) {
        await ordemService.update(Number(id), payload);
        alert('Ordem atualizada com sucesso!');
      } else {
        await ordemService.create(payload);
        alert('Ordem criada com sucesso!');
      }
      navigate('/producao/ordens');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar ordem.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (tamanhoId: number, valor: string) => {
    setGradeQtd(prev => ({ ...prev, [tamanhoId]: valor }));
  };

  const totalPecas = Object.values(gradeQtd).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

  return (
    // --- WRAPPER DE SCROLL (NOVO) ---
    <div className={styles.pageScroll}>
      
      {/* Container "Cartão Branco" */}
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{isEditing ? `Editar Ordem #${id}` : 'Nova Ordem de Corte'}</h2>
          <p>Defina o produto, aviamentos e a grade de produção.</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* LINHA 1: PRODUTO E STATUS */}
          <div className={styles.row}>
            <div className={styles.col6}>
              <label className={styles.label}>Produto</label>
              <select 
                className={styles.select}
                value={produtoId}
                onChange={(e) => setProdutoId(Number(e.target.value))}
                disabled={isEditing}
                required
              >
                <option value={0}>Selecione...</option>
                {listaProdutos.map(p => (
                  <option key={p.id} value={p.id}>{p.referenciaBase} - {p.nome}</option>
                ))}
              </select>
            </div>

            {isEditing && (
              <div className={styles.col4}>
                <label className={styles.label} style={{color: '#b91c1c'}}>Status</label>
                <select 
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{borderColor: status === 'CANCELADA' ? 'red' : ''}}
                >
                  <option value="PLANEJADA">Planejada</option>
                  <option value="EM_CORTE">Em Corte</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="CANCELADA">🚫 CANCELADA</option>
                </select>
              </div>
            )}
            
            <div className={styles.col4}>
               <div style={{background: '#f1f5f9', padding: '10px', borderRadius: '6px', textAlign: 'center'}}>
                  <span className={styles.label}>TOTAL</span>
                  <div style={{fontSize: '24px', fontWeight: 'bold', color: '#334155'}}>{totalPecas}</div>
               </div>
            </div>
          </div>

          {/* LINHA 2: AVIAMENTOS */}
          <div className={styles.row}>
             <div className={styles.col4}>
               <label className={styles.label}>Botão</label>
               <select className={styles.select} value={aviamentos.botao} onChange={e => setAviamentos({...aviamentos, botao: e.target.value})}>
                  <option value="">Selecione...</option>
                  {listaBotoes.map(i => <option key={i.id} value={`${i.nome} (${i.codigoReferencia})`}>{i.nome}</option>)}
               </select>
             </div>
             
             <div className={styles.col4}>
               <label className={styles.label}>Linha</label>
               <select className={styles.select} value={aviamentos.linha} onChange={e => setAviamentos({...aviamentos, linha: e.target.value})}>
                  <option value="">Selecione...</option>
                  {listaLinhas.map(i => <option key={i.id} value={`${i.nome} (${i.codigoReferencia})`}>{i.nome}</option>)}
               </select>
             </div>

             <div className={styles.col4}>
               <label className={styles.label}>Zíper</label>
               <select className={styles.select} value={aviamentos.ziper} onChange={e => setAviamentos({...aviamentos, ziper: e.target.value})}>
                  <option value="">Selecione...</option>
                  {listaZiperes.map(i => <option key={i.id} value={`${i.nome} (${i.codigoReferencia})`}>{i.nome}</option>)}
               </select>
             </div>
          </div>

          {/* LINHA 3: GRADE */}
          <div className={styles.sectionTitle}>Grade de Corte</div>
          <div className={styles.gradeContainer}>
            <div className={styles.gradeGrid}>
              {listaTamanhos.map(tamanho => (
                <div key={tamanho.id} className={styles.tamanhoBox}>
                  <span className={styles.tamanhoLabel}>{tamanho.nome}</span>
                  <input 
                    type="number" min="0" className={styles.qtdInput} placeholder="0"
                    value={gradeQtd[tamanho.id] || ''}
                    onChange={(e) => handleGradeChange(tamanho.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* LINHA 4: OBSERVAÇÕES */}
          <div className={styles.row} style={{marginTop: '20px'}}>
              <div className={styles.col12}>
                  <label className={styles.label}>Observações</label>
                  <textarea className={styles.textarea} rows={3} value={observacao} onChange={e => setObservacao(e.target.value)}/>
              </div>
          </div>

          {/* RODAPÉ */}
          <div className={styles.footer}>
            <button type="button" className={`${styles.btn}`} onClick={() => navigate('/producao/ordens')}>Voltar</button>

            {/* --- BOTÃO DE IMPRIMIR ETIQUETAS ADICIONADO AQUI --- */}
            <button 
                type="button" 
                className={`${styles.btn}`} 
                style={{backgroundColor: '#6c757d', color: '#fff', marginLeft: '10px'}}
                onClick={() => {
                    if (!produtoId) return alert('Selecione um produto primeiro.');
                    
                    const produtoSelecionado = listaProdutos.find(p => p.id === produtoId);
                    if (!produtoSelecionado) return alert('Dados do produto não carregados.');

                    const gradeFormatada = Object.entries(gradeQtd).map(([tamId, qtd]) => ({
                        tamanhoId: Number(tamId),
                        quantidade: Number(qtd)
                    })).filter(item => item.quantidade > 0);
                    
                    if (gradeFormatada.length === 0) return alert('Preencha a grade para imprimir.');

                    // Monta objeto compatível com o service
                    const dadosParaImpressao = {
                    id: Number(id), // <--- ADICIONE ESTA LINHA! (Pega o ID da URL)
                    numeroLote: isEditing ? `OC-${id}` : null, // Opcional: força o envio do lote
                    produtoId: produtoSelecionado.id,
                    produtoNome: produtoSelecionado.nome,
                    produtoReferencia: produtoSelecionado.referenciaBase,
                    produtoCorId: produtoSelecionado.corId,
                    produtoTecido: detalhesTexto.tecido || 'S/ TECIDO',
                    produtoCor: detalhesTexto.cor || 'S/ COR',
                    grade: gradeFormatada,
                };
                    
                    etiquetaService.gerarEtiquetasZebra(dadosParaImpressao, listaTamanhos);
                }}
            >
                <FiPrinter style={{marginRight: '5px'}}/> Etiquetas
            </button>
            {/* ----------------------------------------------------- */}

            <button type="submit" className={`${styles.btn} ${styles.btnSalvar}`} disabled={loading}>
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar Ordem' : 'Criar Ordem')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OrdemCorteForm;