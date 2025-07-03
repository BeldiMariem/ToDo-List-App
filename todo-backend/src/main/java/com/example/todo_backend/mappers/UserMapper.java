package com.example.todo_backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.example.todo_backend.dtos.UserDTO;
import com.example.todo_backend.entities.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    UserDTO toDTO(User user);
}
