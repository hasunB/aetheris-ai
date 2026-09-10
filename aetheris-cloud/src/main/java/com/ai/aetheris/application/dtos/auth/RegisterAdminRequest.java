package com.ai.aetheris.application.dtos.auth;

import lombok.Data;

@Data
public class RegisterAdminRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String company;
    private String address;
    private String country;
    private String phoneNumber;
}
