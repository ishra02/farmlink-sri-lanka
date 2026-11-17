
package com.farmlink.backend.controller;

import com.farmlink.backend.model.User;
import com.farmlink.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5177",
        "http://127.0.0.1:5174"
    },
    allowCredentials = "true"
)
public class AuthController {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (user.getFullName() == null || user.getFullName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null
                || user.getPassword().length() < 6) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "message",
                        "Please provide valid registration details."
                    ));
        }

        if (!"customer".equals(user.getRole())
                && !"farmer".equals(user.getRole())) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid account role."));
        }

        if (userRepository.existsByEmail(user.getEmail().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "message",
                        "Email is already registered."
                    ));
        }

        user.setId(null);
        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);
        savedUser.setPassword(null);

        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginDetails,
            HttpServletRequest request) {

        // Invalidate previous login session
        HttpSession oldSession = request.getSession(false);

        if (oldSession != null) {
            oldSession.invalidate();
        }

        if (loginDetails.getEmail() == null
                || loginDetails.getPassword() == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "message",
                        "Email and password are required."
                    ));
        }

        User user = userRepository.findByEmail(
                loginDetails.getEmail().trim().toLowerCase()
        ).orElse(null);

        if (user == null
                || !passwordEncoder.matches(
                        loginDetails.getPassword(),
                        user.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                        "message",
                        "Invalid email or password."
                    ));
        }

        // Create a fresh session
        HttpSession newSession = request.getSession(true);

        newSession.setAttribute("userId", user.getId());
        newSession.setAttribute("userRole", user.getRole());
        newSession.setAttribute("userName", user.getFullName());

        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(
            Map.of("message", "Logged out successfully.")
        );
    }
}
