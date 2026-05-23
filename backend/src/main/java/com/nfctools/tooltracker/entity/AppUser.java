package com.nfctools.tooltracker.entity;

import com.nfctools.tooltracker.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "app_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AppUser extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;    // BCrypt hashed

    @Column(nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.ADMIN;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

}