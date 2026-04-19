import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ClienteForm.module.css';

// Atualizado para usar o DTO correto
import { clienteService, type ClienteDTO } from '../../services/clienteService';

const estados = [
  '', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Estado inicial batendo com a interface ClienteDTO
const initialState: ClienteDTO = {
  nome: '',
  nomeFantasia: '',
  endereco: '',
  bairro: '',
  municipio: '',
  estado: '',
  cep: '',
  telefone: '',
  celular: '',
  cpfCnpj: '', 
  email: ''
};

const ClienteForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<ClienteDTO>(initialState);
  const [loading, setLoading] = useState(false);

  // Máscaras atualizadas com os novos nomes de variáveis
  const maskInput = (name: string, value: string) => {
    const cleanValue = value.replace(/\D/g, '');

    if (name === 'cep') {
      return cleanValue.replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
    }

    if (name === 'telefone') {
      return cleanValue
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    }

    if (name === 'celular') {
      return cleanValue
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/^(\(\d{2}\) \d)(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 16);
    }

    if (name === 'cpfCnpj') {
      if (cleanValue.length <= 11) {
        return cleanValue
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})/, '$1-$2')
          .substring(0, 14);
      } else {
        return cleanValue
          .replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .substring(0, 18);
      }
    }

    return value; 
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      clienteService.getById(Number(id))
        .then((data) => {
           // Garante que o form receba os dados, mesmo que algum venha null do banco
           setForm({
             ...initialState,
             ...data,
             // Garante strings vazias se vier null/undefined para não quebrar o input uncontrolled
             celular: data.celular || '',
             nomeFantasia: data.nomeFantasia || ''
           });
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Aplica máscara apenas nos campos necessários
    const needsMask = ['cep', 'telefone', 'celular', 'cnpj'].includes(name);
    const finalValue = needsMask ? maskInput(name, value) : value;
    
    setForm(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Limpa máscaras antes de enviar para o Backend
    const payload = {
      ...form,
      cep: form.cep.replace(/\D/g, ''),
      telefone: form.telefone.replace(/\D/g, ''),
      celular: form.celular ? form.celular.replace(/\D/g, '') : '',
      cnpj: form.cpfCnpj.replace(/\D/g, '')
    };

    try {
      if (id) {
        await clienteService.update(Number(id), payload);
      } else {
        await clienteService.create(payload);
      }
      navigate(-1);
    } catch (error) {
      alert('Erro ao salvar cliente. Verifique o console.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: '40px' }}>
      <div className={styles.formWrapper}>
        <div className={styles.title}>{id ? 'Editar Cliente' : 'Novo Cliente'}</div>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.formGrid}>
            
            {/* Razão Social (Antigo Nome) */}
            <div className={styles.row}>
              <label className={styles.label}>Razão Social / Nome</label>
              <input 
                className={styles.input} 
                name="razaoSocial" 
                value={form.nome} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>
            
            <div className={styles.row}>
              <label className={styles.label}>Nome Fantasia</label>
              <input 
                className={styles.input} 
                name="nomeFantasia" 
                value={form.nomeFantasia} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>

            {/* Endereço */}
            <div className={styles.row}>
              <label className={styles.label}>Endereço (Rua)</label>
              <input 
                className={styles.input} 
                name="endereco" 
                value={form.endereco} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>
            
            <div className={styles.row}>
              <label className={styles.label}>Bairro</label>
              <input 
                className={styles.input} 
                name="bairro" 
                value={form.bairro} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>

            <div className={styles.row}>
              <label className={styles.label}>Cidade</label>
              <input 
                className={styles.input} 
                name="municipio" 
                value={form.municipio} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>
            
            <div className={styles.row}>
              <label className={styles.label}>Estado</label>
              <select 
                className={styles.select} 
                name="estado" 
                value={form.estado || ''} 
                onChange={handleChange} 
                required 
                disabled={loading}
              >
                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            <div className={styles.row}>
              <label className={styles.label}>CEP</label>
              <input 
                className={styles.input} 
                name="cep" 
                value={form.cep} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>
            
            <div className={styles.row}>
              <label className={styles.label}>Telefone</label>
              <input 
                className={styles.input} 
                name="telefone" 
                value={form.telefone} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>

            <div className={styles.row}>
              <label className={styles.label}>Celular</label>
              <input 
                className={styles.input} 
                name="celular" 
                value={form.celular} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>
            
            {}
            <div className={styles.row}>
              <label className={styles.label}>CNPJ / CPF</label>
              <input 
                className={styles.input} 
                name="cnpj" 
                value={form.cpfCnpj} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>

            <div className={styles.row} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>E-mail</label>
              <input 
                type="email" 
                className={styles.input} 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.salvarBtn} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className={styles.cancelarBtn} onClick={() => navigate(-1)} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;