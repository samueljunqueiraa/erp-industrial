package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Cria uma busca personalizada: Procura o texto no Nome (Razão) OU no Fantasia
    // LOWER() serve para ignorar maiúsculas/minúsculas
    @Query("SELECT c FROM Cliente c WHERE " +
           "LOWER(c.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(c.nomeFantasia) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Cliente> buscarPorNomeOuFantasia(@Param("termo") String termo);
}