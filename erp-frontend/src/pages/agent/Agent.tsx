import React, { useState, useRef, useEffect } from 'react';
import styles from './Agent.module.css';
import { useNavigate } from 'react-router-dom';
import { 
  X, Sparkles, Plus, Mic, ArrowRight, ThumbsUp, ThumbsDown, Copy, Share2 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

const Agent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    "Faça uma tabela comparando as vendas dos últimos 3 meses",
    "Quais produtos estão com estoque crítico?",
    "Resuma o fluxo de caixa desta semana"
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulação de resposta
    setTimeout(() => {
      const aiMsg: Message = { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: 'Analisei os dados de vendas da última semana. Notei um crescimento de 15% comparado ao período anterior. O produto "Camisa Polo" foi o mais vendido.\n\nGostaria que eu gerasse um relatório detalhado em PDF?' 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={() => navigate('/dashboard')} title="Voltar">
        <X size={40} strokeWidth={2} />
      </button>

      <div className={`${styles.content} ${messages.length > 0 ? styles.hasMessages : ''}`}>
        {messages.length === 0 ? (
          <div className={styles.heroSection}>
            <h1 className={styles.title}>Olá, {userName}</h1>
            <p className={styles.subtitle}>No que você está pensando?</p>
          </div>
        ) : (
          <div className={styles.messageList}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.messageRow} ${styles[msg.role]}`}>
                
                {/* LÓGICA DE RENDERIZAÇÃO MENSAGEM */}
                {msg.role === 'user' ? (
                  // USUÁRIO: Balão cinza à direita
                  <div className={styles.userBubble}>
                    {msg.text}
                  </div>
                ) : (
                  // IA: Texto limpo à esquerda com ícone
                  <>
                    <div className={styles.aiHeader}>
                      <Sparkles size={18} className={styles.aiIconSparkle} />
                      <span className={styles.aiName}>Splindid Agent</span>
                    </div>
                    <div className={styles.aiText} style={{ whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </div>
                    
                    {/* Ações de Rodapé da IA */}
                    <div className={styles.aiActions}>
                      <button className={styles.aiActionBtn} title="Copiar"><Copy size={16} /></button>
                      <button className={styles.aiActionBtn} title="Gostei"><ThumbsUp size={16} /></button>
                      <button className={styles.aiActionBtn} title="Não gostei"><ThumbsDown size={16} /></button>
                      <button className={styles.aiActionBtn} title="Compartilhar"><Share2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {/* LOADER DE DIGITAÇÃO */}
            {isTyping && (
               <div className={`${styles.messageRow} ${styles.ai}`}>
                 <div className={styles.aiHeader}>
                    <Sparkles size={18} className={styles.aiIconSparkle} />
                    <span className={styles.aiName}>Splindid Agent</span>
                 </div>
                 <div className={styles.typingIndicator}>
                   <div className={styles.typingDot}></div>
                   <div className={styles.typingDot}></div>
                   <div className={styles.typingDot}></div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className={styles.inputContainer}>
        <div className={styles.inputBox}>
          <input
            ref={inputRef}
            className={styles.textArea}
            placeholder="Pergunte o que quiser"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <div className={styles.inputFooter}>
            <button className={styles.actionBtn} title="Anexar">
              <Plus size={22} />
            </button>
            {input.trim() ? (
              <button className={styles.sendBtn} onClick={() => handleSend()}>
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
            ) : (
              <button className={styles.actionBtn} title="Voz">
                <Mic size={22} />
              </button>
            )}
          </div>
        </div>

        {messages.length === 0 && (
          <div className={styles.suggestionsList}>
            {suggestions.map((sug, index) => (
              <button key={index} className={styles.suggestionItem} onClick={() => handleSend(sug)}>
                <Sparkles size={16} className={styles.suggestionIcon} />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Agent;