package com.ai.aetheris.presentation.controllers.auth;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @PostMapping("/login")
    public String login() {
        System.out.println("Login");
        return "Admin login";
    }

    @PostMapping("/register")
    public String register(@RequestBody String entity) {
        System.out.println("Registering admin");
        return "Admin registered successfully";
    }

}
