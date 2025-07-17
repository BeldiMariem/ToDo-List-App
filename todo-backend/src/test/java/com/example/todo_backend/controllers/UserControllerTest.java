package com.example.todo_backend.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.todo_backend.entities.User;
import com.example.todo_backend.repositories.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        user = new User();
        user.setUsername("mariem");
        user.setEmail("mariem@example.com");
        user.setPassword(passwordEncoder.encode("mariem"));
        userRepository.save(user);
    }


    @Test
    @WithMockUser(username = "mariem")
    public void updatePassword_shouldReturnNoContent() throws Exception {
        String json = """
    {
        "oldPassword": "mariem",
        "newPassword": "newPassword123"
    }
""";

        mockMvc.perform(put("/api/users/updatePassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "mariem")
    public void deleteUser_shouldReturnNoContent() throws Exception {
        String deleteRequest = """
    {
        "password": "mariem"
    }
""";
        mockMvc.perform(delete("/api/users/deleteUser")
                .contentType(MediaType.APPLICATION_JSON)
                .content(deleteRequest))
                .andExpect(status().isNoContent());
    }
}
