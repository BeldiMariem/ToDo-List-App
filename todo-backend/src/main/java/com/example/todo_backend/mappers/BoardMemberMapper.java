package com.example.todo_backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.todo_backend.dtos.BoardMemberDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.User;

@Mapper(componentModel = "spring")
public interface BoardMemberMapper {
    @Mapping(target = "board", source = "boardId")
    @Mapping(target = "user", source = "userId")
    BoardMember toEntity(BoardMemberDTO boardMemberDTO);
    
    @Mapping(target = "boardId", source = "board.id")
    @Mapping(target = "userId", source = "user.id")
    BoardMemberDTO toDto(BoardMember boardMember);
    
    default Board mapBoardIdToBoard(Long boardId) {
        if (boardId == null) return null;
        Board board = new Board();
        board.setId(boardId);
        return board;
    }
    
    default User mapUserIdToUser(Long userId) {
        if (userId == null) return null;
        User user = new User();
        user.setId(userId);
        return user;
    }
}