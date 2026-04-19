import React, { useState } from 'react';
import { useWatch, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import styles from './OrderFooter.module.css';

interface OrderFooterProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
}

const formasPagamento = ['Dinheiro', 'Cartão', 'Boleto', 'Pix'];

const ADMIN_PASSWORD = 'admin123'; // Troque para sua senha real

const OrderFooter: React.FC<OrderFooterProps> = ({ control, register }) => {
  const items = useWatch({ control, name: 'items' }) || [];
  const services = useWatch({ control, name: 'services' }) || [];
  const desc = useWatch({ control, name: 'desc' }) || 0;
  const descPercent = useWatch({ control, name: 'descPercent' }) || 0;

  // Soma dos produtos
  const subtotalProdutos = items.reduce((acc: number, item: any) => acc + (Number(item.total) || 0), 0);
  // Soma dos serviços
  const subtotalServicos = services.reduce((acc: number, serv: any) => acc + (Number(serv.total) || 0), 0);
  const subtotal = subtotalProdutos + subtotalServicos;
  const descontoValor = Number(desc) + (subtotal * (Number(descPercent) || 0) / 100);
  const total = subtotal - descontoValor;

  // Controle de permissão do desconto em %
  const [percentEnabled, setPercentEnabled] = useState(false);
  const [senha, setSenha] = useState('');
  const [senhaError, setSenhaError] = useState('');

  const handleUnlockPercent = () => {
    if (senha === ADMIN_PASSWORD) {
      setPercentEnabled(true);
      setSenhaError('');
    } else {
      setSenhaError('Senha incorreta!');
    }
  };

  return (
    <div className={styles.orderFooter}>
      <div className={styles.topRow}>
        <div className={styles.obsArea}>
          <label className={styles.obsLabel}>OBSERVAÇÕES:</label>
          <input
            {...register('observacoes')}
            className={styles.obsInput}
            placeholder="Digite suas observações aqui..."
          />
        </div>
        <div className={styles.pagamentoArea}>
          <select {...register('formaPagamento')} className={styles.pagamentoSelect}>
            <option value="">Forma de Pagamento</option>
            {formasPagamento.map(fp => (
              <option key={fp} value={fp}>{fp}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.bottomGrid}>
        <div className={styles.totalCol}>
          <span className={styles.totalLabel}>SUBTOTAL:</span>
          <span className={styles.totalValue}>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <div className={styles.totalCol}>
          <span className={styles.totalLabel}>DESC (%):</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              {...register('descPercent')}
              className={styles.descInput}
              type="number"
              min={0}
              max={100}
              placeholder="%"
              disabled={!percentEnabled}
              style={{ width: 50 }}
            />
            {!percentEnabled && (
              <div className={styles.adminUnlockArea}>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Senha admin"
                  className={styles.adminUnlockInput}
                />
                <button type="button" onClick={handleUnlockPercent} className={styles.adminUnlockBtn}>
                  OK
                </button>
              </div>
            )}
          </div>
          {senhaError && <div style={{ color: 'red', fontSize: 12 }}>{senhaError}</div>}
        </div>
        <div className={styles.totalCol}>
          <span className={styles.totalLabel}>TOTAL:</span>
          <span className={styles.totalValue}>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderFooter;
