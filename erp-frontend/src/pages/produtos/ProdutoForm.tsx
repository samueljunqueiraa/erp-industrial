import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProdutoFormStyle.module.css';
import { 
  produtoService,
  type CorDTO, 
  type ProdutoDTO, 
  type TecidoDTO, 
  type CategoriaDTO 
} from '../../services/produtoService';

const initialState: ProdutoDTO = {
  nome: '',
  referenciaBase: '',
  descricao: '',
  tecidoId: 0,
  categoriaId: 0,
  corId: 0,
  precoBase: 0,
  ativo: true,
  imagemUrl: ''
};

const ProdutoForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<ProdutoDTO>(initialState);
  const [loading, setLoading] = useState(false);

  // Estados para armazenar as listas vindas do banco
  const [listaCores, setListaCores] = useState<CorDTO[]>([]);
  const [listaTecidos, setListaTecidos] = useState<TecidoDTO[]>([]);
  const [listaCategorias, setListaCategorias] = useState<CategoriaDTO[]>([]);

  // 1. Carrega dados iniciais
  useEffect(() => {
    carregarDados();
  }, [id]);
 useEffect(() => {
    if (id) return; 

    const referenciaAtual = form.referenciaBase || '';
    const isVaziaOuAuto = referenciaAtual === '' || (referenciaAtual.includes('-') && referenciaAtual.length <= 12);

    if (isVaziaOuAuto) {
      const cat = listaCategorias.find(c => c.id === Number(form.categoriaId));
      const tec = listaTecidos.find(t => t.id === Number(form.tecidoId));
      const cor = listaCores.find(c => c.id === Number(form.corId)); // Busca a cor

      if (cat && tec) {
        const prefixoCat = cat.nome.substring(0, 3).toUpperCase();
        const prefixoTec = tec.nome.substring(0, 3).toUpperCase();
        
        let sugestao = `${prefixoCat}-${prefixoTec}`;

        // Se tiver cor selecionada, adiciona 3 letras da cor
        if (cor) {
           const prefixoCor = cor.nome.substring(0, 3).toUpperCase();
           sugestao += `-${prefixoCor}-`; // Ex: TER-GAB-AZU-
        } else {
           sugestao += `-`;
        }
        
        setForm(prev => ({ ...prev, referenciaBase: sugestao }));
      }
    }
  }, [form.categoriaId, form.tecidoId, form.corId, listaCategorias, listaTecidos, listaCores, id]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // 1. Busca Tecidos e Categorias do Backend
      const [listaCores, tecidosData, categoriasData] = await Promise.all([
        produtoService.getCores(),
        produtoService.getTecidos(),
        produtoService.getCategorias()
      ]);
      setListaCores(listaCores);
      setListaTecidos(tecidosData);
      setListaCategorias(categoriasData);

      // 2. Se for edição, busca o produto
      if (id) {
        const produtoData = await produtoService.getById(Number(id));
        setForm(produtoData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
      alert("Erro ao carregar listas de apoio.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    setForm(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validação simples
      if (!form.tecidoId || Number(form.tecidoId) === 0) {
        alert("Selecione um Tecido!");
        setLoading(false);
        return;
      }
      if (!form.categoriaId || Number(form.categoriaId) === 0) {
        alert("Selecione uma Categoria!");
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        precoBase: Number(form.precoBase),
        tecidoId: Number(form.tecidoId),
        categoriaId: Number(form.categoriaId),
        corId: Number(form.corId)
      };

      if (id) {
        await produtoService.update(Number(id), payload);
      } else {
        await produtoService.create(payload);
      }
      alert('Produto salvo com sucesso!');
      navigate(-1);
    } catch (error) {
      alert('Erro ao salvar produto.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.formWrapper}>
        <div className={styles.title}>{id ? 'Editar Produto' : 'Novo Produto'}</div>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.formGrid}>
            
            {/* Nome */}
            <div className={`${styles.fieldGroup} ${styles.col9}`}>
              <label className={styles.label}>Nome do Produto</label>
              <input 
                className={styles.input} 
                name="nome" 
                value={form.nome} 
                onChange={handleChange} 
                required 
                placeholder="Ex: Terno Slim Fit"
              />
            </div>
            
            {/* Referência (Automática) */}
            <div className={`${styles.fieldGroup} ${styles.col3}`}>
              <label className={styles.label}>Referência</label>
              <input 
                className={styles.input} 
                name="referenciaBase" 
                value={form.referenciaBase} 
                onChange={handleChange} 
                required 
                placeholder="Gerada automaticamente..."
              />
            </div>

            {/* Preço (4 colunas) */}
            <div className={`${styles.fieldGroup} ${styles.col4}`}>
              <label className={styles.label}>Preço Base (R$)</label>
              <input 
                type="number"
                step="0.01"
                className={styles.input} 
                name="precoBase" 
                value={form.precoBase} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* --- NOVO CAMPO: COR (4 colunas) --- */}
            <div className={`${styles.fieldGroup} ${styles.col4}`}>
              <label className={styles.label}>Cor Predominante</label>
              <select 
                className={styles.select} 
                name="corId" 
                value={form.corId} 
                onChange={handleChange}
                required
              >
                <option value="0">Selecione...</option>
                {listaCores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className={`${styles.fieldGroup} ${styles.col8}`}>
              <label className={styles.checkboxWrapper}>
                <input 
                  type="checkbox" 
                  name="ativo" 
                  checked={form.ativo} 
                  onChange={handleChange} 
                  className={styles.checkbox}
                />
                <span className={styles.checkboxLabel}>Produto Ativo</span>
              </label>
            </div>

            {/* Tecido */}
            <div className={`${styles.fieldGroup} ${styles.col6}`}>
              <label className={styles.label}>Tecido</label>
              <select 
                className={styles.select} 
                name="tecidoId" 
                value={form.tecidoId} 
                onChange={handleChange}
                required
              >
                <option value="0">Selecione o Tecido...</option>
                {listaTecidos.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div className={`${styles.fieldGroup} ${styles.col6}`}>
              <label className={styles.label}>Categoria</label>
              <select 
                className={styles.select} 
                name="categoriaId" 
                value={form.categoriaId} 
                onChange={handleChange}
                required
              >
                <option value="0">Selecione a Categoria...</option>
                {listaCategorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Imagem */}
            <div className={`${styles.fieldGroup} ${styles.col12}`}>
              <label className={styles.label}>URL da Imagem</label>
              <input 
                className={styles.input} 
                name="imagemUrl" 
                value={form.imagemUrl || ''} 
                onChange={handleChange} 
                placeholder="https://..."
              />
            </div>

            {/* Preview */}
            <div className={`${styles.fieldGroup} ${styles.col12}`}>
              <div className={styles.imagePreviewBox}>
                {form.imagemUrl ? (
                  <img 
                    src={form.imagemUrl} 
                    alt="Preview" 
                    className={styles.previewImg} 
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <span style={{color: '#9ca3af', fontSize: '14px'}}>Preview da imagem</span>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className={`${styles.fieldGroup} ${styles.col12}`}>
              <label className={styles.label}>Descrição Detalhada</label>
              <textarea 
                className={styles.textarea} 
                name="descricao" 
                value={form.descricao} 
                onChange={handleChange} 
                rows={4}
              />
            </div>

          </div>

          <div className={styles.footer}>
            <button type="button" className={`${styles.btn} ${styles.cancelarBtn}`} onClick={() => navigate(-1)} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={`${styles.btn} ${styles.salvarBtn}`} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProdutoForm;