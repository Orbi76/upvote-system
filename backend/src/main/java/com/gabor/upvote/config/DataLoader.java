package com.gabor.upvote.config;

import com.gabor.upvote.model.User;
import com.gabor.upvote.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Admin user létrehozása, ha még nem létezik
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setEmail("admin@upvote.com");
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));
            admin.setEnabled(true);

            userRepository.save(admin);
            System.out.println("✅ Admin user created: admin/admin");
        }

        // Teszt user létrehozása
        if (!userRepository.existsByUsername("testuser")) {
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setPassword(passwordEncoder.encode("test123"));
            testUser.setEmail("test@upvote.com");
            testUser.setRoles(Set.of("ROLE_USER"));
            testUser.setEnabled(true);

            userRepository.save(testUser);
            System.out.println("✅ Test user created: testuser/test123");
        }
    }
}