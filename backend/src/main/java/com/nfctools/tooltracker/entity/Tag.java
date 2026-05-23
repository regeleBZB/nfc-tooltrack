package com.nfctools.tooltracker.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps a physical NFC tag UID (read by the USB reader) to a Tool.
 * The UID is the hardware-burned value that appears when you tap
 * the tag on Notepad — it is immutable and used as the primary key.
 *
 * Separation from Tool allows:
 *   - replacing a damaged tag without losing tool history
 *   - future support for multi-tag tools
 *   - tag audit trail (who encoded it, when)
 */
@Entity
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag extends BaseEntity {

    @Id
    @Column(name = "uid", length = 50)
    private String uid;             // e.g. "04A3F2C1" — normalized UPPERCASE

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tool_id", nullable = false, unique = true)
    private Tool tool;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;  // set false when tag is replaced/damaged

    @Column(name = "encoded_by", length = 100)
    private String encodedBy;       // admin username who registered this tag

    @Column(name = "notes", length = 255)
    private String notes;
}
