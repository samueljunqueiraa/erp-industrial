import { WarningCircle, Package, Scissors, Clock } from '@phosphor-icons/react';
import styles from './styles.module.css';

export default function ActionCenter() {
	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<div>
					<div className={styles.title}>Central de Ação</div>
					<div className={styles.subtitle}>Pendências Operacionais</div>
				</div>
				<WarningCircle size={28} color="#F59E42" className={styles.warningIcon} />
			</div>
			<div className={styles.list}>
				<div className={styles.item}>
					<span className={styles.iconCircle} style={{ background: '#FEE2E2' }}>
						<Package size={24} color="#EF4444" />
					</span>
					<div>
						<div className={styles.itemTitle}>Botão Madrepérola</div>
						<div className={styles.itemSubtitle}>Estoque Crítico (Restam 40un)</div>
					</div>
				</div>
				<div className={styles.item}>
					<span className={styles.iconCircle} style={{ background: '#FEF9C3' }}>
						<Scissors size={24} color="#EAB308" />
					</span>
					<div>
						<div className={styles.itemTitle}>Ordem de Corte #4092</div>
						<div className={styles.itemSubtitle}>Atrasada há 2 dias (Setor Costura)</div>
					</div>
				</div>
				<div className={styles.item}>
					<span className={styles.iconCircle} style={{ background: '#DBEAFE' }}>
						<Clock size={24} color="#3B82F6" />
					</span>
					<div>
						<div className={styles.itemTitle}>3 Pedidos Estagnados</div>
						<div className={styles.itemSubtitle}>Sem movimentação há +48h</div>
					</div>
				</div>
				<div className={styles.item}>
					<span className={styles.iconCircle} style={{ background: '#FEF9C3' }}>
						<Scissors size={24} color="#EAB308" />
					</span>
					<div>
						<div className={styles.itemTitle}>Ordem de Corte #4092</div>
						<div className={styles.itemSubtitle}>Atrasada há 2 dias (Setor Costura)</div>
					</div>
				</div>
				<div className={styles.item}>
					<span className={styles.iconCircle} style={{ background: '#FEE2E2' }}>
						<Package size={24} color="#EF4444" />
					</span>
					<div>
						<div className={styles.itemTitle}>Botão Madrepérola</div>
						<div className={styles.itemSubtitle}>Estoque Crítico (Restam 40un)</div>
					</div>
				</div>
			</div>
		</div>
	);
}
