package com.industria.erpbackend.repository;
import com.industria.erpbackend.entity.Tamanho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TamanhoRepository extends JpaRepository<Tamanho, Integer> {
	
}