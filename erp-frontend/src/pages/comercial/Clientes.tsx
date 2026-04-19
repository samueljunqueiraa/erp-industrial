import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from './Clientes.module.css';
import { clienteService, type ClienteDTO } from '../../services/clienteService';

// Função auxiliar simples para formatar se você não tiver o arquivo separado ainda
const formatDocumento = (doc: string) => {
  if (!doc) return '';
  const v = doc.replace(/\D/g, '');
  if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const formatTelefone = (tel: string) => {
  if (!tel) return '';
  const v = tel.replace(/\D/g, '');
  if (v.length === 11) return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  return v.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

const Clientes = () => {
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = () => {
    setLoading(true);
    clienteService.getAll()
      .then((data: ClienteDTO[]) => setClientes(data))
      .catch((error) => {
        console.error("Erro:", error);
        setClientes([]);
      })
      .finally(() => setLoading(false));
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await clienteService.delete(id);
        setClientes(listaAtual => listaAtual.filter(cliente => cliente.id !== id));
        alert('Cliente excluído com sucesso!');
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir. Verifique dependências.');
      }
    }
  };

  const handleNovo = () => navigate('/comercial/clientes/novo'); 
  const handleEditar = (id: number) => navigate(`/comercial/clientes/editar/${id}`); 

  const clientesFiltrados = useMemo(() => {
    if (!busca.trim()) return clientes;
    const texto = busca.toLowerCase();
    
    return clientes.filter(c =>
      // CORREÇÃO: Usando razaoSocial e cnpj (nomes do DTO)
      (c.nome|| '').toLowerCase().includes(texto) ||
      (c.nomeFantasia || '').toLowerCase().includes(texto) ||
      (c.cpfCnpj || '').toLowerCase().includes(texto) ||
      (c.municipio || '').toLowerCase().includes(texto)
    );
  }, [clientes, busca]);

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Clientes</h1>
        <button className={styles.novoBtn} onClick={handleNovo}>
          + Novo Cliente
        </button>
      </div>
      
      <input
        className={styles.filterBar}
        placeholder="Buscar Cliente por Nome, Fantasia, CNPJ ou Cidade..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : clientesFiltrados.length === 0 ? (
        <div className={styles.noData}>Nenhum cliente encontrado.</div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.dataTable}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>CÓDIGO</th>
                <th className={styles.th}>NOME / RAZÃO SOCIAL</th>
                <th className={styles.th}>NOME FANTASIA</th>
                <th className={styles.th}>CNPJ / CPF</th>
                <th className={styles.th}>CIDADE</th>
                <th className={styles.th}>TELEFONE</th>
                <th className={styles.th}>AÇÕES</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td className={styles.td}>{cliente.id?.toString().padStart(4, '0')}</td>
                  
                  {/* nome */}
                  <td className={styles.td}>{cliente.nome}</td>
                  
                  <td className={styles.td}>{cliente.nomeFantasia}</td>
                  
                  {/* CORREÇÃO: Usando cpfCnpj */}
                  <td className={styles.td}>{formatDocumento(cliente.cpfCnpj)}</td>
                  
                  <td className={styles.td}>{cliente.municipio}</td>
                  <td className={styles.td}>{formatTelefone(cliente.telefone || cliente.celular || '')}</td>
                  
                  <td className={styles.td}>
                    <div className={styles.actionBtns}>
                      <button className={styles.editarBtn} onClick={() => handleEditar(cliente.id!)}>
                        Editar
                      </button>
                      <button className={styles.excluirBtn} onClick={() => handleExcluir(cliente.id!)}>
                        Excluir
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

export default Clientes;