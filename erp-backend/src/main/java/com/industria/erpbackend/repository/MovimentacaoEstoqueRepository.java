package com.industria.erpbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.industria.erpbackend.entity.MovimentacaoEstoque;

@Repository
public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    
    boolean existsByOrdemCorteIdAndSkuId(Long ordemCorteId, Long skuId);

}