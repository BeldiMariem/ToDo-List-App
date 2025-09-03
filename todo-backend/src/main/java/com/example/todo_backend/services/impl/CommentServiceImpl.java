package com.example.todo_backend.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.Comment;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.CommentMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.CommentRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.CommentService;
import com.example.todo_backend.services.NotificationService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CommentDTO createComment(CommentDTO commentDto, String username) {
        User user = findUserByUsername(username);
        Card card = findCardById(commentDto.getCardId());
        
        Comment comment = createNewComment(commentDto, card, user);
        Comment savedComment = commentRepository.save(comment);
        
        notifyBoardMembersAboutNewComment(card, user);
        
        return convertToCommentDto(savedComment, user);
    }

    @Override
    public List<CommentDTO> getCommentsByCardId(Long cardId) {
        return commentRepository.findByCardId(cardId).stream()
                .map(comment -> convertToCommentDto(comment, comment.getUser()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = findCommentById(commentId);
        Card card = comment.getCard();
        User currentUser = getCurrentUser();
        
        notifyBoardMembersAboutDeletedComment(card, currentUser);
        commentRepository.deleteById(commentId);
    }

    private Comment createNewComment(CommentDTO commentDto, Card card, User user) {
        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        comment.setCard(card);
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());
        return comment;
    }

    private CommentDTO convertToCommentDto(Comment comment, User user) {
        return new CommentDTO(
            comment.getId(),
            comment.getContent(),
            comment.getCard().getId(),
            new UserDTO(user.getId(), user.getUsername(), user.getEmail()),
            comment.getCreatedAt()
        );
    }

    private void notifyBoardMembersAboutNewComment(Card card, User commenter) {
        Board board = card.getList().getBoard();
        String message = createNewCommentMessage(commenter, card, board);
        notifyAllBoardMembersExceptCurrentUser(board, message);
    }

    private void notifyBoardMembersAboutDeletedComment(Card card, User deleter) {
        Board board = card.getList().getBoard();
        String message = createDeletedCommentMessage(deleter, card, board);
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

    private String createNewCommentMessage(User user, Card card, Board board) {
        return String.format("%s added a new comment on card: %s in board: %s", 
            user.getUsername(), card.getTitle(), board.getName());
    }

    private String createDeletedCommentMessage(User user, Card card, Board board) {
        return String.format("%s deleted a comment from card: %s in board: %s", 
            user.getUsername(), card.getTitle(), board.getName());
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private Card findCardById(Long cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new EntityNotFoundException("Card not found with id: " + cardId));
    }

    private Comment findCommentById(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
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