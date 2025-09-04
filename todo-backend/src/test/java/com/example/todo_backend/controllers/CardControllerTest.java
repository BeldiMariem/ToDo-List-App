package com.example.todo_backend.controllers;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.CardService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class CardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CardService cardService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private CardController cardController;

    private ObjectMapper objectMapper = new ObjectMapper();
    private CardDTO testCardDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(cardController).build();

        testCardDTO = new CardDTO();
        testCardDTO.setId(1L);
        testCardDTO.setTitle("Test Card");
        testCardDTO.setDescription("Test Description");
        testCardDTO.setListId(1L);
    }

    @Test
    void createCard_shouldReturnCreatedCard() throws Exception {
        Long userId = 1L;
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(cardService.createCard(any(CardDTO.class), eq(userId))).thenReturn(testCardDTO);

        mockMvc.perform(post("/api/cards/createCard")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCardDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Card"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.listId").value(1L));

        verify(authService).getCurrentUserId();
        verify(cardService).createCard(any(CardDTO.class), eq(userId));
    }

    @Test
    void updateCard_shouldReturnUpdatedCard() throws Exception {
        Long cardId = 1L;
        when(cardService.updateCard(eq(cardId), any(CardDTO.class))).thenReturn(testCardDTO);

        mockMvc.perform(put("/api/cards/updateCard/{cardId}", cardId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCardDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Card"));

        verify(cardService).updateCard(eq(cardId), any(CardDTO.class));
    }

    @Test
    void getCardsByList_shouldReturnListOfCardDTOs() throws Exception {
        Long listId = 1L;
        List<CardDTO> cards = List.of(testCardDTO);
        when(cardService.getCardsByListId(listId)).thenReturn(cards);

        mockMvc.perform(get("/api/cards/getCardsByList/{listId}", listId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Test Card"))
                .andExpect(jsonPath("$[0].description").value("Test Description"))
                .andExpect(jsonPath("$[0].listId").value(1L));

        verify(cardService).getCardsByListId(listId);
    }

    @Test
    void deleteCard_shouldReturnNoContent() throws Exception {
        Long cardId = 1L;
        doNothing().when(cardService).deleteCard(cardId);

        mockMvc.perform(delete("/api/cards/deleteCard/{id}", cardId))
                .andExpect(status().isNoContent());

        verify(cardService).deleteCard(cardId);
    }

    @Test
    void createCard_shouldHandleServiceException() throws Exception {
        Long userId = 1L;
        when(authService.getCurrentUserId()).thenReturn(userId);
        when(cardService.createCard(any(CardDTO.class), eq(userId)))
                .thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(post("/api/cards/createCard")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCardDTO)))
                .andExpect(status().isInternalServerError());

        verify(authService).getCurrentUserId();
        verify(cardService).createCard(any(CardDTO.class), eq(userId));
    }

    @Test
    void getCardsByList_shouldHandleEmptyList() throws Exception {
        Long listId = 999L;
        when(cardService.getCardsByListId(listId)).thenReturn(List.of());

        mockMvc.perform(get("/api/cards/getCardsByList/{listId}", listId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(cardService).getCardsByListId(listId);
    }

    @Test
    void deleteCard_shouldHandleNotFound() throws Exception {
        Long cardId = 999L;
        doThrow(new RuntimeException("Card not found"))
                .when(cardService).deleteCard(cardId);

        mockMvc.perform(delete("/api/cards/deleteCard/{id}", cardId))
                .andExpect(status().isNotFound()); 

        verify(cardService).deleteCard(cardId);
    }

    @Test
    void updateCard_shouldHandleNotFound() throws Exception {
        Long cardId = 999L;
        when(cardService.updateCard(eq(cardId), any(CardDTO.class)))
                .thenThrow(new RuntimeException("Card not found"));

        mockMvc.perform(put("/api/cards/updateCard/{cardId}", cardId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCardDTO)))
                .andExpect(status().isNotFound()); 

        verify(cardService).updateCard(eq(cardId), any(CardDTO.class));
    }
}