package com.example.todo_backend.services.impl;
import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.mappers.ListMapper;
import com.example.todo_backend.repositories.ListEntityRepository;
import com.example.todo_backend.services.ListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListServiceImpl implements ListService {

    private final ListEntityRepository listRepo;
    private final ListMapper mapper;

    @Override
    public ListDTO createList(ListDTO dto) {
        return mapper.toDto(listRepo.save(mapper.toEntity(dto)));
    }

    @Override
    public List<ListDTO> getListsByBoardId(Long boardId) {
        return listRepo.findAll().stream()
                .filter(l -> l.getBoard().getId().equals(boardId))
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteList(Long id) {
        listRepo.deleteById(id);
    }
}