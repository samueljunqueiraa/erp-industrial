import { api } from './api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const ETIQUETA_WIDTH = 60;
const ETIQUETA_HEIGHT = 40;

// --- FUNÇÃO AUXILIAR PARA FORMATAR DATAS ---
const formatarData = (data: string | number[] | null | undefined) => {
  if (!data) return '-';

  if (Array.isArray(data)) {
    return new Date(data[0], data[1] - 1, data[2]).toLocaleDateString('pt-BR');
  }

  return new Date(data).toLocaleDateString('pt-BR');
};

export interface TamanhoDTO {
  id: number;
  nome: string;
}

export interface ItemGradeDTO {
  tamanhoId: number;
  quantidade: number;
}

export interface OrdemCorteDTO {
  id?: number;
  produtoId: number;

  codigoOrdem?: string;
  dataCriacao?: string | number[];
  botaoCodigo: string;
  linhaCor: string;
  zipperCor: string;
  observacao: string;
  grade: ItemGradeDTO[];
  numeroLote?: string;
  dataEmissao?: string | number[];
  produtoReferencia?: string; 
  status?: string;
  produtoCor?: string;
  produtoTecido?: string;
  produtoCategoria?: string;
  produtoImagemUrl?: string;
}

export interface OrdemResumoDTO {
  id: number;
  numeroLote?: string;
  codigoOrdem: string;
  dataEmissao?: string | number[];
  produtoNome: string;
  produtoReferencia: string;
  quantidadeTotal: number;
  dataCriacao: string | number[];
  status: string;
}

export const ordemService = {
  getTamanhos: async (): Promise<TamanhoDTO[]> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<TamanhoDTO[]>('/ordens/tamanhos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getAll: async (): Promise<OrdemResumoDTO[]> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<OrdemResumoDTO[]>('/ordens', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getById: async (id: number): Promise<OrdemCorteDTO> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.get<OrdemCorteDTO>(`/ordens/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (data: OrdemCorteDTO): Promise<OrdemCorteDTO> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.post<OrdemCorteDTO>('/ordens', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }, 

  update: async (id: number, data: OrdemCorteDTO): Promise<OrdemCorteDTO> => {
    const token = localStorage.getItem('erp_token');
    const response = await api.put<OrdemCorteDTO>(`/ordens/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  gerarPDF: async (ordemId: number, nomeProduto: string, listaTamanhos: any[]) => {
    try {
      const ordem = await ordemService.getById(ordemId);
      const usuarioLogado = localStorage.getItem('usuario_nome') || 'Sistema';

      // --- GERA O QR CODE ---
      let qrCodeDataUrl = '';
      if (ordem.produtoImagemUrl) {
        try {
           qrCodeDataUrl = await QRCode.toDataURL(ordem.produtoImagemUrl, { width: 100, margin: 1 });
        } catch (err) {
           console.error("Erro ao gerar QR", err);
        }
      }

      const doc = new jsPDF();
      const margemEsq = 14;

      // --- CABEÇALHO ---
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDEM DE CORTE', margemEsq, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`STATUS: ${ordem.status}`, 160, 15);
      const dataEmissaoFormatada = formatarData(ordem.dataEmissao);
      doc.text(`EMISSÃO: ${dataEmissaoFormatada}`, 160, 20);
      doc.setTextColor(0);
      doc.setLineWidth(0.5);
      doc.line(margemEsq, 25, 196, 25);
      const linhaStart = 35;
      const gap = 6;
      
      doc.setFontSize(10);
      
      doc.setFont('helvetica', 'bold'); doc.text('Lote / Código:', margemEsq, linhaStart);
      doc.setFont('helvetica', 'normal'); doc.text(ordem.numeroLote || ordem.codigoOrdem || '-', margemEsq + 28, linhaStart);

      doc.setFont('helvetica', 'bold'); doc.text('Produto:', margemEsq, linhaStart + gap);
      doc.setFont('helvetica', 'normal'); doc.text(nomeProduto, margemEsq + 28, linhaStart + gap);

      doc.setFont('helvetica', 'bold'); doc.text('Ref / Cat:', margemEsq, linhaStart + (gap*2));
      doc.setFont('helvetica', 'normal'); 
      doc.text(`${ordem.produtoReferencia || '-'}  /  ${ordem.produtoCategoria || '-'}`, margemEsq + 28, linhaStart + (gap*2));

      doc.setFont('helvetica', 'bold'); doc.text('Tecido / Cor:', margemEsq, linhaStart + (gap*3));
      doc.setFont('helvetica', 'normal'); 
      doc.text(`${ordem.produtoTecido || 'Padrão'}  —  ${ordem.produtoCor || 'Única'}`, margemEsq + 28, linhaStart + (gap*3));

      // --- QR CODE ---
      if (qrCodeDataUrl) {
          doc.addImage(qrCodeDataUrl, 'PNG', 155, 28, 35, 35);
          doc.setFontSize(7);
          doc.text('Ver Imagem', 163, 65);
      } else {
          doc.setDrawColor(200);
          doc.rect(155, 28, 35, 35);
          doc.setFontSize(8);
          doc.text('Sem Imagem', 160, 48);
      }

      // --- AVIAMENTOS ---
      const startAviamentos = 75;
      doc.setFillColor(245, 245, 245);
      doc.rect(margemEsq, startAviamentos, 182, 20, 'F'); 

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('AVIAMENTOS:', margemEsq + 2, startAviamentos + 6);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Botão: ${ordem.botaoCodigo || '-'}`, margemEsq + 5, startAviamentos + 14);
      doc.text(`Linha: ${ordem.linhaCor || '-'}`, margemEsq + 70, startAviamentos + 14);
      doc.text(`Zíper: ${ordem.zipperCor || '-'}`, margemEsq + 130, startAviamentos + 14);

      // --- GRADE ---
      const tableData = ordem.grade.map(item => {
        const nomeTam = listaTamanhos.find(t => t.id === item.tamanhoId)?.nome || '??';
        return [nomeTam, item.quantidade];
      });
      
      const totalPecas = ordem.grade.reduce((acc, curr) => acc + curr.quantidade, 0);
      tableData.push(['TOTAL', `${totalPecas}`]);

      autoTable(doc, {
        startY: startAviamentos + 25,
        head: [['TAMANHO', 'QUANTIDADE']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        columnStyles: { 0: { halign: 'center', fontStyle: 'bold' }, 1: { halign: 'center' } },
        didParseCell: function (data) {
            if (data.row.index === tableData.length - 1) {
                data.cell.styles.fillColor = [220, 252, 231];
                data.cell.styles.fontStyle = 'bold';
            }
        }
      });

      // --- RODAPÉ ---
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // CORREÇÃO: Usando a função auxiliar para não dar erro
      const dataCriacaoFormatada = formatarData(ordem.dataCriacao);

      doc.setFontSize(8);
      doc.setTextColor(100); 
      
      doc.text(`Data de Lançamento no Sistema: ${dataCriacaoFormatada}`, margemEsq, finalY);
      doc.text(`Emitido por: ${usuarioLogado} em ${new Date().toLocaleDateString('pt-BR')}`, margemEsq, finalY + 5);

      window.open(doc.output('bloburl'), '_blank');

    } catch (error) {
      console.error(error);
      alert('Erro ao gerar PDF.');
    }
  }
};

export const etiquetaService = {

  gerarEtiquetas: async (ordem: any, listaTamanhos: any[]) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [ETIQUETA_HEIGHT, ETIQUETA_WIDTH]
      });

      let primeiraPagina = true;

      for (const item of ordem.grade) {
        if (!item.quantidade || item.quantidade <= 0) continue;

        const tamanhoObj = listaTamanhos.find(t => t.id === item.tamanhoId);
        const nomeTamanho = tamanhoObj ? tamanhoObj.nome : 'UN';
        
        // SKU Code
        const skuCode = `P-${ordem.produtoId}-C-${ordem.produtoCorId}-T-${item.tamanhoId}`;
        const qrUrl = await QRCode.toDataURL(skuCode, { margin: 0 });

        for (let i = 0; i < item.quantidade; i++) {
          
          if (!primeiraPagina) {
            doc.addPage([ETIQUETA_HEIGHT, ETIQUETA_WIDTH], 'landscape');
          }
          primeiraPagina = false;

          // Desenho da Etiqueta
          doc.addImage(qrUrl, 'PNG', 2, 5, 30, 30); 

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(ordem.produtoReferencia || 'REF', 34, 8);
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          const nomeSplit = doc.splitTextToSize(ordem.produtoNome || '', 25); 
          doc.text(nomeSplit, 34, 12);

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(nomeTamanho, 34, 25);

          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.text(ordem.produtoCor || 'Cor Unica', 34, 30);
          
          doc.setFontSize(5);
          doc.text(skuCode, 34, 36);
        }
      }

      window.open(doc.output('bloburl'), '_blank');

    } catch (error) {
      console.error("Erro ao gerar etiquetas", error);
      alert("Erro ao gerar etiquetas.");
    }
  }
};
