package com.example.todo_backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.entities.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "email", ignore = true)
    UserDTO toDTO(User user);
    
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "boardMemberships", ignore = true)
    @Mapping(target = "cardMemberships", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    User toEntity(UserDTO dto);

}
