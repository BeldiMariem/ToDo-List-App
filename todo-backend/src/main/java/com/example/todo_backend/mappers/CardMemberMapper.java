package com.example.todo_backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.todo_backend.dtos.CardMemberDTO;
import com.example.todo_backend.entities.CardMember;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CardMemberMapper {

    @Mapping(source = "card.id", target = "cardId")
    CardMemberDTO toDto(CardMember cardMember);

    @Mapping(source = "cardId", target = "card.id")
    CardMember toEntity(CardMemberDTO dto);
}
