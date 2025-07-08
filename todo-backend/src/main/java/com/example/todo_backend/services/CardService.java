package com.example.todo_backend.services;

import java.util.List;

import com.example.todo_backend.dtos.CardDTO;

public interface CardService {
    CardDTO createCard(CardDTO dto);
    List<CardDTO> getCardsByListId(Long listId);
    void deleteCard(Long id);
}