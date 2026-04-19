package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.ContaReceber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContaReceberRepository extends JpaRepository<ContaReceber, Long> {

    @Query("SELECT c FROM ContaReceber c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:termo IS NULL OR LOWER(c.cliente) LIKE LOWER(CONCAT('%', :termo, '%')) OR LOWER(c.documento) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<ContaReceber> buscarComFiltros(@Param("status") String status, @Param("termo") String termo);
}