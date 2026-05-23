package com.nfctools.tooltracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateStudentRequest {
    @Size(max = 100)           public String qrCode;
    @NotBlank @Size(max = 100) public String name;
    @Size(max = 50)            public String section;
    @Size(max = 20)            public String contactNumber;
}
