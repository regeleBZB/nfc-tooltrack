package com.nfctools.tooltracker.dto.response;
import lombok.Data;

@Data
public class StudentResponse {
    private Long id;
    private String qrCode;
    private String name;
    private String section;
    private String contactNumber;
    private boolean active;
}
