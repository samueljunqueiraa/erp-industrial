import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProdutosList.module.css'; 
import { produtoService, type ProdutoDTO } from '../../services/produtoService';
import { Plus, Edit, Trash2, ImageOff } from 'lucide-react';

const ProdutosList = () => {
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const data = await produtoService.getAll();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await produtoService.delete(id);
        setProdutos(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        alert('Erro ao excluir produto.');
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Produtos</h1>
        <button className={styles.novoBtn} onClick={() => navigate('/produtos/novo')}>
          <Plus size={18} style={{ marginRight: 8 }} />
          Novo Produto
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : produtos.length === 0 ? (
        <div className={styles.noData}>Nenhum produto cadastrado.</div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.dataTable}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th} style={{ width: '80px' }}>IMG</th>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>REFERÊNCIA</th>
                <th className={styles.th}>NOME</th>
                {/* Novas colunas adicionadas */}
                <th className={styles.th}>TECIDO</th>
                <th className={styles.th}>CATEGORIA</th>
                <th className={styles.th}>PREÇO BASE</th>
                <th className={styles.th}>STATUS</th>
                <th className={styles.th}>AÇÕES</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {produtos.map(prod => (
                <tr key={prod.id}>
                  {/* Coluna de Imagem */}
                  <td className={styles.td}>
                    {prod.imagemUrl ? (
                      <img 
                        src={prod.imagemUrl} 
                        alt="Foto" 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageOff size={16} color="#999" />
                      </div>
                    )}
                  </td>
                  
                  <td className={styles.td}>{prod.id}</td>
                  <td className={styles.td}><strong>{prod.referenciaBase}</strong></td>
                  <td className={styles.td}>{prod.nome}</td>

                  {/* ================================================================================
                      TODO BACKEND (LEMBRETE PARA O JAVA):
                      
                      No Banco de Dados, salvei apenas 'tecido_id' e 'categoria_id' (Integers).
                      Porém, para a listagem ficar amigável, o DTO do Backend deve retornar 
                      os nomes enriquecidos ('nomeTecido' e 'nomeCategoria').
                      
                      A lógica abaixo faz um FALLBACK: 
                      1. Tenta mostrar o nome (Ideal).
                      2. Se o backend não mandou o nome, mostra o ID (Provisório).
                      ================================================================================
                  */}
                  <td className={styles.td}>
                    {prod.nomeTecido || <span style={{color: '#999'}}>ID: {prod.tecidoId}</span>}
                  </td>
                  
                  <td className={styles.td}>
                    {prod.nomeCategoria || <span style={{color: '#999'}}>ID: {prod.categoriaId}</span>}
                  </td>
                  {/* ================================================================================ */}

                  <td className={styles.td}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.precoBase)}
                  </td>
                  
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${prod.ativo ? styles.ativo : styles.inativo}`}>
                      {prod.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  <td className={styles.td}>
                    <div className={styles.actionBtns}>
                      <button className={styles.editarBtn} onClick={() => navigate(`/produtos/editar/${prod.id}`)}>
                        <Edit size={16} />
                      </button>
                      <button className={styles.excluirBtn} onClick={() => handleDelete(prod.id!)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProdutosList;