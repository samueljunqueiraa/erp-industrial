package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.EstoqueSaldo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstoqueSaldoRepository extends JpaRepository<EstoqueSaldo, Long> {

    Optional<EstoqueSaldo> findBySkuId(Long skuId);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE tb_estoque_saldo SET qtd_fisica = qtd_fisica - :qtd WHERE sku_id = :skuId", nativeQuery = true)
    void baixarEstoque(@Param("skuId") Long skuId, @Param("qtd") Integer qtd);

    // =================================================================
    // ---  RESERVA , NÃO MEXER NESSE TRECHO ---
    // =================================================================
    @Modifying
    @Transactional
    @Query(value = "UPDATE tb_estoque_saldo SET qtd_reservada = COALESCE(qtd_reservada, 0) + :qtd WHERE sku_id = :skuId", nativeQuery = true)
    void aumentarReserva(@Param("skuId") Long skuId, @Param("qtd") Integer qtd);

    @Query(value = """
            SELECT 
                s.codigo_barras AS sku,
                p.nome AS produto,
                oc.codigo_ordem AS ordem,
                CAST(ioc.qtd_planejada AS INTEGER) AS planejado, 
                CAST(ioc.qtd_conferida AS INTEGER) AS conferido,
                COALESCE(e.qtd_fisica, 0) AS saldo
            FROM tb_item_ordem_corte ioc
            JOIN tb_ordem_corte oc ON ioc.ordem_id = oc.id 
            JOIN tb_sku s ON (s.produto_id = oc.produto_id AND s.tamanho_id = ioc.tamanho_id)
            JOIN tb_produto p ON s.produto_id = p.id
            LEFT JOIN tb_estoque_saldo e ON e.sku_id = s.id
            WHERE oc.status <> 'CANCELADA'
            ORDER BY oc.id DESC, s.codigo_barras ASC
        """, nativeQuery = true)
    List<Object[]> buscarSaldoComDetalhes();
}