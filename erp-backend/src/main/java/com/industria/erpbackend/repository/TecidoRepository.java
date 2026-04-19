package com.industria.erpbackend.repository;
import com.industria.erpbackend.entity.Tecido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TecidoRepository extends JpaRepository<Tecido, Integer> {
	
}