package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.mappers.CommentMapper;
import com.example.todo_backend.repositories.CommentRepository;
import com.example.todo_backend.services.CommentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

    @Override
    public CommentDTO createComment(CommentDTO dto) {
        return commentMapper.toDto(commentRepository.save(commentMapper.toEntity(dto)));
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
}