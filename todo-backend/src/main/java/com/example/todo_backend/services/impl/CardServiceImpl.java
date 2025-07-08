package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.mappers.CardMapper;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.services.CardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private final CardRepository cardRepository;
    private final CardMapper cardMapper;

    @Override
    public CardDTO createCard(CardDTO dto) {
        return cardMapper.toDto(cardRepository.save(cardMapper.toEntity(dto)));
    }

    @Override
    public List<CardDTO> getCardsByListId(Long listId) {
        return cardRepository.findAll().stream()
                .filter(c -> c.getList().getId().equals(listId))
                .map(cardMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCard(Long id) {
        cardRepository.deleteById(id);
    }
}