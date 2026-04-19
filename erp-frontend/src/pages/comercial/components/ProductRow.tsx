import React, { useState, useEffect } from 'react';
import { type UseFormRegister, type UseFormSetValue, type UseFormWatch } from 'react-hook-form';
import { Trash2, Loader2 } from 'lucide-react';
import styles from '../ProductMatrix.module.css';
import { produtoService, type ProdutoBuscaDTO, type EstoqueGradeDTO } from '../../../services/produtoService';
import type { PedidoFormValues } from './ProductMatrix';

interface ProductRowProps {
    index: number;
    register: UseFormRegister<PedidoFormValues>;
    watch: UseFormWatch<PedidoFormValues>;
    setValue: UseFormSetValue<PedidoFormValues>;
    remove: (index: number) => void;
    sizes: string[];
    listaProdutos: ProdutoBuscaDTO[]; 
    ordemId: number; 
}

const ProductRow: React.FC<ProductRowProps> = ({ 
    index, register, watch, setValue, remove, sizes, listaProdutos, ordemId 
}) => {
    const [estoqueGrade, setEstoqueGrade] = useState<EstoqueGradeDTO>({});
    const [buscandoEstoque, setBuscandoEstoque] = useState(false);

    const qtds = watch(`items.${index}.grades`);
    // === NOVO: Observa o tipo de venda escolhido para esta linha ===
    const origemVenda = watch(`items.${index}.origem` as any) || 'FISICO'; 

    // 1. SELEÇÃO DO PRODUTO
    const handleSelectProduto = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idSelecionado = Number(e.target.value);
        if (!idSelecionado) return;

        const prod = listaProdutos.find(p => p.id === idSelecionado);
        
        if (prod) {
            const corIdSeguro = prod.corId ?? prod.cor?.id ?? 0;
            const nomeCorSeguro = prod.nomeCor ?? prod.cor?.nome ?? 'Sem Cor';
            const refSegura = prod.referenciaBase ?? prod.referencia ?? '';

            setValue(`items.${index}.ordemId` as any, ordemId); 
            setValue(`items.${index}.corId` as const, corIdSeguro);
            setValue(`items.${index}.codigo` as const, refSegura);
            setValue(`items.${index}.produtoCor` as const, `${prod.nome} - ${nomeCorSeguro}`);
            
            // Define o padrão como Pronta Entrega ao selecionar
            setValue(`items.${index}.origem` as any, 'FISICO');

            try {
                setBuscandoEstoque(true);
                const estoque = await produtoService.consultarEstoqueGrade(prod.id, corIdSeguro);
                setEstoqueGrade(estoque);
            } catch (error) {
                console.error("Erro ao buscar estoque", error);
            } finally {
                setBuscandoEstoque(false);
            }
        }
    };

    // 2. CÁLCULO DE TOTAIS
    useEffect(() => {
        let totalQtd = 0;
        if (qtds) {
            Object.values(qtds || {}).forEach(val => totalQtd += Number(val) || 0);
        }
        setValue(`items.${index}.qtd` as const, totalQtd);
    }, [qtds, setValue, index]);

    return (
        <div className={styles.row}>
            {/* Inputs Ocultos */}
            <input type="hidden" {...register(`items.${index}.produtoId` as const)} />
            <input type="hidden" {...register(`items.${index}.corId` as const)} />
            <input type="hidden" {...register(`items.${index}.produtoCor` as const)} />
            <input type="hidden" {...register(`items.${index}.ordemId` as any)} />

            {/* Código */}
            <div className={styles.colSmall}>
                <input
                    {...register(`items.${index}.codigo`)}
                    className={styles.inputGhost}
                    placeholder="Cód."
                    readOnly
                    title="Código do Produto"
                    style={{ fontWeight: 'bold', color: '#334155' }}
                />
            </div>

            {/* Select de Produtos E TIPO DE VENDA */}
            <div className={styles.colAuto} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <select 
                    className={styles.inputGhost}
                    onChange={handleSelectProduto}
                    defaultValue=""
                    style={{ cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
                >
                    <option value="" disabled>Selecione o Produto...</option>
                    {listaProdutos.map(p => {
                        const nomeCor = p.nomeCor ?? p.cor?.nome ?? 'Sem Cor';
                        const ref = p.referenciaBase ?? p.referencia ?? '';
                        return (
                            <option key={p.id} value={p.id}>
                                {ref} - {p.nome} ({nomeCor})
                            </option>
                        );
                    })}
                </select>

                {/* --- NOVO: SELETOR DE ORIGEM (Isolando o Risco) --- */}
                {Object.keys(estoqueGrade).length > 0 && (
                    <select 
                        {...register(`items.${index}.origem` as any)}
                        className={styles.inputGhost}
                        style={{ 
                            fontSize: '0.75rem', 
                            padding: '2px', 
                            color: origemVenda === 'FISICO' ? '#16a34a' : '#3b82f6',
                            border: `1px solid ${origemVenda === 'FISICO' ? '#16a34a' : '#3b82f6'}`,
                            borderRadius: '4px'
                        }}
                    >
                        <option value="FISICO">📦 Pronta Entrega (Físico)</option>
                        <option value="PRODUCAO">✂️ Programada (Ordem de Corte)</option>
                    </select>
                )}

                {buscandoEstoque && (
                    <div style={{position: 'absolute', right: 5, top: 10}}>
                         <Loader2 size={14} className="animate-spin" color="#3b82f6"/>
                    </div>
                )}
            </div>

            {/* Grade de Tamanhos */}
            {sizes.map(size => {
                const dadosEstoque = estoqueGrade[size]; 
                
                const fisico = dadosEstoque?.fisico || 0;
                const producao = dadosEstoque?.producao || 0;
                
                // === A MÁGICA DA SEPARAÇÃO ===
                // O limite agora depende do que o vendedor escolheu no select!
                const limitePermitido = origemVenda === 'FISICO' ? fisico : producao;
                
                const qtdDigitada = Number(qtds?.[size] || 0);
                const estoqueInsuficiente = qtdDigitada > limitePermitido;

                return (
                    <div key={size} className={styles.colSize}>
                        <input
                            type="number"
                            {...register(`items.${index}.grades.${size}` as any)} 
                            className={`${styles.inputGhost} ${styles.textCenter}`}
                            placeholder="0"
                            min={0}
                            max={limitePermitido}
                            onInput={(e) => {
                                const input = e.currentTarget;
                                const val = Number(input.value);
                                if (val > limitePermitido) {
                                    input.value = String(limitePermitido);
                                    setValue(`items.${index}.grades.${size}` as any, limitePermitido, { shouldValidate: true });
                                }
                            }}
                            style={{
                                color: estoqueInsuficiente ? '#ef4444' : '#0f172a',
                                fontWeight: estoqueInsuficiente ? 'bold' : '600',
                                border: estoqueInsuficiente ? '1px solid #ef4444' : '1px solid transparent',
                                borderRadius: 4,
                                backgroundColor: estoqueInsuficiente ? '#fff5f5' : (origemVenda === 'FISICO' ? '#f0fdf4' : '#eff6ff'),
                                padding: '4px',
                                width: '100%'
                            }}
                        />
                        
                        <div style={{
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '2px', 
                            fontSize: '0.65rem', 
                            textAlign: 'center', 
                            marginTop: '6px'
                        }}>
                           {dadosEstoque ? (
                               origemVenda === 'FISICO' ? (
                                   <div style={{color: fisico > 0 ? '#16a34a' : '#ef4444', fontWeight: 'bold'}}>
                                       Estq: {fisico}
                                   </div>
                               ) : (
                                   <div style={{color: producao > 0 ? '#3b82f6' : '#ef4444', fontWeight: 'bold'}}>
                                       OC: {producao}
                                   </div>
                               )
                           ) : (
                               <div style={{color: '#94a3b8'}}>-</div>
                           )}
                        </div>
                    </div>
                );
            })}

            {/* Totais e Delete */}
            <div className={styles.colMedium}>
                <input {...register(`items.${index}.qtd`)} className={`${styles.inputGhost} ${styles.textCenter}`} readOnly />
            </div>
            <div className={styles.colAction}>
                <button type="button" onClick={() => remove(index)} className={styles.deleteBtn}>
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default ProductRow;