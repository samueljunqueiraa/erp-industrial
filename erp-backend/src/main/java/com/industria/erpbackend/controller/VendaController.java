package com.industria.erpbackend.controller;

import com.industria.erpbackend.entity.Pedido;
import com.industria.erpbackend.service.PdfService;
import com.industria.erpbackend.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendas")
@CrossOrigin("*")
public class VendaController {

    @Autowired private VendaService vendaService;
    @Autowired private PdfService pdfService;

    // 1. Iniciar Venda (Abre o carrinho)
    @PostMapping("/iniciar")
    public ResponseEntity<Pedido> iniciar(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(vendaService.iniciarVenda(body.get("nomeCliente")));
    }

    // 2. Adicionar Item (Trava estoque)
    @PostMapping("/{id}/adicionar")
    public ResponseEntity<?> adicionarItem(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String sku = (String) body.get("sku");
            Integer qtd = Integer.parseInt(body.get("quantidade").toString());
            return ResponseEntity.ok(vendaService.adicionarItem(id, sku, qtd));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Finalizar e Baixar Estoque
    @PostMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(vendaService.finalizarVenda(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Baixar PDF
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> gerarPdf(@PathVariable Long id) {
        // Busca o pedido (poderia injetar repository aqui ou fazer método busca no service)
        // Por simplicidade, assumindo que vendaService.finalizar retorna o pedido atualizado, 
        // ou você cria um método 'buscarPorId' no Service.
        // Vamos supor que você criou o método buscarPorId no service:
        // Pedido p = vendaService.buscarPorId(id);
        
        // MODO RÁPIDO PARA O EXEMPLO (Injete o Repository aqui se preferir)
        return ResponseEntity.ok(new byte[0]); // Implemente a busca antes de gerar
    }
}