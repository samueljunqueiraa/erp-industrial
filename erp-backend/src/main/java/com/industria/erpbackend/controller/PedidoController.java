package com.industria.erpbackend.controller;

import com.industria.erpbackend.entity.ItemPedido;
import com.industria.erpbackend.entity.MovimentacaoEstoque;
import com.industria.erpbackend.entity.Pedido;
import com.industria.erpbackend.repository.ItemOrdemCorteRepository;
import com.industria.erpbackend.entity.Sku;
import com.industria.erpbackend.entity.EstoqueSaldo;
import com.industria.erpbackend.repository.EstoqueSaldoRepository;
import com.industria.erpbackend.repository.MovimentacaoEstoqueRepository;
import com.industria.erpbackend.repository.PedidoRepository;
import com.industria.erpbackend.repository.SkuRepository;
import com.industria.erpbackend.service.PedidoReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin("*") 
public class PedidoController {

    @Autowired private PedidoReportService reportService; 
    @Autowired private PedidoRepository repository; 
    @Autowired private SkuRepository skuRepository;
    @Autowired private EstoqueSaldoRepository estoqueSaldoRepository; 
    @Autowired private MovimentacaoEstoqueRepository movimentacaoRepository; 
    
    @Autowired private ItemOrdemCorteRepository itemOrdemCorteRepository;

    @GetMapping
    public ResponseEntity<List<Pedido>> listarTodos() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @Transactional 
    public ResponseEntity<?> criar(@RequestBody Pedido pedido) {
        try {
            if (pedido.getDataCriacao() == null) {
                pedido.setDataCriacao(LocalDateTime.now());
            }

            if (pedido.getNumeroPedido() == null || pedido.getNumeroPedido().isEmpty()) {
                String codigoGerado = java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
                pedido.setNumeroPedido(codigoGerado);
            }

            java.math.BigDecimal subtotalCalculado = java.math.BigDecimal.ZERO;

            if (pedido.getItens() != null) {
                for (ItemPedido item : pedido.getItens()) {
                    item.setPedido(pedido);

                    if (item.getSku() != null) {
                        Long prodId = item.getSku().getProdutoId();
                        Integer tamId = item.getSku().getTamanhoId();
                        Sku skuReal = skuRepository.findByProdutoIdAndTamanhoId(prodId, tamId)
                                .orElseThrow(() -> new RuntimeException("SKU não encontrado"));
                        item.setSku(skuReal);
                        
                        if (skuReal.getId() != null) {
                            
                            // ========================================================
                            // === CÁLCULO DO ESTOQUE VIRTUAL ===
                            // ========================================================
                            EstoqueSaldo saldo = estoqueSaldoRepository.findBySkuId(skuReal.getId())
                                    .orElseThrow(() -> new RuntimeException("Saldo não inicializado para este SKU"));
                            
                            // Calcula Físico Livre
                            Integer qtdFisicaLivre = saldo.getQtdFisica() - saldo.getQtdReservada();
                            
                            Integer qtdEmProducao = itemOrdemCorteRepository.getQuantidadeEmProducao(skuReal.getId());
                            if (qtdEmProducao == null) qtdEmProducao = 0;
                            
                            Integer estoqueVirtualDisponivel = qtdFisicaLivre + qtdEmProducao;
                            
                            // Trava de segurança: Se pedir mais do que o Virtual permite, cancela tudo.
                            if (item.getQuantidade() > estoqueVirtualDisponivel) {
                                throw new RuntimeException("Estoque insuficiente para o produto. Solicitado: " 
                                    + item.getQuantidade() + " | Disponível (Físico + Produção): " + estoqueVirtualDisponivel);
                            }

                            // ========================================================
                            // === RESERVA DE ESTOQUE ===
                            // ========================================================
                            estoqueSaldoRepository.aumentarReserva(skuReal.getId(), item.getQuantidade());

                            // ========================================================
                            // === LOG DE MOVIMENTAÇÃO ALTERADO ===
                            // ========================================================
                            try {
                                MovimentacaoEstoque log = new MovimentacaoEstoque();
                                log.setSku(skuReal);
                                log.setQuantidade(item.getQuantidade());
                                log.setTipoMovimento("RESERVA"); 
                                log.setMotivo("VENDA_CRIADA");
                                log.setDocumentoReferencia("PED-" + pedido.getNumeroPedido());
                                log.setDataMovimentacao(LocalDateTime.now());
                                log.setOrigemMovimento("VENDA"); 
                                log.setOrdemCorteId(null); 
                                
                                movimentacaoRepository.save(log);
                                
                            } catch (Exception exLog) {
                                System.err.println("Erro ao gravar log: " + exLog.getMessage());
                            }
                        }
                    }

                    // Cálculos
                    java.math.BigDecimal precoUnit = item.getPrecoUnitario() != null ? item.getPrecoUnitario() : java.math.BigDecimal.ZERO;
                    java.math.BigDecimal qtd = new java.math.BigDecimal(item.getQuantidade());
                    java.math.BigDecimal totalItem = precoUnit.multiply(qtd);
                    
                    item.setPrecoTotal(totalItem); 
                    subtotalCalculado = subtotalCalculado.add(totalItem);
                }
            }

            // Totais
            pedido.setSubtotal(subtotalCalculado);
            java.math.BigDecimal frete = pedido.getValorFrete() != null ? pedido.getValorFrete() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal desconto = pedido.getDescontoAplicado() != null ? pedido.getDescontoAplicado() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal totalFinal = subtotalCalculado.add(frete).subtract(desconto);
            pedido.setValorTotal(totalFinal);

            // Salva
            Pedido salvo = repository.save(pedido);
            
            return ResponseEntity.ok(salvo);
            
        } catch (Exception e) {
            e.printStackTrace();
            
            return ResponseEntity.internalServerError().body("Erro ao salvar: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> baixarPdf(@PathVariable Long id) {
        Pedido pedido = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        byte[] pdfBytes = reportService.gerarPedidoPdf(pedido);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=pedido_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}