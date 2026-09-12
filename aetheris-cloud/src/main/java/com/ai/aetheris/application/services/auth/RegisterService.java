package com.ai.aetheris.application.services.auth;

import com.ai.aetheris.application.dtos.auth.RegisterAdminRequest;
import com.ai.aetheris.application.repositories.admin.AdminRepository;
import com.ai.aetheris.domain.admin.entities.Admin;
import com.ai.aetheris.application.repositories.shared.SettingsRepository;
import com.ai.aetheris.domain.shared.entities.Settings;
import com.ai.aetheris.domain.shared.enums.TemperatureScale;
import com.ai.aetheris.domain.shared.enums.UserStatus;
import com.ai.aetheris.infrastructure.config.AdminDefaultSettingsProperties;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class RegisterService {
    
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingsRepository settingsRepository;
    private final AdminDefaultSettingsProperties adminDefaultSettingsProperties;

    public RegisterService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            SettingsRepository settingsRepository,
            AdminDefaultSettingsProperties adminDefaultSettingsProperties) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.settingsRepository = settingsRepository;
        this.adminDefaultSettingsProperties = adminDefaultSettingsProperties;
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

        Settings settings = Settings.builder()
                .admin(admin)
                .snrWindowSize(adminDefaultSettingsProperties.getSnrWindowSize())
                .averageSeeingWindowSize(adminDefaultSettingsProperties.getAverageSeeingWindowSize())
                .criticalSeeingLineThreshold(adminDefaultSettingsProperties.getCriticalSeeingLineThreshold())
                .warningSeeingLineThreshold(adminDefaultSettingsProperties.getWarningSeeingLineThreshold())
                .criticalVoltageLineThreshold(adminDefaultSettingsProperties.getCriticalVoltageLineThreshold())
                .warningVoltageLineThreshold(adminDefaultSettingsProperties.getWarningVoltageLineThreshold())
                .temperatureScale(adminDefaultSettingsProperties.getTemperatureScale())
                .build();
        
        settingsRepository.save(settings);
        
        return "Admin registered successfully";
    }
}
