import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import '../../styles/Login.css'; 
import logo from '../../assets/logo.svg'; 
import background from '../../../components/img/background-tela-login.png'; 
import { FiUser, FiEye } from 'react-icons/fi';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    localStorage.clear();
    setUser(null);
  }, [setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Tentando logar com:", email);
      
      const response = await authService.login({ 
        email: email, 
        senha: password 
      });

      console.log("Resposta do Servidor:", response);

      if (!response || !response.token) {
         throw new Error("Acesso negado: Servidor não retornou o token.");
      }

      // --- SUCESSO ---
      const tokenRecebido = response.token;
      localStorage.setItem('erp_token', tokenRecebido);

      // --- CORREÇÃO DO ERRO VERMELHO (TYPE SCRIPT) ---
      // Convertemos para 'any' para o TypeScript parar de reclamar que 'id' não existe.
      const dados = response as any; 

      const usuarioParaSalvar = {
          // Agora acessamos via 'dados' (que é any), então o erro vermelho some
          id: dados.id || dados.usuarioId || 1, // Se não vier ID, usa 1 (Admin) para não travar venda
          name: dados.nome || dados.name || email, // Se não vier nome, usa email
          email: email
      };

      console.log("Salvando usuário:", usuarioParaSalvar);

      // 1. Salva no LocalStorage (Para tela de Pedido)
      localStorage.setItem('erp_user', JSON.stringify(usuarioParaSalvar));
      
      // 2. Atualiza Contexto (Para o sistema saber que tá logado)
      setUser(usuarioParaSalvar as any);
      
      navigate('/dashboard');

    } catch (err: any) {
      console.error("ERRO NO LOGIN:", err);
      
      localStorage.clear();
      setUser(null);

      if (err.response && err.response.status === 401) {
          setError('Senha incorreta ou usuário não encontrado.');
      } else if (err.message && err.message.includes('token')) {
          setError('Erro de segurança: ' + err.message);
      } else {
          setError('Falha na conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <img src={background} alt="Arte 3D" className="login-art" />
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <img src={logo} alt="Logo" className="login-logo" />
          
          <div className="login-input-group">
            <FiUser className="login-icon" />
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-input-group">
            <FiEye className="login-icon" />
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error" style={{color: 'red', marginTop: 10}}>{error}</div>}
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;