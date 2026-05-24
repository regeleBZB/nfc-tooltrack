package com.nfctools.tooltracker.repository;

import com.nfctools.tooltracker.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsernameAndActiveTrue(String username);

    boolean existsByUsername(String username);
}
