package com.industria.erpbackend.controller;

import com.industria.erpbackend.dto.DashboardSummaryDTO;
import com.industria.erpbackend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") 
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/resumo-mensal") 
    public ResponseEntity<DashboardSummaryDTO> getResumo(){
        DashboardSummaryDTO summary = dashboardService.getMonthSummary();
        return ResponseEntity.ok(summary);
    }
    @GetMapping("/vendas-meta") 
    public ResponseEntity<DashboardSummaryDTO> getVendasMeta() {
        return ResponseEntity.ok(dashboardService.getMonthSummary());
    }

    // --- NOVO ENDPOINT POST ---
    @PostMapping("/atualizar-meta")
    public ResponseEntity<Void> atualizarMeta(@RequestBody Map<String, BigDecimal> payload) {
        // O front manda { "meta": 15000.00 }
        BigDecimal novaMeta = payload.get("meta");
        
        if (novaMeta == null || novaMeta.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().build();
        }

        dashboardService.atualizarMeta(novaMeta);
        
        return ResponseEntity.ok().build();
    }
}