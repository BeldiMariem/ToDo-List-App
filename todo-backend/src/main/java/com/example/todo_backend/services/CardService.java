package com.example.todo_backend.services;

import java.util.List;

import com.example.todo_backend.dtos.CardDTO;

public interface CardService {
    CardDTO createCard(CardDTO dto, Long userId);
    CardDTO updateCard(Long cardId, CardDTO cardDTO);

    List<CardDTO> getCardsByListId(Long listId);
    void deleteCard(Long id);
}