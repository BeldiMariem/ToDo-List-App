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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CardControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    @Autowired private UserRepository userRepository;
    @Autowired private BoardRepository boardRepository;
    @Autowired private ListEntityRepository listRepository;
    @Autowired private CardRepository cardRepository;

    private User user;
    private ListEntity listEntity;

    @BeforeEach
    void setup() {
        cardRepository.deleteAll();
        listRepository.deleteAll();
        boardRepository.deleteAll();
        userRepository.deleteAll();

        user = new User();
        user.setUsername("mariem");
        user.setPassword(passwordEncoder.encode("password"));
        user.setEmail("mariem@example.com");
        user = userRepository.save(user);

        Board board = new Board();
        board.setName("Project Board");

        BoardMember boardMember = new BoardMember();
        boardMember.setUser(user);
        boardMember.setRole("ADMIN");
        boardMember.setBoard(board);
        board.setMembers(Collections.singletonList(boardMember));

        board = boardRepository.save(board);

        listEntity = new ListEntity();
        listEntity.setName("To Do");
        listEntity.setColor("#00f");
        listEntity.setBoard(board);
        listEntity = listRepository.save(listEntity);
    }

    @Test
    @WithMockUser(username = "mariem")
    void testCreateCard() throws Exception {
        CardDTO cardDTO = new CardDTO();
        cardDTO.setTitle("Test Card");
        cardDTO.setDescription("Description");
        cardDTO.setListId(listEntity.getId());

        mockMvc.perform(post("/api/cards/createCard")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cardDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Card"))
                .andExpect(jsonPath("$.description").value("Description"))
                .andExpect(jsonPath("$.listId").value(listEntity.getId()));
    }

    @Test
    @WithMockUser(username = "mariem")
    void testGetCardsByList() throws Exception {
        Card card = new Card();
        card.setTitle("List Card");
        card.setDescription("In list");
        card.setList(listEntity);
        cardRepository.save(card);

        mockMvc.perform(get("/api/cards/getCardsByList/" + listEntity.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("List Card"));
    }

    @Test
    @WithMockUser(username = "mariem")
    void testUpdateCard() throws Exception {
        Card card = new Card();
        card.setTitle("Old Title");
        card.setDescription("Old Desc");
        card.setList(listEntity);
        card = cardRepository.save(card);

        CardDTO updateDTO = new CardDTO();
        updateDTO.setTitle("Updated Title");
        updateDTO.setDescription("Updated Desc");
        updateDTO.setListId(listEntity.getId());

        mockMvc.perform(put("/api/cards/updateCard/" + card.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.description").value("Updated Desc"));
    }

    @Test
    @WithMockUser(username = "mariem")
    void testDeleteCard() throws Exception {
        Card card = new Card();
        card.setTitle("To Delete");
        card.setDescription("Soon gone");
        card.setList(listEntity);
        card = cardRepository.save(card);

        mockMvc.perform(delete("/api/cards/deleteCard/" + card.getId()))
                .andExpect(status().isNoContent());
    }
}
