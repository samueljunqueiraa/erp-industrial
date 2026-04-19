import React from 'react';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

// 1. AQUI ESTÁ O SEGREDO: Definir o que o componente aceita
interface MaisInfoProps {
  status: 'AGUARDANDO' | 'SUCESSO' | 'ERRO';
  dados?: {
    produto: string;
    referencia: string;
    cor: string;
    tecido: string;
    tamanho: string;
    novoSaldo: number;
  };
  mensagem?: string;
}

// 2. AQUI APLICAMOS O TIPO: React.FC<MaisInfoProps>
const MaisInfo: React.FC<MaisInfoProps> = ({ status, dados, mensagem }) => {
  
  if (status === 'AGUARDANDO') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '2px dashed #cbd5e1' }}>
        <Package size={48} color="#94a3b8" />
        <h3 style={{ color: '#64748b', marginTop: '10px' }}>Aguardando leitura...</h3>
        <p style={{ color: '#94a3b8' }}>Bipe uma etiqueta para dar entrada.</p>
      </div>
    );
  }

  if (status === 'ERRO') {
    return (
      <div style={{ padding: '30px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #ef4444', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '10px' }} />
        <h2 style={{ color: '#b91c1c', margin: 0 }}>ERRO NA LEITURA</h2>
        <p style={{ fontSize: '18px', color: '#7f1d1d' }}>{mensagem}</p>
      </div>
    );
  }

  // STATUS === SUCESSO
  return (
    <div style={{ background: '#f0fdf4', borderRadius: '8px', border: '1px solid #22c55e', overflow: 'hidden' }}>
      <div style={{ background: '#22c55e', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '10px' }}>
        <CheckCircle size={24} />
        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>ENTRADA CONFIRMADA</span>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>PRODUTO</span>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#14532d' }}>{dados?.produto}</div>
          <div style={{ color: '#166534' }}>Ref: {dados?.referencia}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>COR / TECIDO</span>
            <div style={{ color: '#14532d' }}>{dados?.cor}</div>
            <div style={{ fontSize: '12px', color: '#166534' }}>{dados?.tecido}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
             <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>TAMANHO</span>
             <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#14532d', lineHeight: 1 }}>{dados?.tamanho}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #86efac', marginTop: '10px', paddingTop: '10px', textAlign: 'center' }}>
           <span style={{ fontSize: '14px', color: '#15803d' }}>Saldo em Estoque: </span>
           <strong style={{ fontSize: '24px', color: '#14532d' }}>{dados?.novoSaldo} un</strong>
        </div>
      </div>
    </div>
  );
};

export default MaisInfo;