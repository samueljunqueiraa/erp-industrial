package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.Sku;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkuRepository extends JpaRepository<Sku, Long> {
	
    Optional<Sku> findByCodigoBarras(String codigoBarras);
    @Query("SELECT s FROM Sku s WHERE s.produtoId = :produtoId AND s.corId = :corId")
    List<Sku> buscarTodosPorProdutoECor(
        @Param("produtoId") Long produtoId, 
        @Param("corId") Integer corId 
    );

    Optional<Sku> findByProdutoIdAndTamanhoId(Long produtoId, Integer tamanhoId);

}