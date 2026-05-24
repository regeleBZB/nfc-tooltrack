package com.nfctools.tooltracker.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a student/borrower.
 * qrCode is the value read from the student's QR ID card.
 * Keeping Student as its own entity (vs storing just a name string)
 * enables future features: borrow limits, history per student,
 * overdue notifications, section-based reporting.
 */
@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "qr_code", unique = true, length = 100)
    private String qrCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String section;

    @Column(length = 20)
    private String contactNumber;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
