package com.example.todo_backend.services;

import java.util.List;

import com.example.todo_backend.dtos.CommentDTO;

public interface CommentService {
    CommentDTO createComment(CommentDTO dto, String username);
    List<CommentDTO> getCommentsByCardId(Long cardId);
    void deleteComment(Long id);
}