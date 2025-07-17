package com.example.todo_backend.controllers;

import java.time.LocalDateTime;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.CommentRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CommentControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    @Autowired private CommentRepository commentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ListEntityRepository listRepository;
    @Autowired private BoardRepository boardRepository;
    @Autowired private CardRepository cardRepository;

    private User user;
    private Card card;

    @BeforeEach
    void setup() {
        cleanDatabase();
        user = createUser("mariem", "mariem@example.com", "password");
        Board board = createBoardWithAdmin(user, "My Board");
        ListEntity list = createList("My List", "blue", board);
        card = createCard("My Card", "Test card", list);
    }

    @Test
    @WithMockUser(username = "mariem")
    void testCreateComment() throws Exception {
        CommentDTO commentDTO = new CommentDTO();
        commentDTO.setContent("Test comment");
        commentDTO.setCardId(card.getId());

        mockMvc.perform(post("/api/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Test comment"))
                .andExpect(jsonPath("$.cardId").value(card.getId().intValue()))
                .andExpect(jsonPath("$.user.username").value("mariem"));
    }

    @Test
    @WithMockUser(username = "mariem")
    void testGetCommentsByCard() throws Exception {
        createAndSaveComment("Another comment");

        mockMvc.perform(get("/api/comments/getCommentsByCard/" + card.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(username = "mariem")
    void testDeleteComment() throws Exception {
        CommentDTO savedComment = createAndSaveComment("Delete this");

        mockMvc.perform(delete("/api/comments/deleteComment/" + savedComment.getId()))
                .andExpect(status().isNoContent());
    }

    private void cleanDatabase() {
        commentRepository.deleteAll();
        cardRepository.deleteAll();
        listRepository.deleteAll();
        boardRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createUser(String username, String email, String rawPassword) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    private Board createBoardWithAdmin(User user, String name) {
        Board board = new Board();
        board.setName(name);

        BoardMember member = new BoardMember();
        member.setUser(user);
        member.setRole("ADMIN");
        member.setBoard(board);

        board.setMembers(Collections.singletonList(member));
        return boardRepository.save(board);
    }

    private ListEntity createList(String name, String color, Board board) {
        ListEntity list = new ListEntity();
        list.setName(name);
        list.setColor(color);
        list.setBoard(board);
        return listRepository.save(list);
    }

    private Card createCard(String title, String description, ListEntity list) {
        Card card = new Card();
        card.setTitle(title);
        card.setDescription(description);
        card.setList(list);
        return cardRepository.save(card);
    }

    private CommentDTO createAndSaveComment(String content) throws Exception {
        CommentDTO commentDTO = new CommentDTO();
        commentDTO.setContent(content);
        commentDTO.setCardId(card.getId());
        commentDTO.setCreatedAt(LocalDateTime.now());
        commentDTO.setUser(new UserDTO(user.getId(), user.getUsername(), user.getEmail()));

        String response = mockMvc.perform(post("/api/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readValue(response, CommentDTO.class);
    }
}
