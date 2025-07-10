package com.example.todo_backend.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.Comment;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.CommentMapper;
import com.example.todo_backend.repositories.CardRepository;
import com.example.todo_backend.repositories.CommentRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.CommentService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommentDTO createComment(CommentDTO dto) {
        Card card = findCardById(dto.getCardId());
        User user = findUserById(dto.getUser().getId());

        Comment comment = buildComment(dto, card, user);
        Comment savedComment = commentRepository.save(comment);

        return commentMapper.toDto(savedComment);
    }

    @Override
    public List<CommentDTO> getCommentsByCardId(Long cardId) {
        return commentRepository.findAll().stream()
                .filter(comment -> comment.getCard().getId().equals(cardId))
                .map(commentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Comment", "id", id);
        }
        commentRepository.deleteById(id);
    }


    private Card findCardById(Long cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card", "id", cardId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private Comment buildComment(CommentDTO dto, Card card, User user) {
        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setCard(card);
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());
        return comment;
    }
}
