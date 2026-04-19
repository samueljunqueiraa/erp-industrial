package com.industria.erpbackend.service;

import com.industria.erpbackend.dto.EstoqueGradeDTO;
import com.industria.erpbackend.entity.*;
import com.industria.erpbackend.repository.EstoqueSaldoRepository;
import com.industria.erpbackend.repository.MovimentacaoEstoqueRepository;
import com.industria.erpbackend.repository.SkuRepository;
import com.industria.erpbackend.repository.TamanhoRepository; 
import com.industria.erpbackend.repository.ItemOrdemCorteRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import com.industria.erpbackend.dto.ProdutoDTO;
import com.industria.erpbackend.service.ProdutoService;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EstoqueService {

    @Autowired private EstoqueSaldoRepository saldoRepository;
    @Autowired private MovimentacaoEstoqueRepository movimentacaoRepository;
    @Autowired private SkuRepository skuRepository;
    @Autowired private TamanhoRepository tamanhoRepository;
    @Autowired private ProdutoService produtoService;
    
    // Para buscar o que está na costura 
    @Autowired private ItemOrdemCorteRepository itemOrdemCorteRepository;

    private static final String DEPOSITO_PADRAO = "MATRIZ";

    // --- MÉTODO DE ENTRADA (PRODUÇÃO) AJUSTADO ---
    @Transactional
    public void darEntradaProducao(Sku sku, Integer quantidade, OrdemCorte ordemOrigem) {
        if (quantidade == null || quantidade <= 0) return;

        // =================================================================
        // 1. TRANSFERÊNCIA (Baixa na OC)
        // =================================================================
        // Converte o Integer (do Sku) para Long (exigido pelo Repositório)
        Long tamanhoIdLong = sku.getTamanhoId() != null ? Long.valueOf(sku.getTamanhoId()) : null;

        if (tamanhoIdLong != null && ordemOrigem.getId() != null) {
            ItemOrdemCorte itemOC = itemOrdemCorteRepository.findByOrdemCorteIdAndTamanhoId(ordemOrigem.getId(), tamanhoIdLong)
                    .orElse(null);

            if (itemOC != null) {
                // Pega o que já foi conferido antes e soma a nova quantidade bipada
                int conferidoAtual = itemOC.getQtdConferida() != null ? itemOC.getQtdConferida() : 0;
                itemOC.setQtdConferida(conferidoAtual + quantidade);
                
                // Salva a OC atualizada
                itemOrdemCorteRepository.save(itemOC);
            }
        }

        // =================================================================
        // 2. AUMENTA O ESTOQUE FÍSICO
        // =================================================================
        EstoqueSaldo saldo = saldoRepository.findBySkuId(sku.getId())
                .orElse(new EstoqueSaldo());

        if (saldo.getId() == null) {
            saldo.setSkuId(sku.getId());
            saldo.setLocalizacao(DEPOSITO_PADRAO);
            saldo.setQtdFisica(0);
            saldo.setQtdReservada(0);
        }

        int novaQtd = saldo.getQtdFisica() + quantidade;
        saldo.setQtdFisica(novaQtd);
        saldoRepository.save(saldo);

        // =================================================================
        // 3. GRAVA O LOG DE MOVIMENTAÇÃO
        // =================================================================
        MovimentacaoEstoque mov = new MovimentacaoEstoque();
        
        mov.setSku(sku); 
        mov.setQuantidade(quantidade);
        mov.setTipoMovimento("ENTRADA"); 
        mov.setMotivo("PRODUCAO");
        mov.setOrigemMovimento("ORDEM_CORTE");
        mov.setDocumentoReferencia("OC-" + ordemOrigem.getId());
        mov.setDataMovimentacao(LocalDateTime.now());
        mov.setOrdemCorteId(ordemOrigem.getId());
        
        movimentacaoRepository.save(mov);
    }

    // --- CONSULTA PARA O FRONTEND ---
    @Transactional(readOnly = true)
    public EstoqueGradeDTO consultarGrade(Long produtoId, Long corId) {
        EstoqueGradeDTO dto = new EstoqueGradeDTO();

        List<Sku> skus = skuRepository.buscarTodosPorProdutoECor(produtoId, corId.intValue());

        for (Sku sku : skus) {
            String nomeTamanho = "UN";

            if (sku.getTamanhoId() != null) {
                nomeTamanho = tamanhoRepository.findById(sku.getTamanhoId())
                        .map(Tamanho::getNome) 
                        .orElse(String.valueOf(sku.getTamanhoId())); 
            }
            
            // 1. Busca Saldo Físico Livre (PODE FICAR NEGATIVO SE CONSUMIR DA PRODUÇÃO!)
            EstoqueSaldo saldo = saldoRepository.findBySkuId(sku.getId()).orElse(null);
            
            int qtdFisica = (saldo != null && saldo.getQtdFisica() != null) ? saldo.getQtdFisica() : 0;
            int qtdReservada = (saldo != null && saldo.getQtdReservada() != null) ? saldo.getQtdReservada() : 0;
            
            // Calculamos o saldo livre real sem a trava do Math.max(0, ...) ainda
            int saldoFisicoLivre = qtdFisica - qtdReservada;

            // 2. Busca o Saldo Virtual (O que está em produção)
            Integer producaoFutura = itemOrdemCorteRepository.getQuantidadeEmProducao(sku.getId());
            if (producaoFutura == null) {
                producaoFutura = 0;
            }

            // 3. O Ajuste Inteligente do Estoque Virtual!
            int fisicoParaOFront = Math.max(0, saldoFisicoLivre); // Para a tela, o físico nunca é negativo
            
            int producaoParaOFront = producaoFutura;
            // Se o físico livre ficou negativo, significa que a reserva "invadiu" as peças da OC.
            if (saldoFisicoLivre < 0) {
                // Como saldoFisicoLivre é negativo, o sinal de + vai subtrair o valor da producaoFutura
                producaoParaOFront = Math.max(0, producaoFutura + saldoFisicoLivre); 
            }

            // 4. Devolve para o Front-end (Físico, Produção) já com os cálculos blindados
            dto.add(nomeTamanho, fisicoParaOFront, producaoParaOFront);
        }

        return dto;
    }
    
    public byte[] exportarGradePdf(String termo) {
        // 1. Busca os produtos filtrados (reaproveitando a lógica que já existe)
        List<ProdutoDTO> produtos = produtoService.buscar(termo);

        // 2. Prepara o documento PDF em memória
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);
        document.open();

        try {
            // Título do PDF
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Disponibilidade de Estoque - Splindid", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Loop para desenhar as tabelas de cada produto
            for (ProdutoDTO prod : produtos) {
                Long corId = prod.getCorId() != null ? prod.getCorId() : 0L;
                
                // Reaproveita o SEU método blindado para pegar a grade!
                EstoqueGradeDTO grade = consultarGrade(prod.getId(), corId);

                // Cabeçalho do Produto
                Font prodFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
                String ref = prod.getReferenciaBase() != null ? prod.getReferenciaBase() : "S/REF";
                String nomeCor = prod.getNomeCor() != null ? prod.getNomeCor() : "";
                
                Paragraph prodHeader = new Paragraph("CÓD: " + ref + " - " + prod.getNome() + " " + nomeCor, prodFont);
                prodHeader.setSpacingBefore(10);
                prodHeader.setSpacingAfter(5);
                document.add(prodHeader);

                // Monta a Tabela da Grade
                PdfPTable table = new PdfPTable(3); // 3 Colunas
                table.setWidthPercentage(100);
                table.setWidths(new float[]{1f, 2f, 2f});
                
                // Cabeçalho da Tabela
                PdfPCell cellTamanho = new PdfPCell(new Phrase("Tamanho", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                cellTamanho.setBackgroundColor(new Color(241, 245, 249)); // Cinza claro
                PdfPCell cellFisico = new PdfPCell(new Phrase("Pronta Entrega (Físico)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                cellFisico.setBackgroundColor(new Color(240, 253, 244)); // Verde claro
                PdfPCell cellProducao = new PdfPCell(new Phrase("Venda Programada (OC)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                cellProducao.setBackgroundColor(new Color(239, 246, 255)); // Azul claro
                
                table.addCell(cellTamanho);
                table.addCell(cellFisico);
                table.addCell(cellProducao);

                // Preenche as linhas da tabela (Tamanhos padrão)
                String[] tamanhos = {"44", "46", "48", "50", "52", "54"};
                for (String t : tamanhos) {
                    EstoqueGradeDTO.DadosEstoque dados = grade.get(t);
                    int fisico = dados != null ? dados.fisico : 0;
                    int producao = dados != null ? dados.producao : 0;

                    table.addCell(new PdfPCell(new Phrase(t)));
                    table.addCell(new PdfPCell(new Phrase(String.valueOf(fisico))));
                    table.addCell(new PdfPCell(new Phrase(String.valueOf(producao))));
                }
                document.add(table);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            document.close();
        }

        return baos.toByteArray(); // Devolve o PDF pronto em formato de bytes
    }
}