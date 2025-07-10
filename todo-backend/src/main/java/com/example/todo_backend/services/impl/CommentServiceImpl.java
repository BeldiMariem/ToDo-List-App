package com.example.todo_backend.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.entities.Card;
import com.example.todo_backend.entities.Comment;
import com.example.todo_backend.entities.User;
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
        Card card = cardRepository.findById(dto.getCardId())
                .orElseThrow(() -> new RuntimeException("Card not found"));

        User user = userRepository.findById(dto.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment saved = commentRepository.save(addComment(card, user,  dto));
        return commentMapper.toDto(saved);
    }

    @Override
    public List<CommentDTO> getCommentsByCardId(Long cardId) {
        return commentRepository.findAll().stream()
                .filter(c -> c.getCard().getId().equals(cardId))
                .map(commentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    private Comment addComment(Card card, User user, CommentDTO dto) {
        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setCard(card);
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());
        return comment;
    }
}
