package com.example.todo_backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.todo_backend.dtos.ListDTO;
import com.example.todo_backend.entities.ListEntity;

@Mapper(componentModel = "spring", uses = {CardMapper.class})
public interface ListMapper {

    @Mapping(source = "board.id", target = "boardId")
    ListDTO toDto(ListEntity listEntity);

    @Mapping(source = "boardId", target = "board.id")
    ListEntity toEntity(ListDTO dto);
}
