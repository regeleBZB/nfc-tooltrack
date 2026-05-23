package com.nfctools.tooltracker.dto.response;
import com.nfctools.tooltracker.enums.UserRole;
import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private UserRole role;
}
