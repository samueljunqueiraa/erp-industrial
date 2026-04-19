package com.industria.erpbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.industria.erpbackend.dto.RecebimentoDTO;
import com.industria.erpbackend.service.ExpedicaoService;
import com.industria.erpbackend.repository.EstoqueSaldoRepository;
import com.industria.erpbackend.dto.ConferenciaPedidoDTO;

import java.util.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/expedicao")
public class ExpedicaoController {

    @Autowired
    private ExpedicaoService expedicaoService;

    @Autowired
    private EstoqueSaldoRepository estoqueRepository;

    // --- 1. RECEBIMENTO (Mantendo a funcionalidade existente) ---
    @PostMapping("/recebimento/bipar")
    public ResponseEntity<?> biparEntrada(@RequestBody RecebimentoDTO dto) {
        try {
            // Nota: Certifique-se que o método processarEntrada existe no service
            // Se ele não retornar nada (void), mude aqui para return ResponseEntity.ok().build();
            var resultado = expedicaoService.processarEntrada(dto);
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao processar bipagem: " + e.getMessage());
        }
    }

    // --- 2. LISTAR ESTOQUE (Mantendo a funcionalidade existente) ---
    @GetMapping("/estoque")
    public ResponseEntity<List<Map<String, Object>>> listarEstoque() {
        List<Object[]> resultados = estoqueRepository.buscarSaldoComDetalhes();
        
        List<Map<String, Object>> lista = new ArrayList<>();
        
        for (Object[] row : resultados) {
            Map<String, Object> item = new HashMap<>();
            // Ajuste os índices conforme sua query SQL (0=sku, 1=produto, etc)
            item.put("sku", row[0]);
            item.put("produto", row[1]);
            item.put("ordem", row[2]);
            item.put("planejado", row[3]);
            item.put("conferido", row[4]); 
            item.put("saldo", row[5]);      
            
            lista.add(item);
        }
        return ResponseEntity.ok(lista);
    }

    // --- 3. LISTAR PEDIDOS PENDENTES (NOVO - Para a tela de Expedição) ---
    @GetMapping("/pedidos-pendentes")
    public ResponseEntity<?> listarPedidosPendentes() {
        try {
            List<ConferenciaPedidoDTO> pendentes = expedicaoService.listarPedidosPendentes();
            return ResponseEntity.ok(pendentes);
        } catch (Exception e) {
            e.printStackTrace(); // Bom para debug no console
            return ResponseEntity.internalServerError().body("Erro ao listar pedidos: " + e.getMessage());
        }
    }

    // --- 4. CONFERIR ITEM (NOVO - Ação de Bipar na Saída) ---
    @PostMapping("/pedido/{id}/conferir")
    public ResponseEntity<?> conferirItemPedido(@PathVariable("id") Long pedidoId,
                                               @RequestBody CodigoBarrasRequest request) {
        try {
            if (request == null || request.getCodigoBarras() == null || request.getCodigoBarras().isBlank()) {
                return ResponseEntity.badRequest().body("O campo 'codigoBarras' é obrigatório.");
            }
            
            expedicaoService.conferirItemPedido(pedidoId, request.getCodigoBarras());
            
            return ResponseEntity.ok().build(); // Retorna 200 OK se deu tudo certo
            
        } catch (IllegalArgumentException e) {
            // Erros de negócio (ex: produto errado, quantidade excedida) retornam 400
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Erros inesperados retornam 500
            return ResponseEntity.internalServerError().body("Erro ao conferir item: " + e.getMessage());
        }
    }

    // --- DTO INTERNO PARA O JSON DA REQUISIÇÃO ---
    public static class CodigoBarrasRequest {
        private String codigoBarras;

        public CodigoBarrasRequest() {}

        public CodigoBarrasRequest(String codigoBarras) {
            this.codigoBarras = codigoBarras;
        }

        public String getCodigoBarras() {
            return codigoBarras;
        }

        public void setCodigoBarras(String codigoBarras) {
            this.codigoBarras = codigoBarras;
        }
    }
}
