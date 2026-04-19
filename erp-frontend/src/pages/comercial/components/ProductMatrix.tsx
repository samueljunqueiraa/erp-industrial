import React, { useState, useEffect } from 'react';
import { useFieldArray, type Control, type UseFormRegister, type UseFormWatch, type UseFormSetValue } from 'react-hook-form';
import styles from './ProductMatrix.module.css';
import { Trash2, Loader2 } from 'lucide-react'; 
import { produtoService, type ProdutoBuscaDTO, type EstoqueGradeDTO } from '../../../services/produtoService';

export type ItemGrade = {
  [tamanho: string]: number | string;
};

export type PedidoItem = {
  produtoId: number; 
  corId: number;    
  codigo: string;
  produtoCor: string;
  grades: ItemGrade;
  qtd: number;
  total: number;
  precoUnitario: number; 
};

import type { CustomerDataFormValues } from './CustomerData';

export type PedidoFormValues = CustomerDataFormValues & {
  items: PedidoItem[];
  services: any[]; 
  observacoes: string;
  desc: number;
  descPercent: number;
  formaPagamento: string;
  clienteId: number;
};

interface ProductMatrixProps {
  control: Control<PedidoFormValues>;
  register: UseFormRegister<PedidoFormValues>;
  watch: UseFormWatch<PedidoFormValues>;
  setValue: UseFormSetValue<PedidoFormValues>; 
}

const SIZES = ['44', '46', '48', '50', '52', '54'];

const ProductRow = ({ index, register, watch, setValue, remove }: { 
    index: number, 
    register: UseFormRegister<PedidoFormValues>, 
    watch: UseFormWatch<PedidoFormValues>, 
    setValue: UseFormSetValue<PedidoFormValues>,
    remove: (index: number) => void 
}) => {
    
    const [carregandoLista, setCarregandoLista] = useState(false);
    const [listaProdutos, setListaProdutos] = useState<ProdutoBuscaDTO[]>([]);
    const [estoqueGrade, setEstoqueGrade] = useState<EstoqueGradeDTO>({});

    const qtds = watch(`items.${index}.grades`);
    const produtoSelecionadoId = watch(`items.${index}.produtoId`);
    const precoUnitario = watch(`items.${index}.precoUnitario`);
    const totalRow = watch(`items.${index}.total`);
    const todosItens = watch('items');

    useEffect(() => {
        const carregar = async () => {
            setCarregandoLista(true);
            try {
                const produtos = await produtoService.buscar(''); 
                setListaProdutos(produtos);
            } catch (error) {
                console.error("Erro ao carregar produtos:", error);
            } finally {
                setCarregandoLista(false);
            }
        };
        carregar();
    }, []);

    const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        if (!id) return;

        const prod = listaProdutos.find(p => p.id === id);
        
        if (prod) {
            const corIdSeguro = prod.corId ?? prod.cor?.id ?? 0;
            const nomeCorSeguro = prod.nomeCor ?? prod.cor?.nome ?? '';
            const refSegura = prod.referenciaBase ?? prod.referencia ?? '';
            const precoSeguro = Number(prod.precoBase) || 0;

            setValue(`items.${index}.produtoId`, prod.id);
            setValue(`items.${index}.corId`, corIdSeguro);
            setValue(`items.${index}.codigo`, refSegura);
            setValue(`items.${index}.produtoCor`, `${prod.nome} - ${nomeCorSeguro}`);
            setValue(`items.${index}.precoUnitario`, precoSeguro); 

            try {
                const estoque = await produtoService.consultarEstoqueGrade(prod.id, corIdSeguro);
                setEstoqueGrade(estoque);
            } catch (error) {
                console.error("Erro ao buscar estoque", error);
            }
        }
    };

    useEffect(() => {
        let somaQtd = 0;
        if(qtds) {
            Object.values(qtds).forEach(val => {
                somaQtd += Number(val) || 0;
            });
        }
        setValue(`items.${index}.qtd`, somaQtd);

        const preco = Number(precoUnitario) || 0;
        const totalCalculado = somaQtd * preco;
        setValue(`items.${index}.total`, totalCalculado);

    }, [JSON.stringify(qtds), precoUnitario, setValue, index]);

    return (
        <div className={styles.row}>
            <input type="hidden" {...register(`items.${index}.produtoId`)} />
            <input type="hidden" {...register(`items.${index}.corId`)} />
            <input type="hidden" {...register(`items.${index}.produtoCor`)} />
            <input type="hidden" {...register(`items.${index}.precoUnitario`)} />
            <input type="hidden" {...register(`items.${index}.total`)} />

            <div className={styles.colSmall}>
                <input
                  {...register(`items.${index}.codigo`)}
                  className={styles.inputGhost}
                  placeholder="Cód."
                  readOnly
                  style={{ fontWeight: 'bold', color: '#334155' }}
                />
            </div>

            <div className={styles.colAuto} style={{ position: 'relative' }}>
                {carregandoLista ? (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#888' }}>
                         <Loader2 size={14} className="animate-spin" style={{marginRight: 5}}/>
                    </div>
                ) : (
                    <select
                        className={styles.inputGhost}
                        onChange={handleSelectChange}
                        value={produtoSelecionadoId || ""} 
                        style={{ cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
                    >
                        <option value="" disabled>Selecione o Produto...</option>
                        {listaProdutos.map(p => {
                            const nomeCor = p.nomeCor ?? p.cor?.nome ?? '';
                            const ref = p.referenciaBase ?? p.referencia ?? '';
                            return (
                                <option key={p.id} value={p.id}>
                                    {ref} - {p.nome} {nomeCor ? `(${nomeCor})` : ''}
                                </option>
                            );
                        })}
                    </select>
                )}
            </div>

            <div className={styles.colMedium}>
                <input 
                    className={`${styles.inputGhost} ${styles.textRight}`}
                    readOnly 
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(precoUnitario) || 0)}
                    style={{fontSize: 11, color: '#333'}}
                />
            </div> 

            {SIZES.map((size) => {
                const dados = estoqueGrade[size];
                
                const fisicoBanco = dados?.fisico || 0; 
                const producaoBanco = dados?.producao || 0;
                const limiteTotal = fisicoBanco + producaoBanco;
                
                let usadoEmOutrasLinhas = 0;
                if (todosItens && produtoSelecionadoId) {
                    todosItens.forEach((item, idx) => {
                        if (idx !== index && Number(item.produtoId) === Number(produtoSelecionadoId)) {
                            usadoEmOutrasLinhas += Number(item.grades?.[size]) || 0;
                        }
                    });
                }

                const disponivelReal = Math.max(0, limiteTotal - usadoEmOutrasLinhas);
                
                // Distribuição inteligente para avisos
                const fisicoRestante = Math.max(0, fisicoBanco - usadoEmOutrasLinhas);
                const producaoRestante = usadoEmOutrasLinhas > fisicoBanco 
                    ? Math.max(0, producaoBanco - (usadoEmOutrasLinhas - fisicoBanco))
                    : producaoBanco;

                const qtdDigitada = Number(qtds?.[size] || 0);
                const excedeuEstoque = qtdDigitada > disponivelReal;
                let bgColor = 'transparent';
                if (excedeuEstoque) bgColor = '#f11919'; // Vermelho
                else if (qtdDigitada > 0 && qtdDigitada <= fisicoRestante) bgColor = '#f0fdf4'; // Verde (Só Físico)
                else if (qtdDigitada > fisicoRestante) bgColor = '#eff6ff'; // Azul (Precisou de OC)

                return (
                  <div key={size} className={styles.colSize}>
                    <input
                      type="number"
                      {...register(`items.${index}.grades.${size}`)}
                      className={`${styles.inputGhost} ${styles.textCenter}`}
                      
                      style={{ 
                          color: excedeuEstoque ? 'red' : 'inherit',
                          fontWeight: qtdDigitada > 0 ? 'bold' : 'normal',
                          borderColor: excedeuEstoque ? 'red' : '#e0e0e0',
                          backgroundColor: bgColor,
                          borderRadius: '4px',
                          padding: '4px',
                          width: '100%'
                      }}
                      
                      min={0}
                      max={disponivelReal} 
                      
                      onInput={(e) => {
                          const input = e.currentTarget;
                          const val = Number(input.value);
                          if (val > disponivelReal) {
                              input.value = String(disponivelReal);
                              setValue(`items.${index}.grades.${size}`, disponivelReal, { shouldValidate: true });
                          }
                      }}
                    />
                    
                    <div style={{ fontSize: 11, textAlign: 'center', marginTop: 4, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dados ? (
                            <>
                                <span style={{color: fisicoRestante > 0 ? '#16a34a' : '#94a3b8'}}>Fis: {fisicoRestante}</span>
                                {producaoRestante > 0 && (
                                    <span style={{color: '#3b82f6'}}>OC: {producaoRestante}</span>
                                )}
                            </>
                        ) : '-'}
                    </div>
                  </div>
                );
            })}

            <div className={styles.colMedium}>
                <input 
                    {...register(`items.${index}.qtd`)} 
                    className={`${styles.inputGhost} ${styles.textCenter}`} 
                    readOnly 
                    style={{fontWeight: 'bold'}}
                />
            </div>

            <div className={styles.colMedium}>
                <input 
                    className={`${styles.inputGhost} ${styles.textRight}`} 
                    readOnly
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRow || 0)}
                    style={{fontWeight: 'bold', color: 'green'}}
                />
            </div>

            <div className={styles.colAction}>
                <button type="button" onClick={() => remove(index)} className={styles.deleteBtn}>
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

const ProductMatrix: React.FC<ProductMatrixProps> = ({ control, register, watch, setValue }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items', 
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.colSmall}>CÓD.</div>
        <div className={styles.colAuto}>PRODUTO/COR</div>
        <div className={styles.colMedium}>PREÇO</div>
        {SIZES.map(size => (
          <div key={size} className={styles.colSize}>{size}</div>
        ))}
        <div className={styles.colMedium}>QTD</div>
        <div className={styles.colMedium}>TOTAL R$</div>
        <div className={styles.colAction}></div>
      </div>

      <div className={styles.body}>
        {fields.map((field, index) => (
            <ProductRow 
                key={field.id}
                index={index}
                register={register}
                watch={watch}
                setValue={setValue}
                remove={remove}
            />
        ))}
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={() => append({ 
            produtoId: 0, 
            corId: 0, 
            codigo: '', 
            produtoCor: '', 
            grades: {}, 
            qtd: 0, 
            total: 0,
            precoUnitario: 0
        })}
      >
        Adicionar mais produto
      </button>
    </div>
  );
};

export default ProductMatrix;