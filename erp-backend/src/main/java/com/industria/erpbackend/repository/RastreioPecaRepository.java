package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.RastreioPeca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RastreioPecaRepository extends JpaRepository<RastreioPeca, Long> {
	// Verifica se já existe uma peça com o código único
    boolean existsByCodigoUnico(String codigoUnico);

    // Busca a peça pelo código (util para quando for dar baixa na venda)
    Optional<RastreioPeca> findByCodigoUnico(String codigoUnico);
}