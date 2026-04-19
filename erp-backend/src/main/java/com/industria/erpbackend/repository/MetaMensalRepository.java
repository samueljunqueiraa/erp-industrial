package com.industria.erpbackend.repository;

import com.industria.erpbackend.entity.MetaMensal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MetaMensalRepository extends JpaRepository<MetaMensal, Long> {
    Optional<MetaMensal> findByMesAndAno(Integer mes, Integer ano);
}