import React, { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import styles from './GestaoUsuarios.module.css';
import { usuarioService, type Usuario } from '../../services/usuarioService';

const papeis = [
  { label: 'Gerente Fabril', value: 'GERENTE_FABRIL' },
  { label: 'Representante de Vendas', value: 'VENDEDOR' },
  { label: 'Gerente de Vendas', value: 'GERENTE_VENDAS' },
  { label: 'Expedição', value: 'EXPEDICAO' },
  { label: 'Operador', value: 'OPERADOR' }
];

const GestaoUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para saber se estamos editando alguém (null = criando novo)
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<Usuario>({
    nomeCompleto: '',
    email: '',
    senha: '',
    papel: 'OPERADOR', 
    ativo: true
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const dados = await usuarioService.getAll();
      setUsuarios(dados || []); 
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Tratamento especial para o Select de Boolean (Status)
    if (name === 'ativo') {
      setForm(prev => ({ ...prev, ativo: value === 'true' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingId(user.id!); // Marca que estamos editando esse ID
    setForm({
      nomeCompleto: user.nomeCompleto,
      email: user.email,
      senha: '', // Limpa a senha para não enviar hash antigo. Se vazio, o back mantém a atual.
      papel: user.papel,
      ativo: user.ativo
    });
    // Rola a tela para o topo suavemente para o usuário ver o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ nomeCompleto: '', email: '', senha: '', papel: 'OPERADOR', ativo: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validação de senha apenas na CRIAÇÃO
    if (!editingId && (!form.senha || form.senha.length < 4)) {
      alert("Para criar, a senha precisa ter pelo menos 4 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // --- MODO EDIÇÃO ---
        await usuarioService.update(editingId, form);
        alert('Usuário atualizado com sucesso!');
      } else {
        // --- MODO CRIAÇÃO ---
        await usuarioService.create(form);
        alert('Usuário criado com sucesso!');
      }
      
      handleCancelEdit(); // Limpa tudo e volta pro modo criar
      carregarUsuarios(); // Atualiza a tabela
    } catch (error) {
      alert('Erro na operação. Verifique os dados.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestão de Usuários</h1>

      {/* CARD DE CADASTRO / EDIÇÃO */}
      <div className={styles.card} style={{ borderLeft: editingId ? '4px solid #F59E0B' : '4px solid #0069FE' }}>
        <h3>
            {editingId ? `Editando Usuário #${editingId}` : 'Adicionar Novo Usuário'}
        </h3>
        
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          
          <div className={styles.field}>
            <label>Nome Completo:</label>
            <input 
              name="nomeCompleto" 
              value={form.nomeCompleto} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={styles.field}>
            <label>E-mail (Login):</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={styles.field}>
            <label>Senha {editingId && '(Deixe em branco para manter)'}:</label>
            <input 
              type="password" 
              name="senha" 
              value={form.senha} 
              onChange={handleChange} 
              // Required só se for novo
              required={!editingId} 
              placeholder={editingId ? "Só preencha se quiser trocar a senha" : "Mínimo 4 caracteres"} 
            />
          </div>

          <div className={styles.field}>
            <label>Perfil de Acesso</label>
            <select name="papel" value={form.papel} onChange={handleChange}>
              {papeis.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/*STATUS */}
          <div className={styles.field}>
            <label>Status</label>
            <select name="ativo" value={String(form.ativo)} onChange={handleChange}>
              <option value="true">Ativo</option>
              <option value="false">Inativo (Bloquear Acesso)</option>
            </select>
          </div>

          <div className={styles.actions} style={{ gap: '10px' }}>
             {editingId && (
                <button type="button" onClick={handleCancelEdit} style={{ background: '#9CA3AF' }}>
                    Cancelar
                </button>
             )}
            <button type="submit" disabled={loading} style={{ background: editingId ? '#F59E0B' : '#0069FE' }}>
              {loading ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Criar Usuário')}
            </button>
          </div>
        </form>
      </div>

      {/* TABELA DE LISTAGEM */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th> {/* Nova Coluna */}
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nomeCompleto}</td>
                <td>{user.email}</td>
                <td><span className={styles.tag}>{user.papel}</span></td>
                <td>
                    <span className={user.ativo ? styles.tagAtivo : styles.tagInativo}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    {/* Botão de Editar na Tabela */}
                    <button 
                        className={styles.editBtn}
                        onClick={() => handleEdit(user)}
                    >
                        Editar
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestaoUsuarios; 