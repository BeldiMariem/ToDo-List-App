package com.example.todo_backend.controllers;

import java.util.Collections;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.todo_backend.dtos.BoardUpdateDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BoardControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BoardRepository boardRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user;
    private Board board;

    @BeforeEach
    void setup() {
        boardRepository.deleteAll();
        userRepository.deleteAll();

        user = new User();
        user.setUsername("mariem");
        user.setEmail("mariem@example.com");
        user.setPassword(passwordEncoder.encode("password"));
        user = userRepository.save(user);

        board = new Board();
        board.setName("My Board");

        BoardMember member = new BoardMember();
        member.setUser(user);
        member.setBoard(board);
        member.setRole("ADMIN");

        board.setMembers(Collections.singletonList(member));
        board = boardRepository.save(board);
    }

    /* 
    @Test
    void testCreateBoard() throws Exception {
    Long userId = 1L;

    BoardDTO requestDTO = new BoardDTO();
    requestDTO.setName("New Project");
    requestDTO.setDescription("Description");

    BoardDTO responseDTO = new BoardDTO();
    responseDTO.setId(1L);
    responseDTO.setName("New Project");
    responseDTO.setDescription("Description");

    when(authService.getCurrentUserId()).thenReturn(userId);

    when(boardService.createBoard(any(BoardDTO.class), eq(userId))).thenReturn(responseDTO);

    mockMvc.perform(post("/api/boards/createBoard")
            .contentType(MediaType.APPLICATION_JSON)
            .content(new ObjectMapper().writeValueAsString(requestDTO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.name").value("New Project"))
            .andExpect(jsonPath("$.description").value("Description"));
    }
     */
    @Test
    @WithMockUser(username = "mariem")
    void testUpdateBoard() throws Exception {
        BoardUpdateDTO updateDTO = new BoardUpdateDTO();
        updateDTO.setBoardId(board.getId());
        updateDTO.setNewName("Updated Name");

        mockMvc.perform(put("/api/boards/updateBoard")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    @WithMockUser(username = "mariem")
    void testGetBoardById() throws Exception {
        mockMvc.perform(get("/api/boards/getBoard/" + board.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("My Board"));
    }

    @Test
    @WithMockUser(username = "mariem")
    void testDeleteBoard() throws Exception {
        mockMvc.perform(delete("/api/boards/deleteBoard/" + board.getId()))
                .andExpect(status().isNoContent());
    }
}
