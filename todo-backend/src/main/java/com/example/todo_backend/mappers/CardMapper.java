package com.example.todo_backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.todo_backend.dtos.CardDTO;
import com.example.todo_backend.entities.Card;

@Mapper(componentModel = "spring", uses = {CardMemberMapper.class, CommentMapper.class})
public interface CardMapper {

    @Mapping(source = "list.id", target = "listId")
    CardDTO toDto(Card card);

    @Mapping(source = "listId", target = "list.id")
    Card toEntity(CardDTO dto);
}
