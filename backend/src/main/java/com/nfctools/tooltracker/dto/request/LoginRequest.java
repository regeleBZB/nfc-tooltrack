package com.nfctools.tooltracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank public String username;
    @NotBlank public String password;
}
