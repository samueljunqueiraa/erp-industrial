package com.industria.erpbackend.service;

import com.industria.erpbackend.entity.HistoricoOrdemCorte;
import com.industria.erpbackend.entity.OrdemCorte;
import com.industria.erpbackend.enums.StatusOrdem;
import com.industria.erpbackend.repository.HistoricoOrdemCorteRepository;
import com.industria.erpbackend.repository.OrdemCorteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RastreabilidadeService {

    @Autowired
    private OrdemCorteRepository ordemCorteRepository;

    @Autowired
    private HistoricoOrdemCorteRepository historicoRepository;

    @Transactional
    public OrdemCorte avancarStatusProducao(Long ordemId, StatusOrdem novoStatus, String usuario, String observacao) {
        
        OrdemCorte ordem = ordemCorteRepository.findById(ordemId)
                .orElseThrow(() -> new RuntimeException("Ordem de Corte não encontrada com o ID: " + ordemId));

        StatusOrdem statusAntigo = ordem.getStatus();

        // Evitar redundâncias de cliques no painel
        if (statusAntigo == novoStatus) {
            return ordem; 
        }

        // 1. Atualiza a Ordem de Corte
        ordem.setStatus(novoStatus);
        ordem = ordemCorteRepository.save(ordem);

        // 2. Grava o Registo de Auditoria/Rastreabilidade
        HistoricoOrdemCorte historico = new HistoricoOrdemCorte();
        historico.setOrdemCorte(ordem);
        historico.setStatusAnterior(statusAntigo);
        historico.setStatusNovo(novoStatus);
        historico.setDataHoraMovimento(LocalDateTime.now());
        historico.setUsuarioResponsavel(usuario);
        historico.setObservacao(observacao);

        historicoRepository.save(historico);

        return ordem;
    }
}