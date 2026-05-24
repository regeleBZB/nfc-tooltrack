package com.nfctools.tooltracker.service.impl;

import com.nfctools.tooltracker.dto.request.LoginRequest;
import com.nfctools.tooltracker.dto.response.AuthResponse;
import com.nfctools.tooltracker.entity.AppUser;
import com.nfctools.tooltracker.exception.BusinessException;
import com.nfctools.tooltracker.repository.AppUserRepository;
import com.nfctools.tooltracker.service.AuthService;
import com.nfctools.tooltracker.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse login(LoginRequest request) {
        AppUser user = userRepository.findByUsernameAndActiveTrue(request.getUsername())
                .orElseThrow(() -> new BusinessException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtUtil.generateToken(user.getUsername(), "ROLE_" + user.getRole().name());

        AuthResponse r = new AuthResponse();
        r.setToken(token);
        r.setUsername(user.getUsername());
        r.setFullName(user.getFullName());
        r.setRole(user.getRole());
        return r;
    }
}
