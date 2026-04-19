package com.industria.erpbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.industria.erpbackend.entity.Produto;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // Essa Query busca produtos onde o nome OU a referência contêm o termo digitado (ignorando maiúsculas/minúsculas)
    @Query("SELECT obj FROM Produto obj WHERE " +
           "LOWER(obj.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(obj.referenciaBase) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Produto> buscarPorNomeOuReferencia(@Param("termo") String termo);

}