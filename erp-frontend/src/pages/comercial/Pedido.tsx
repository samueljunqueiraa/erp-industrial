import React from 'react';
import styles from './Pedido.module.css';
import { useForm, type DefaultValues } from 'react-hook-form';
import ProductMatrix, { type PedidoFormValues } from './components/ProductMatrix';
import CustomerData from './components/CustomerData';
import ServicesSection from './components/ServicesSection';
import OrderFooter from './components/OrderFooter';
import { vendaService } from '../../services/vendaService';
import { Loader2 } from 'lucide-react';

const defaultValues: DefaultValues<PedidoFormValues> = {
  clienteId: 0,
  municipio: '',
  bairro: '',
  cep: '',
  estado: '',
  condPagamento: '',
  transportadora: '',
  valorFrete: '',
  status: 'PENDENTE',
  email1: '',
  email2: '',
  tipoFrete: '',
  items: [
    { produtoId: 0, corId: 0, codigo: '', produtoCor: '', grades: {}, qtd: 0, total: 0, precoUnitario: 0 }
  ],
  services: [], 
  observacoes: '',
  desc: 0,
  descPercent: 0,
  formaPagamento: ''
};

const Pedido: React.FC = () => {
  
  const { control, register, handleSubmit, watch, reset, setValue, formState: { isSubmitting } } = useForm<PedidoFormValues>({
    defaultValues
  });

  // --- CORREÇÃO DO MAPA DE TAMANHOS (Baseado na sua tabela) ---
  const getTamanhoId = (tamanhoLabel: string): number => {
      const mapa: Record<string, number> = { 
          // Letras
          'PP': 1, 'P': 2, 'M': 3, 'G': 4, 'GG': 5, 'XG': 6,
          // Numéricos (Sua tabela real)
          '36': 7, '38': 8, '40': 9, '42': 10, 
          '44': 11, '46': 12, '48': 13, '50': 14, '52': 15, '54': 16 
      };
      // Retorna o ID mapeado ou 11 (Tamanho 44) como fallback seguro
      return mapa[tamanhoLabel] || 11; 
  };

  const onSubmit = async (data: PedidoFormValues) => {
    // 1. Validações
    if (!data.clienteId) {
      alert("Selecione um cliente.");
      return;
    }

    // 2. RECUPERAÇÃO DO VENDEDOR
    let vendedorIdFinal = 1; 
    try {
       const userJson = localStorage.getItem('erp_user');
       if(userJson) {
           const u = JSON.parse(userJson);
           if (u.id) vendedorIdFinal = u.id;
       }
    } catch (e) {
        console.warn("Usando ID 1 para vendedor.");
    }

    try {
      // 3. Monta lista de itens
      const itensParaSalvar: any[] = [];

      data.items.forEach(item => {
          Object.entries(item.grades).forEach(([tamanho, qtd]) => {
              const quantidade = Number(qtd);
              if (quantidade > 0) {
                  itensParaSalvar.push({
                      sku: {
                          produtoId: item.produtoId,
                          // Agora envia o ID correto (ex: manda 11 se for tamanho '44')
                          tamanhoId: getTamanhoId(tamanho) 
                      },
                      quantidade: quantidade,
                      precoUnitario: item.precoUnitario
                  });
              }
          });
      });

      if (itensParaSalvar.length === 0) {
          alert("Adicione pelo menos um produto.");
          return;
      }

      // 4. Monta Objeto Final
      const pedidoCompleto = {
          clienteId: data.clienteId,
          vendedorId: vendedorIdFinal,
          dataCriacao: new Date().toISOString(),
          
          // --- IMPORTANTE: STATUS CORRETO ---
          // O Backend só aceita: 'EM_ABERTO', 'FINALIZADO', 'CANCELADO'
          status: 'EM_ABERTO', 
          
          observacoesNota: data.observacoes,
          tipoFrete: data.tipoFrete,
          valorFrete: Number(data.valorFrete) || 0,
          descontoAplicado: Number(data.desc) || 0,
          itens: itensParaSalvar
      };

      console.log("Enviando Pedido:", pedidoCompleto);

      // 5. Envia
      const resposta = await vendaService.create(pedidoCompleto);
      
      alert(`Pedido #${resposta.id} salvo com sucesso!`);
      await vendaService.downloadPdf(resposta.id);
      
      reset(defaultValues);

    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      const msg = error.response?.data?.message || "Erro ao conectar com o servidor.";
      alert(`Erro: ${msg}`);
    }
  };

  return (
    <div className={styles.pedidoPageWrapper}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
        <div className={styles.pedidoFormScrollable}>
          <h1 className={styles.pedidoTitle}>NOVO PEDIDO DE VENDA</h1>
          <section style={{ marginBottom: 40 }}>
            <CustomerData register={register} watch={watch} setValue={setValue} />
            <h3 className={styles.sectionTitle}>MATRIZ DE ITENS:</h3>
            <ProductMatrix control={control} register={register} watch={watch} setValue={setValue} />
            <ServicesSection control={control} register={register} watch={watch} />
          </section>
        </div>
        <OrderFooter control={control} register={register} setValue={setValue} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
          <button 
            type="submit" 
            className={styles.finalizarPedidoBtn}
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {isSubmitting && <Loader2 className="animate-spin" size={20}/>}
            {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Pedido;