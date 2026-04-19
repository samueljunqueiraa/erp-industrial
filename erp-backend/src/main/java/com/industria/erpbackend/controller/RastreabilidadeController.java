package com.industria.erpbackend.controller;

import com.industria.erpbackend.entity.OrdemCorte;
import com.industria.erpbackend.enums.StatusOrdem;
import com.industria.erpbackend.service.RastreabilidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/producao")
@CrossOrigin("*")
public class RastreabilidadeController {

    @Autowired
    private RastreabilidadeService rastreabilidadeService;

    @PostMapping("/ordem-corte/{id}/avancar")
    public ResponseEntity<?> avancarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        
        try {
            // Lê os dados enviados no JSON
            String statusStr = payload.get("novoStatus");
            StatusOrdem novoStatus = StatusOrdem.valueOf(statusStr);
            String usuario = payload.get("usuarioResponsavel");
            String obs = payload.get("observacao");

            OrdemCorte ordemAtualizada = rastreabilidadeService.avancarStatusProducao(id, novoStatus, usuario, obs);
            
            return ResponseEntity.ok(ordemAtualizada);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Status inválido. Verifique os valores permitidos no sistema.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao atualizar produção: " + e.getMessage());
        }
    }
}