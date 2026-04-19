package com.industria.erpbackend.service;

import com.industria.erpbackend.entity.ItemPedido;
import com.industria.erpbackend.entity.Pedido;
import com.industria.erpbackend.repository.ClienteRepository;
import com.industria.erpbackend.repository.ProdutoRepository;
import com.industria.erpbackend.repository.TamanhoRepository;
import com.industria.erpbackend.repository.UsuarioRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PedidoReportService {

    @Autowired private TamanhoRepository tamanhoRepository;
    @Autowired private ProdutoRepository produtoRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    // Cores personalizadas para dar um ar profissional
    private static final Color HEADER_COLOR = new Color(230, 230, 230); // Cinza claro
    private static final Color ZEBRA_COLOR = new Color(245, 245, 245);  // Cinza muito claro

    public byte[] gerarPedidoPdf(Pedido pedido) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // ==========================================
            // 1. CABEÇALHO DA EMPRESA (TOPO)
            // ==========================================
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{3, 1}); // Coluna larga (Info), Coluna estreita (Data/ID)

            // Lado Esquerdo: Dados da Empresa
            Font fontEmpresa = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font fontSub = FontFactory.getFont(FontFactory.HELVETICA, 10);
            
            Paragraph empresaInfo = new Paragraph();
            empresaInfo.add(new Phrase("SUA EMPRESA INDÚSTRIA TÊXTIL\n", fontEmpresa));
            empresaInfo.add(new Phrase("CNPJ: 00.000.000/0001-00\n", fontSub));
            empresaInfo.add(new Phrase("Rua da Fábrica, 123 - Industrial\n", fontSub));
            empresaInfo.add(new Phrase("Tel: (35) 9999-9999", fontSub));
            
            PdfPCell cellEmpresa = new PdfPCell(empresaInfo);
            cellEmpresa.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(cellEmpresa);

            // Lado Direito: Número do Pedido e Data
            PdfPTable rightHeader = new PdfPTable(1);
            Font fontId = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            
            PdfPCell cellId = new PdfPCell(new Phrase("PEDIDO\n#" + pedido.getId(), fontId));
            cellId.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellId.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cellId.setBackgroundColor(HEADER_COLOR);
            cellId.setPadding(10);
            rightHeader.addCell(cellId);
            
            // Data de Criação
            String dataStr = pedido.getDataCriacao() != null ? 
                pedido.getDataCriacao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";
            PdfPCell cellData = new PdfPCell(new Phrase("Data: " + dataStr, fontSub));
            cellData.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellData.setBorder(Rectangle.NO_BORDER);
            rightHeader.addCell(cellData);

            PdfPCell cellRightWrapper = new PdfPCell(rightHeader);
            cellRightWrapper.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(cellRightWrapper);

            document.add(headerTable);
            document.add(new Paragraph(" ")); // Espaço
            document.add(new com.lowagie.text.pdf.draw.LineSeparator()); // Linha divisória
            document.add(new Paragraph(" ")); 

            // ==========================================
            // 2. DADOS DO CLIENTE E VENDEDOR
            // ==========================================
            String nomeCliente = "Consumidor Final";
            String docCliente = "-";
            String endereco = "-";

            if (pedido.getClienteId() != null) {
                var clienteOpt = clienteRepository.findById(pedido.getClienteId());
                if (clienteOpt.isPresent()) {
                    var c = clienteOpt.get();
                    nomeCliente = c.getNome();
                    docCliente = c.getCpfCnpj();
                    endereco = c.getMunicipio() + "/" + c.getEstado();
                }
            }
            
            // Busca Vendedor (Simplificado para evitar erro, busca na tabela de usuarios se possível)
            String nomeVendedor = "N/A";
            // Lógica simplificada: Apenas exibe o ID se não tiver mapeamento complexo
            if (pedido.getVendedorId() != null) {
                 nomeVendedor = "ID " + pedido.getVendedorId(); 
                 // Se você tiver repository de vendedor, pode descomentar a busca aqui
            }

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            
            infoTable.addCell(createNoBorderCell("CLIENTE:", true));
            infoTable.addCell(createNoBorderCell("VENDEDOR:", true));
            
            infoTable.addCell(createNoBorderCell(nomeCliente + "\nCPF/CNPJ: " + docCliente + "\nLocal: " + endereco, false));
            infoTable.addCell(createNoBorderCell(nomeVendedor + "\nStatus: " + (pedido.getStatus() != null ? pedido.getStatus() : "-"), false));

            document.add(infoTable);
            document.add(new Paragraph(" ")); 

            // ==========================================
            // 3. TABELA DE ITENS (ZEBRADA E ALINHADA)
            // ==========================================
            PdfPTable table = new PdfPTable(5); // 5 Colunas: Cod, Produto, Qtd, Unit, Total
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2, 6, 2, 3, 3}); 

            // Cabeçalho da Tabela
            addHeaderCell(table, "Cód.");
            addHeaderCell(table, "Produto / Tamanho");
            addHeaderCell(table, "Qtd");
            addHeaderCell(table, "Vlr. Unit.");
            addHeaderCell(table, "Total");

            NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
            
            if(pedido.getItens() != null) {
                int i = 0;
                for (ItemPedido item : pedido.getItens()) {
                    boolean isOdd = i % 2 != 0; // Verifica se é linha ímpar para zebrar
                    i++;

                    String codigo = "-";
                    String nomeProduto = "Produto Indefinido";
                    String nomeTamanho = "UN";

                    if (item.getSku() != null) {
                        codigo = item.getSku().getCodigoBarras();
                        if (item.getSku().getProdutoId() != null) {
                            Long pId = item.getSku().getProdutoId();
                            nomeProduto = produtoRepository.findById(pId)
                                    .map(p -> p.getNome())
                                    .orElse("Prod #" + pId);
                        }
                        if (item.getSku().getTamanhoId() != null) {
                            Integer tId = item.getSku().getTamanhoId();
                            nomeTamanho = tamanhoRepository.findById(tId) 
                                    .map(t -> t.getNome())
                                    .orElse(String.valueOf(tId));
                        }
                    }

                    // Preenche as linhas
                    addDataCell(table, codigo, isOdd, Element.ALIGN_CENTER);
                    addDataCell(table, nomeProduto + " (" + nomeTamanho + ")", isOdd, Element.ALIGN_LEFT);
                    addDataCell(table, item.getQuantidade() != null ? item.getQuantidade().toString() : "0", isOdd, Element.ALIGN_CENTER);
                    
                    String precoUnit = item.getPrecoUnitario() != null ? nf.format(item.getPrecoUnitario()) : "0,00";
                    addDataCell(table, precoUnit, isOdd, Element.ALIGN_RIGHT);
                    
                    // CORREÇÃO: Usando getPrecoTotal (que criamos no banco)
                    String totalItem = item.getPrecoTotal() != null ? nf.format(item.getPrecoTotal()) : "0,00";
                    addDataCell(table, totalItem, isOdd, Element.ALIGN_RIGHT);
                }
            }
            document.add(table);

            // ==========================================
            // 4. QUADRO DE TOTAIS (RODAPÉ)
            // ==========================================
            document.add(new Paragraph(" "));
            
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(40); // Ocupa só 40% da largura
            footerTable.setHorizontalAlignment(Element.ALIGN_RIGHT); // Fica na direita
            
            // Recupera valores (Corrigido para usar os campos novos)
            java.math.BigDecimal subtotal = pedido.getSubtotal() != null ? pedido.getSubtotal() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal frete = pedido.getValorFrete() != null ? pedido.getValorFrete() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal desconto = pedido.getDescontoAplicado() != null ? pedido.getDescontoAplicado() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal totalGeral = pedido.getValorTotal() != null ? pedido.getValorTotal() : java.math.BigDecimal.ZERO;

            addFooterRow(footerTable, "Subtotal:", nf.format(subtotal), false);
            addFooterRow(footerTable, "(+) Frete:", nf.format(frete), false);
            addFooterRow(footerTable, "(-) Desconto:", nf.format(desconto), false);
            addFooterRow(footerTable, "TOTAL:", nf.format(totalGeral), true); // Negrito

            document.add(footerTable);

            // Rodapé final da página
            Font fontRodape = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8);
            Paragraph rodape = new Paragraph("\nDocumento gerado eletronicamente em " + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), fontRodape);
            rodape.setAlignment(Element.ALIGN_CENTER);
            document.add(rodape);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao gerar PDF", e);
        }
    }

    // --- MÉTODOS AUXILIARES PARA LIMPAR O CÓDIGO ---

    private PdfPCell createNoBorderCell(String text, boolean bold) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 10, bold ? Font.BOLD : Font.NORMAL);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        cell.setBackgroundColor(Color.DARK_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addDataCell(PdfPTable table, String text, boolean isOdd, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        if (isOdd) {
            cell.setBackgroundColor(ZEBRA_COLOR); // Zebra
        }
        table.addCell(cell);
    }

    private void addFooterRow(PdfPTable table, String label, String value, boolean isTotal) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 10, isTotal ? Font.BOLD : Font.NORMAL);
        
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, font));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        
        PdfPCell cellValue = new PdfPCell(new Phrase(value, font));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        
        if(isTotal) {
            cellLabel.setBorder(Rectangle.TOP);
            cellValue.setBorder(Rectangle.TOP);
        }

        table.addCell(cellLabel);
        table.addCell(cellValue);
    }
}