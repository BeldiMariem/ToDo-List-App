package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.CardMember;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.CardMapper;
import com.example.todo_backend.repositories.CardMemberRepository;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.CardService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private final CardRepository cardRepository;
    private final ListEntityRepository listRepository;
    private final CardMapper cardMapper;
    private final UserRepository userRepository;
    private final CardMemberRepository cardMemberRepository;


    @Override
    @Transactional
    public CardDTO createCard(CardDTO cardDTO, Long userId) {
        ListEntity list = findListById(cardDTO.getListId());
        User user = findUserById(userId);
        Card card = new Card();
        card.setTitle(cardDTO.getTitle());
        card.setDescription(cardDTO.getDescription());
        card.setList(list);
        Card savedCard = cardRepository.save(card);
        addCardMember(savedCard, user);

        return cardMapper.toDto(savedCard);
    }

    @Override
    @Transactional
    public CardDTO updateCard(Long cardId, CardDTO cardDTO) {
        Card card = findCardById(cardId);

        card.setTitle(cardDTO.getTitle());
        card.setDescription(cardDTO.getDescription());

        if (cardDTO.getListId() != null && !cardDTO.getListId().equals(card.getList().getId())) {
            ListEntity newList = findListById(cardDTO.getListId());
            card.setList(newList);
        }

        return cardMapper.toDto(cardRepository.save(card));
    }

    @Override
    public List<CardDTO> getCardsByListId(Long listId) {
        return cardRepository.findAll().stream()
                .filter(card -> card.getList().getId().equals(listId))
                .map(cardMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCard(Long id) {
        if (!cardRepository.existsById(id)) {
            throw new ResourceNotFoundException("Card", "id", id);
        }
        cardRepository.deleteById(id);
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private Card findCardById(Long cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card", "id", cardId));
    }

    private ListEntity findListById(Long listId) {
        return listRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("List", "id", listId));
    }
      private void addCardMember(Card card, User user) {
        CardMember member = new CardMember();
        member.setCard(card);
        member.setUser(user);
        cardMemberRepository.save(member);
    }
}
