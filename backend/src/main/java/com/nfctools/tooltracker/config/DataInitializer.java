package com.nfctools.tooltracker.config;

import com.nfctools.tooltracker.entity.AppUser;
import com.nfctools.tooltracker.enums.UserRole;
import com.nfctools.tooltracker.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    CommandLineRunner seedAdminUser(AppUserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                AppUser admin = AppUser.builder()
                        .username("admin")
                        .password(encoder.encode("admin123"))
                        .fullName("Lab Administrator")
                        .role(UserRole.ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
                log.info("Default admin user created. username=admin password=admin123 — CHANGE IN PRODUCTION");
            }
        };
    }
}
