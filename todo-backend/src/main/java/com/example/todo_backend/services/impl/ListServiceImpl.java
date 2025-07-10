package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.ListEntity;
import com.example.todo_backend.mappers.ListMapper;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.services.ListService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ListServiceImpl implements ListService {

    private final ListEntityRepository listRepository;
    private final ListMapper listMapper;
    private final BoardRepository boardRepository;

    @Override
    @Transactional
    public ListDTO createList(ListDTO listDTO) {
        Board board = boardRepository.findById(listDTO.getBoardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));

        ListEntity list = new ListEntity();
        list.setName(listDTO.getName());
        list.setColor(listDTO.getColor());
        list.setBoard(board);

        return listMapper.toDto(listRepository.save(list));
    }

    @Override
    public List<ListDTO> getListsByBoardId(Long boardId) {
        return listRepository.findAll().stream()
                .filter(l -> l.getBoard().getId().equals(boardId))
                .map(listMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteList(Long listId) {
        if (!listRepository.existsById(listId)) {
            throw new RuntimeException("List not found");
        }
        listRepository.deleteById(listId);
    }
}
