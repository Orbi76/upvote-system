package com.gabor.upvote.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gabor.upvote.dto.RegistrationRequest;
import com.gabor.upvote.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Admin user mindig létezik a DataLoader miatt, de a test usereket töröljük
        userRepository.findByUsername("testuser").ifPresent(userRepository::delete);
        userRepository.findByUsername("newuser").ifPresent(userRepository::delete);
    }

    @Test
    void shouldRegisterNewUser() throws Exception {
        RegistrationRequest request = new RegistrationRequest();
        request.setUsername("newuser");
        request.setPassword("password123");
        request.setEmail("newuser@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.message").value("Registration successful"));
    }

    @Test
    void shouldNotRegisterDuplicateUsername() throws Exception {
        // Első regisztráció
        RegistrationRequest request1 = new RegistrationRequest();
        request1.setUsername("duplicateuser");
        request1.setPassword("password123");
        request1.setEmail("user1@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        // Második regisztráció ugyanazzal a felhasználónévvel
        RegistrationRequest request2 = new RegistrationRequest();
        request2.setUsername("duplicateuser");
        request2.setPassword("password456");
        request2.setEmail("user2@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("Username already exists")));
    }

    @Test
    void shouldNotRegisterDuplicateEmail() throws Exception {
        RegistrationRequest request1 = new RegistrationRequest();
        request1.setUsername("user1");
        request1.setPassword("password123");
        request1.setEmail("same@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        RegistrationRequest request2 = new RegistrationRequest();
        request2.setUsername("user2");
        request2.setPassword("password456");
        request2.setEmail("same@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("Email already exists")));
    }

    @Test
    void shouldValidateRegistrationRequest() throws Exception {
        // Túl rövid username
        RegistrationRequest request1 = new RegistrationRequest();
        request1.setUsername("ab"); // 3 karakter minimum
        request1.setPassword("password123");
        request1.setEmail("test@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isBadRequest());

        // Túl rövid jelszó
        RegistrationRequest request2 = new RegistrationRequest();
        request2.setUsername("validuser");
        request2.setPassword("12345"); // 6 karakter minimum
        request2.setEmail("test@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isBadRequest());

        // Érvénytelen email
        RegistrationRequest request3 = new RegistrationRequest();
        request3.setUsername("validuser");
        request3.setPassword("password123");
        request3.setEmail("invalid-email");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request3)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldGetCurrentUserWithBasicAuth() throws Exception {
        // Regisztrálunk egy usert
        RegistrationRequest request = new RegistrationRequest();
        request.setUsername("authtest");
        request.setPassword("password123");
        request.setEmail("authtest@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Basic Auth-tal lekérjük az aktuális usert
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Basic " +
                                java.util.Base64.getEncoder().encodeToString("authtest:password123".getBytes())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("authtest"))
                .andExpect(jsonPath("$.email").value("authtest@example.com"));
    }

    @Test
    void shouldNotGetCurrentUserWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldNotGetCurrentUserWithInvalidAuth() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Basic " +
                                java.util.Base64.getEncoder().encodeToString("invalid:credentials".getBytes())))
                .andExpect(status().isUnauthorized());
    }
}