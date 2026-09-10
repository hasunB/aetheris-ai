package com.ai.aetheris.application.services.auth;

import com.ai.aetheris.application.dtos.auth.RegisterAdminRequest;
import com.ai.aetheris.application.repositories.admin.AdminRepository;
import com.ai.aetheris.domain.admin.entities.Admin;
import com.ai.aetheris.domain.shared.enums.UserStatus;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class RegisterService {
    
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String registerAdmin(RegisterAdminRequest request, String ipAddress) {
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        Admin admin = Admin.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .company(request.getCompany())
                .address(request.getAddress())
                .country(request.getCountry())
                .phoneNumber(request.getPhoneNumber())
                .ipAddress(ipAddress)
                .status(UserStatus.PENDING)
                .created(LocalDateTime.now())
                .updated(LocalDateTime.now())
                .build();
        
        adminRepository.save(admin);
        return "Admin registered successfully";
    }
}
