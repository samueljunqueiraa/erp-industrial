package com.industria.erpbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.industria.erpbackend.entity.ItemOrdemCorte;

import java.util.Optional;

@Repository
public interface ItemOrdemCorteRepository extends JpaRepository<ItemOrdemCorte, Long> {
    
    Optional<ItemOrdemCorte> findByOrdemCorteIdAndTamanhoId(Long ordemCorteId, Long tamanhoId);

    // =================================================================
    // --- CÁLCULO DE PRODUÇÃO FUTURA ---
    // =================================================================
    @Query(value = """
            SELECT COALESCE(SUM(ioc.qtd_planejada - COALESCE(ioc.qtd_conferida, 0)), 0)
            FROM tb_item_ordem_corte ioc
            JOIN tb_ordem_corte oc ON ioc.ordem_id = oc.id
            JOIN tb_sku s ON (s.produto_id = oc.produto_id AND s.tamanho_id = ioc.tamanho_id)
            WHERE s.id = :skuId 
            AND oc.status NOT IN ('FINALIZADA', 'CANCELADA')
        """, nativeQuery = true)
    Integer getQuantidadeEmProducao(@Param("skuId") Long skuId);
}