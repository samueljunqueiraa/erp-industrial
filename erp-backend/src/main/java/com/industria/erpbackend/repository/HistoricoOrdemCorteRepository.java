package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.HistoricoOrdemCorte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoOrdemCorteRepository extends JpaRepository<HistoricoOrdemCorte, Long> {
  
    List<HistoricoOrdemCorte> findByOrdemCorteIdOrderByDataHoraMovimentoDesc(Long ordemId);
}