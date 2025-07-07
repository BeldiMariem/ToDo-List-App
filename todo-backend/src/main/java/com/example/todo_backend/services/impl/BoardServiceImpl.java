package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.mappers.BoardMapper;
import com.example.todo_backend.repositories.BoardMemberRepository;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.BoardService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final BoardMapper boardMapper;
    private final BoardMemberRepository boardMemberRepository;
    private final UserRepository userRepository;

   @Override
    @Transactional
    public BoardDTO createBoard(BoardDTO dto, Long userId) {
        Board board = new Board();
        board.setName(dto.getName());
        Board savedBoard = boardRepository.save(board);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        BoardMember member = new BoardMember();
        member.setBoard(savedBoard);
        member.setUser(user);
        member.setRole("ADMIN");
        boardMemberRepository.save(member);
        
        return boardMapper.toSimpleDto(savedBoard);
    }
    


      @Override
    public List<BoardDTO> getBoardsByUserId(Long userId) {
        return boardRepository.findByMembers_User_Id(userId)
                .stream()
                .map(boardMapper::toSimpleDto)
                .collect(Collectors.toList());
    }

    @Override
    public BoardDTO getBoardById(Long id) {
        return boardRepository.findById(id).map(boardMapper::toSimpleDto).orElse(null);
    }

    @Override
    public void deleteBoard(Long id) {
        boardRepository.deleteById(id);
    }
}
