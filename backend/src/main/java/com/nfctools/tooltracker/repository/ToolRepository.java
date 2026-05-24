package com.nfctools.tooltracker.repository;

import com.nfctools.tooltracker.entity.Tool;
import com.nfctools.tooltracker.enums.ToolStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ToolRepository extends JpaRepository<Tool, Long> {

    Optional<Tool> findByToolCode(String toolCode);

    boolean existsByToolCode(String toolCode);

    List<Tool> findByStatus(ToolStatus status);

    Page<Tool> findByStatus(ToolStatus status, Pageable pageable);

    Page<Tool> findByCategory(String category, Pageable pageable);

    // Full-text search across name, toolCode, category
    @Query("SELECT t FROM Tool t WHERE " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(t.toolCode) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(t.category) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Tool> search(@Param("q") String query, Pageable pageable);

    List<String> findDistinctCategoryByOrderByCategoryAsc();
}
