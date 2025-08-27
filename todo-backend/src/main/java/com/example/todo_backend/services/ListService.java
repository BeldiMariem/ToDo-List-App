package com.example.todo_backend.services;

import java.util.List;

import com.example.todo_backend.dtos.ListDTO;

public interface ListService {
    ListDTO createList(ListDTO dto);
    List<ListDTO> getListsByBoardId(Long boardId);
    void deleteList(Long id);
    ListDTO updateList(ListDTO dto);

}