import React from 'react';
import { Search, Square, CheckSquare } from 'lucide-react';
import styles from './CustomerData.module.css';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { PedidoFormValues } from './ProductMatrix';
import { clienteService, type ClienteDTO } from '../../../services/clienteService';

export interface CustomerDataFormValues {
  id?: number;
  nome?: string;
  razaoSocial?: string; 
  contato?: string;
  cpfCnpj?: string;
  enderecoEntrega?: string;
  telefone?: string;
  // Dados de Frete
  municipio: string;
  bairro: string;
  cep: string;
  estado: string;
  condPagamento: string;
  transportadora: string;
  valorFrete: string;
  status: string;
  email1: string;
  email2: string;
  tipoFrete: string;
}

interface CustomerDataProps {
  register: UseFormRegister<PedidoFormValues>;
  watch: UseFormWatch<PedidoFormValues>;
  setValue: UseFormSetValue<PedidoFormValues>;
}

const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const condPagamentos = ['À vista', '30 dias', '60 dias'];
const transportadoras = ['Jadlog', 'Correios', 'FedEx'];
const statusList = ['Pendente', 'Aprovado', 'Cancelado'];
const tiposFrete = ['CIF', 'FOB', 'Retira'];

const CustomerData: React.FC<CustomerDataProps> = ({ register, setValue }) => {
  const [search, setSearch] = React.useState('');
  
  // Armazena TODOS os clientes para filtro local (Segurança contra falha de API de busca)
  const [todosClientes, setTodosClientes] = React.useState<ClienteDTO[]>([]);
  const [sugestoes, setSugestoes] = React.useState<ClienteDTO[]>([]);
  const [mostrarLista, setMostrarLista] = React.useState(false);

  const [clienteData, setClienteData] = React.useState<Partial<CustomerDataFormValues>>({});
  const [useStandardAddress, setUseStandardAddress] = React.useState(false);

  // 1. Carrega TUDO ao iniciar (Garante que temos os dados, igual na tela de listagem)
  React.useEffect(() => {
    clienteService.getAll()
      .then((data) => {
        setTodosClientes(data);
      })
      .catch((err) => console.error("Erro ao carregar clientes:", err));
  }, []);

  // 2. Filtra localmente quando o usuário digita
  React.useEffect(() => {
    if (search.length < 2) {
      setSugestoes([]);
      setMostrarLista(false);
      return;
    }

    const termo = search.toLowerCase();
    
    // Filtro robusto: Procura por Nome, Razão Social ou CNPJ
    const filtrados = todosClientes.filter(c => {
      const nome = (c.nome || (c as any).nome || '').toLowerCase();
      const fantasia = (c.nomeFantasia || '').toLowerCase();
      const doc = (c.cpfCnpj || '').replace(/\D/g, ''); // Remove a pontuação para busca
      
      return nome.includes(termo) || fantasia.includes(termo) || doc.includes(termo);
    });

    setSugestoes(filtrados);
    setMostrarLista(filtrados.length > 0);
  }, [search, todosClientes]);

  // 3. Selecionar Cliente
  const selecionarCliente = (cliente: ClienteDTO) => {
    const rua = cliente.endereco || (cliente as any).endereco || '';
    const enderecoCompleto = `${rua}, ${cliente.numero || 'S/N'} - ${cliente.bairro || ''}`;
    const nomeExibicao = cliente.nome || (cliente as any).nome || 'Sem Nome';

    setClienteData({
       id: cliente.id,
       nome: nomeExibicao, 
       razaoSocial: nomeExibicao, 
       cpfCnpj: cliente.cpfCnpj, 
       telefone: cliente.telefone,
       enderecoEntrega: enderecoCompleto,
       contato: cliente.email || '', 
       municipio: cliente.municipio,
       bairro: cliente.bairro,
       cep: cliente.cep,
       estado: cliente.estado,
       email1: cliente.email
    });

    setValue('clienteId', Number(cliente.id)); 
    
    setMostrarLista(false);
    setSearch(''); 
  };

  const handleToggleStandard = () => {
    if (!clienteData.nome) {
      alert("Busque e selecione um cliente primeiro.");
      return;
    }

    const newState = !useStandardAddress;
    setUseStandardAddress(newState);

    if (newState) {
      setValue('municipio', clienteData.municipio || '');
      setValue('bairro', clienteData.bairro || '');
      setValue('cep', clienteData.cep || '');
      setValue('estado', clienteData.estado || '');
      setValue('condPagamento', 'À vista');
      setValue('transportadora', 'Jadlog');
      setValue('email1', clienteData.email1 || '');
    }
  };

  const handleEditManual = () => {
    setUseStandardAddress(false);
    const inputMunic = document.querySelector('input[name="municipio"]') as HTMLInputElement;
    if(inputMunic) inputMunic.focus();
  };

  return (
    <div className={styles.customerDataContainer}>
      <div className={styles.searchBlock}>
        <h2 className={styles.representanteTitle}>BUSCAR CLIENTE</h2>
        
        <div className={styles.searchInputWrapper} style={{ position: 'relative' }}>
          <Search size={20} color="#222" style={{ marginRight: 8 }} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar Cliente (digite 2 letras)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => { if(sugestoes.length > 0) setMostrarLista(true) }}
            onBlur={() => setTimeout(() => setMostrarLista(false), 200)}
          />

          {mostrarLista && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              listStyle: 'none',
              padding: 0,
              margin: '4px 0 0 0'
            }}>
              {sugestoes.map((cliente) => (
                <li 
                  key={cliente.id}
                  onClick={() => selecionarCliente(cliente)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    fontSize: '14px',
                    color: '#333'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <strong>{cliente.nome || (cliente as any).nome}</strong>
                  <br/>
                  <small style={{ color: '#666' }}>
                    {cliente.municipio} - {cliente.cpfCnpj}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.infoGrid}>
        <label className={styles.label}>CLIENTE</label>
        {/* Mostra o nome selecionado ou traço */}
        <input className={styles.infoInput} value={clienteData.nome || ''} disabled placeholder="-" />
        <label className={styles.label}>RAZÃO SOCIAL</label>
        <input className={styles.infoInput} value={clienteData.razaoSocial || ''} disabled placeholder="-" />
        <label className={styles.label}>CONTATO / E-MAIL</label>
        <input className={styles.infoInput} value={clienteData.contato || ''} disabled placeholder="-" />
        <label className={styles.label}>CNPJ/CPF</label>
        <input className={styles.infoInput} value={clienteData.cpfCnpj || ''} disabled placeholder="-" />
        <label className={styles.label}>ENDEREÇO DE ENTREGA</label>
        <input className={styles.infoInput} value={clienteData.enderecoEntrega || ''} disabled placeholder="-" />
        <label className={styles.label}>TELEFONE</label>
        <input className={styles.infoInput} value={clienteData.telefone || ''} disabled placeholder="-" />
      </div>

      {/* Botões e Bloco de Frete mantidos iguais... */}
      <div className={styles.linhaEntregaRow}>
          <span>Selecionar Linha de entrega:</span>
          <button 
            type="button" 
            className={useStandardAddress ? styles.padraoBtnActive : styles.padraoBtn}
            onClick={handleToggleStandard}
            style={{ 
              backgroundColor: useStandardAddress ? '#2a2a2a' : '#000000',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '500',
              padding: '10px 12px',
              cursor: 'pointer'
            }}
          >
            {useStandardAddress ? <CheckSquare size={16} color="#ffffff" style={{ marginRight: 6 }} /> : <Square size={16} color="#fff" style={{ marginRight: 6 }} />} 
            Padrão
          </button>

          <button type="button" className={styles.editarBtn} onClick={handleEditManual}>
            Editar
          </button>
      </div>

      <div className={styles.freteBlock}>
        <h4 className={styles.freteHeader}>DADOS DE FRETE:</h4>
        <div className={styles.freteFormGrid}>
          <input {...register('municipio')} className={styles.freteInput} placeholder="Município" />
          <input {...register('bairro')} className={styles.freteInput} placeholder="Bairro" />
          <input {...register('cep')} className={styles.freteInput} placeholder="CEP" />
          <select {...register('estado')} className={styles.freteInput}>
            <option value="">Estado</option>
            {estados.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select {...register('condPagamento')} className={styles.freteInput}>
            <option value="">Cond. Pagamento</option>
            {condPagamentos.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select {...register('transportadora')} className={styles.freteInput}>
            <option value="">Transportadora</option>
            {transportadoras.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input {...register('valorFrete')} className={styles.freteInput} placeholder="Valor Frete" type="number" min="0" step="0.01" />
          <select {...register('status')} className={styles.freteInput}>
            <option value="">Status</option>
            {statusList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input {...register('email1')} className={styles.freteInput} placeholder="E-mail 1" type="email" />
          <input {...register('email2')} className={styles.freteInput} placeholder="E-mail 2" type="email" />
        </div>
        
        <div className={styles.freteFooter}>
          <select {...register('tipoFrete')} className={styles.tipoFreteSelect}>
            <option value="">Tipo de frete</option>
            {tiposFrete.map(tf => <option key={tf} value={tf}>{tf}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CustomerData;