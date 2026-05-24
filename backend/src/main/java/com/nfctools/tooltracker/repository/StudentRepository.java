package com.nfctools.tooltracker.repository;

import com.nfctools.tooltracker.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByQrCodeAndActiveTrue(String qrCode);

    Optional<Student> findByNameIgnoreCaseAndActiveTrue(String name);

    boolean existsByQrCode(String qrCode);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.section) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Student> search(@Param("q") String query, Pageable pageable);
}
