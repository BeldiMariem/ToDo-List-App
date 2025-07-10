package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.mappers.CardMapper;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.services.CardService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private final CardRepository cardRepository;
    private final ListEntityRepository listRepository;

    private final CardMapper cardMapper;

    @Override
    @Transactional
    public CardDTO createCard(CardDTO cardDTO) {
        ListEntity list = listRepository.findById(cardDTO.getListId())
                .orElseThrow(() -> new RuntimeException("List not found"));

        Card card = new Card();
        card.setTitle(cardDTO.getTitle());
        card.setDescription(cardDTO.getDescription());
        card.setList(list);

        return cardMapper.toDto(cardRepository.save(card));
    }
    @Override
    @Transactional
    public CardDTO updateCard(Long cardId, CardDTO cardDTO) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        card.setTitle(cardDTO.getTitle());
        card.setDescription(cardDTO.getDescription());

        if (cardDTO.getListId() != null && !cardDTO.getListId().equals(card.getList().getId())) {
            ListEntity newList = listRepository.findById(cardDTO.getListId())
                    .orElseThrow(() -> new RuntimeException("Target list not found"));
            card.setList(newList);
        }

        Card updated = cardRepository.save(card);
        return cardMapper.toDto(updated);
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