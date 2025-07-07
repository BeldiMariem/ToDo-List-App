package com.example.todo_backend.mappers;

import java.util.ArrayList;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardDetailDTO;
import com.example.todo_backend.entities.Board;

@Mapper(componentModel = "spring", imports = ArrayList.class)
public interface BoardMapper {
    @Mapping(target = "members", expression = "java(new ArrayList<>())")
    @Mapping(target = "lists", expression = "java(new ArrayList<>())")
    BoardDetailDTO toDetailDto(Board board);

    @Mapping(target = "members", ignore = true)
    @Mapping(target = "lists", ignore = true)
    BoardDTO toSimpleDto(Board board);
}