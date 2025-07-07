package com.example.todo_backend.services;

import com.example.todo_backend.dtos.ListDTO;
import java.util.List;

public interface ListService {
    ListDTO createList(ListDTO dto);
    List<ListDTO> getListsByBoardId(Long boardId);
    void deleteList(Long id);
}