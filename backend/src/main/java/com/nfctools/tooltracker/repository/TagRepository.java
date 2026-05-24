package com.nfctools.tooltracker.repository;

import com.nfctools.tooltracker.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, String> {

    // Primary lookup — called on every NFC scan from the kiosk
    Optional<Tag> findByUidAndActiveTrue(String uid);

    // Check if a tool already has an active tag before assigning a new one
    Optional<Tag> findByToolIdAndActiveTrue(Long toolId);

    boolean existsByUid(String uid);
}
