package com.example.todo_backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.todo_backend.dtos.CommentDTO;
import com.example.todo_backend.entities.Comment;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CommentMapper {

    @Mapping(source = "card.id", target = "cardId")
    CommentDTO toDto(Comment comment);

    @Mapping(source = "cardId", target = "card.id")
    Comment toEntity(CommentDTO dto);
}
