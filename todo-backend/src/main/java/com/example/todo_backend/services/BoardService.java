package com.example.todo_backend.services;

import java.util.List;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardUpdateDTO;

public interface BoardService {
    BoardDTO createBoard(BoardDTO dto,Long userId);
    List<BoardDTO> getBoardsByUserId(Long userId);
    BoardDTO getBoardById(Long id);
    void deleteBoard(Long id);
    BoardDTO updateBoard(BoardUpdateDTO updateDTO, Long currentUserId);

}