package com.industria.erpbackend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.industria.erpbackend.entity.ItemPedido;
import com.industria.erpbackend.entity.Pedido;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class PdfService {

    public byte[] gerarNotaVenda(Pedido pedido) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);

            Paragraph titulo = new Paragraph("NOTA DE VENDA #" + pedido.getId(), fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);
            document.add(new Paragraph("\n"));

            // Ajuste: Usando ObservacoesNota em vez de nomeCliente
            String cliente = pedido.getObservacoesNota() != null ? pedido.getObservacoesNota() : "Cliente Balcão";
            document.add(new Paragraph("Cliente/Obs: " + cliente, fontNormal));
            document.add(new Paragraph("Data: " + pedido.getDataCriacao(), fontNormal));
            document.add(new Paragraph("Status: " + pedido.getStatus(), fontNormal));
            document.add(new Paragraph("\n"));

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            
            table.addCell(new PdfPCell(new Phrase("Produto", fontNormal)));
            table.addCell(new PdfPCell(new Phrase("Qtd", fontNormal)));
            table.addCell(new PdfPCell(new Phrase("Preço Un.", fontNormal)));
            table.addCell(new PdfPCell(new Phrase("Total", fontNormal)));

            NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));

            for (ItemPedido item : pedido.getItens()) {
                String nomeProd = "SKU: " + item.getSku().getCodigoBarras();
                
                table.addCell(new Phrase(nomeProd));
                table.addCell(new Phrase(item.getQuantidade().toString()));
                // Ajuste: Convertendo BigDecimal para Double para formatar (ou usando formatter direto)
                table.addCell(new Phrase(nf.format(item.getPrecoUnitario())));
                table.addCell(new Phrase(nf.format(item.getSubtotal())));
            }

            document.add(table);

            // Ajuste CRÍTICO: Usando getSubtotal() em vez de getValorTotal()
            Paragraph total = new Paragraph("\nVALOR TOTAL: " + nf.format(pedido.getSubtotal()), fontTitulo);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}