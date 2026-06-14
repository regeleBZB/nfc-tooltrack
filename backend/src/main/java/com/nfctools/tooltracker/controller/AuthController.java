package com.nfctools.tooltracker.controller;

import com.nfctools.tooltracker.dto.request.LoginRequest;
import com.nfctools.tooltracker.dto.response.ApiResponse;
import com.nfctools.tooltracker.dto.response.AuthResponse;
import com.nfctools.tooltracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request), "Login successful"));
    }
}
