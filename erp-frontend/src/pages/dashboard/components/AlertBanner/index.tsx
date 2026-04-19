import { Eye, X } from '@phosphor-icons/react';
import styles from './styles.module.css';

export default function AlertBanner() {
	return (
		<div className={styles.container}>
			<div className={styles.left}>
				<span className={styles.iconEyeBg}>
					<Eye size={24} color="#0069FE" />
				</span>
				<span className={styles.text}>Os alertas mais importantes estão aqui!</span>
			</div>
			<div className={styles.right}>
				<button className={styles.button}>Verificar agora</button>
				<button className={styles.closeBtn} aria-label="Fechar alerta">
					<X size={20} />
				</button>
			</div>
		</div>
	);
}
