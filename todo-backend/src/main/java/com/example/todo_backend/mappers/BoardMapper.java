package com.example.todo_backend.mappers;

import java.util.ArrayList;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardDetailDTO;
import com.example.todo_backend.entities.Board;

@Mapper(componentModel = "spring", uses = {BoardMemberMapper.class})
public interface BoardMapper {
    @Mapping(target = "members", expression = "java(new ArrayList<>())")
    @Mapping(target = "lists", expression = "java(new ArrayList<>())")
    BoardDetailDTO toDetailDto(Board board);


    BoardDTO toSimpleDto(Board board);
}