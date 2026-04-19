import React from 'react';
import { useFieldArray, type Control, type UseFormRegister, type UseFormWatch } from 'react-hook-form';
import styles from './ServicesSection.module.css';
import { Trash2 } from 'lucide-react';

interface ServicesSectionProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ control, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  return (
    <div className={styles.servicesSection}>
      <div className={styles.headerGrid}>
        <span>SERVIÇOS</span>
        <span>QUANTIDADE</span>
        <span>TOTAL R$</span>
        <span></span>
      </div>
      
      {fields.map((field, idx) => (
        <div className={styles.rowGrid} key={field.id}>
          <input
            {...register(`services.${idx}.nome`)}
            className={styles.inputGhost}
            placeholder="Busque por (SERVIÇO/TIPO)..."
          />
          <input
            {...register(`services.${idx}.quantidade`)}
            className={styles.inputGhost}
            type="number"
            min={1}
            placeholder="Qtd"
          />
          <input
            {...register(`services.${idx}.total`)}
            className={styles.inputGhost}
            type="number"
            min={0}
            placeholder="Total R$"
          />
          <button type="button" className={styles.deleteBtn} onClick={() => remove(idx)}>
            <span role="img" aria-label="delete"><Trash2 size={18} /></span>
            
          </button>
        </div>
      ))}
      <div className={styles.addButtonRow}>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => append({ nome: '', quantidade: 1, total: 0 })}
        >
          Adicionar mais serviços
        </button>
      </div>
    </div>
  );
};

export default ServicesSection;