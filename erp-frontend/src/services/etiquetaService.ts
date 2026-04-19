import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

// --- CONFIGURAÇÃO FÍSICA ---
const ALTURA_ETIQUETA = 28; 
const MARGEM_ESQUERDA_COLUNA_1 = 2;
const MARGEM_ESQUERDA_COLUNA_2 = 54; 

export const etiquetaService = {

  gerarEtiquetasZebra: (ordem: any, listaTamanhos: any[]) => {
    
    if (!ordem.produtoCorId) {
      alert("Erro: ID da Cor faltando. Verifique se a ordem foi salva.");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [ALTURA_ETIQUETA, 105] 
      });

      const filaDeEtiquetas: any[] = [];
      
      let sequenciaGlobal = 1;
      const totalPecasOrdem = ordem.grade.reduce((acc: number, item: any) => acc + item.quantidade, 0);

      for (const item of ordem.grade) {
        if (!item.quantidade || item.quantidade <= 0) continue;
        const tamanhoObj = listaTamanhos.find(t => t.id === item.tamanhoId);
        const nomeTamanho = tamanhoObj ? tamanhoObj.nome : 'UN';
        // SKU Base (Sem serial): P-1-C-1-T-11
        const skuBase = `P-${ordem.produtoId}-C-${ordem.produtoCorId}-T-${item.tamanhoId}`;
        const loteRef = ordem.numeroLote || (ordem.id ? `OC-${ordem.id}` : 'NOVO');

        // --- LOOP DE QUANTIDADE ---
        for (let i = 0; i < item.quantidade; i++) {
          
          // 1. Gera o Código Único Serializado
          // Formato: SKU_BASE . ID_ORDEM . SEQUENCIA_GLOBAL
          // Ex: P-1-C-1-T-11.1050.1
          const codigoUnicoSerializado = `${skuBase}.${ordem.id}.${sequenciaGlobal}`;

          // 2. Gera a Imagem do Código de Barras para ESTE serial específico
          const canvas = document.createElement('canvas');
          JsBarcode(canvas, codigoUnicoSerializado, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false, 
            margin: 0
          });
          const barcodeImg = canvas.toDataURL("image/png");

          filaDeEtiquetas.push({
            sequencial: sequenciaGlobal,
            total: totalPecasOrdem, 
            tamanho: nomeTamanho,
            referencia: ordem.produtoReferencia,
            tecido: ordem.produtoTecido || 'S/ TECIDO',
            cor: ordem.produtoCor || 'S/ COR',
            lote: loteRef,
            skuTexto: codigoUnicoSerializado,
            imgBarcode: barcodeImg
          });

          sequenciaGlobal++;
        }
      }

      for (let i = 0; i < filaDeEtiquetas.length; i += 2) {
        
        if (i > 0) {
          doc.addPage([ALTURA_ETIQUETA, 105], 'landscape');
        }

        desenharEtiquetaIndividual(doc, filaDeEtiquetas[i], MARGEM_ESQUERDA_COLUNA_1);

        if (i + 1 < filaDeEtiquetas.length) {
          desenharEtiquetaIndividual(doc, filaDeEtiquetas[i+1], MARGEM_ESQUERDA_COLUNA_2);
        }
      }

      window.open(doc.output('bloburl'), '_blank');

    } catch (error) {
      console.error("Erro etiqueta:", error);
      alert("Erro ao gerar etiquetas.");
    }
  }
};

// --- FUNÇÃO DE DESENHO ---
const desenharEtiquetaIndividual = (doc: jsPDF, dados: any, xOffset: number) => {
    
    doc.setTextColor(0, 0, 0);

    // LINHA 1: REF e LOTE
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${dados.referencia || '-'}`, xOffset, 5);
    
    doc.setFontSize(7);
    doc.text(`LOTE: ${dados.lote}`, xOffset + 48, 5, { align: 'right' }); 

    // LINHA 2: TECIDO/COR e TAMANHO
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const tecidoCurto = (dados.tecido || '').substring(0, 18);
    const corCurta = (dados.cor || '').substring(0, 18);
    doc.text(tecidoCurto, xOffset, 9);  
    doc.text(corCurta, xOffset, 12);    

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(dados.tamanho, xOffset + 48, 14, { align: 'right' });

    // LINHA 3: SEQUENCIAL e CÓDIGO TEXTO
    doc.setFillColor(0, 0, 0);
    doc.rect(xOffset, 14, 18, 4, 'F'); 
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`SEQ: ${dados.sequencial}/${dados.total}`, xOffset + 9, 16.5, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.5); 
    doc.text(dados.skuTexto, xOffset + 48, 17, { align: 'right' }); 

    // LINHA 4: CÓDIGO DE BARRAS
    doc.addImage(dados.imgBarcode, 'PNG', xOffset, 18.5, 48, 8);
};