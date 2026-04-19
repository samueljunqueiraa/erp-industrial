package com.industria.erpbackend.repository;
import com.industria.erpbackend.entity.OrdemCorte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdemCorteRepository extends JpaRepository<OrdemCorte, Long> {

}
