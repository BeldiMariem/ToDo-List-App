package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.CardMember;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.CardMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.CardMemberRepository;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.CardService;
import com.example.todo_backend.services.NotificationService;

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
    private final BoardRepository boardRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CardDTO createCard(CardDTO cardDto, Long userId) {
        ListEntity list = findListById(cardDto.getListId());
        User user = findUserById(userId);
        
        Card card = createNewCard(cardDto, list);
        Card savedCard = cardRepository.save(card);
        
        addCardMember(savedCard, user);
        notifyBoardMembersAboutNewCard(list.getBoard(), user, card);
        
        return cardMapper.toDto(savedCard);
    }

    @Override
    @Transactional
    public CardDTO updateCard(Long cardId, CardDTO cardDto) {
        Card card = findCardById(cardId);
        updateCardProperties(card, cardDto);
        
        if (isListChanged(card, cardDto)) {
            handleListChange(card, cardDto);
        }
        
        Card updatedCard = cardRepository.save(card);
        return cardMapper.toDto(updatedCard);
    }

    @Override
    public List<CardDTO> getCardsByListId(Long listId) {
        return cardRepository.findByListId(listId).stream()
                .map(cardMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCard(Long cardId) {
        Card card = findCardById(cardId);
        Board board = card.getList().getBoard();
        User currentUser = getCurrentUser();
        
        notifyBoardMembersAboutDeletedCard(board, currentUser, card);
        cardRepository.deleteById(cardId);
    }

    private Card createNewCard(CardDTO cardDto, ListEntity list) {
        Card card = new Card();
        card.setTitle(cardDto.getTitle());
        card.setTag(cardDto.getTag());
        card.setDescription(cardDto.getDescription());
        card.setList(list);
        return card;
    }

    private void updateCardProperties(Card card, CardDTO cardDto) {
        card.setTitle(cardDto.getTitle());
        card.setDescription(cardDto.getDescription());
        card.setDescription(cardDto.getDescription());
    }

    private boolean isListChanged(Card card, CardDTO cardDto) {
        return cardDto.getListId() != null && 
               !cardDto.getListId().equals(card.getList().getId());
    }

    private void handleListChange(Card card, CardDTO cardDto) {
        ListEntity newList = findListById(cardDto.getListId());
        card.setList(newList);
        
        User currentUser = getCurrentUser();
        notifyBoardMembersAboutMovedCard(newList.getBoard(), currentUser, card);
    }

    private void addCardMember(Card card, User user) {
        CardMember member = new CardMember();
        member.setCard(card);
        member.setUser(user);
        cardMemberRepository.save(member);
    }

    private void notifyBoardMembersAboutNewCard(Board board, User creator, Card card) {
        String message = createCardCreationMessage(creator, card, board);
        notifyAllBoardMembersExceptCurrentUser(board, message);
    }

    private void notifyBoardMembersAboutMovedCard(Board board, User mover, Card card) {
        String message = createCardMoveMessage(mover, card, board);
        notifyAllBoardMembersExceptCurrentUser(board, message);
    }

    private void notifyBoardMembersAboutDeletedCard(Board board, User deleter, Card card) {
        String message = createCardDeletionMessage(deleter, card, board);
        notifyAllBoardMembersExceptCurrentUser(board, message);
    }

    private void notifyAllBoardMembersExceptCurrentUser(Board board, String message) {
        Long currentUserId = authService.getCurrentUserId();
        
        board.getMembers().stream()
            .filter(member -> !member.getUser().getId().equals(currentUserId))
            .forEach(member -> 
                notificationService.sendNotification(member.getUser(), message)
            );
    }

    private String createCardCreationMessage(User user, Card card, Board board) {
        return String.format("%s created card: %s in board: %s", 
            user.getUsername(), card.getTitle(), board.getName());
    }

    private String createCardMoveMessage(User user, Card card, Board board) {
        return String.format("%s moved card: %s in board: %s", 
            user.getUsername(), card.getTitle(), board.getName());
    }

    private String createCardDeletionMessage(User user, Card card, Board board) {
        return String.format("%s deleted card: %s from board: %s", 
            user.getUsername(), card.getTitle(), board.getName());
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

    private Board findBoardById(Long boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
    }

    private User getCurrentUser() {
        Long currentUserId = authService.getCurrentUserId();
        return findUserById(currentUserId);
    }
}