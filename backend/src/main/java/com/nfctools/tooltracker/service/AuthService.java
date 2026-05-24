package com.nfctools.tooltracker.service;

import com.nfctools.tooltracker.dto.request.LoginRequest;
import com.nfctools.tooltracker.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}
