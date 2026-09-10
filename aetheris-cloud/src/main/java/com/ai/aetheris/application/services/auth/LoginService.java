package com.ai.aetheris.application.services.auth;

import com.ai.aetheris.application.dtos.auth.AuthResponse;
import com.ai.aetheris.application.dtos.auth.LoginRequest;
import com.ai.aetheris.application.repositories.admin.AdminRepository;
import com.ai.aetheris.domain.admin.entities.Admin;
import com.ai.aetheris.infrastructure.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginService(AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String jwtToken = jwtService.generateToken(admin);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .message("Login successful")
                .build();
    }
}
