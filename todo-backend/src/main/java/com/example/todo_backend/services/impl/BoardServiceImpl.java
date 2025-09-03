package com.example.todo_backend.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.todo_backend.dtos.BoardDTO;
import com.example.todo_backend.dtos.BoardUpdateDTO;
import com.example.todo_backend.entities.Board;
import com.example.todo_backend.entities.BoardMember;
import com.example.todo_backend.entities.User;
import com.example.todo_backend.exceptions.ResourceNotFoundException;
import com.example.todo_backend.mappers.BoardMapper;
import com.example.todo_backend.repositories.BoardMemberRepository;
import com.example.todo_backend.repositories.BoardRepository;
import com.example.todo_backend.repositories.UserRepository;
import com.example.todo_backend.services.AuthService;
import com.example.todo_backend.services.BoardService;
import com.example.todo_backend.services.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private static final String DEFAULT_ROLE = "MEMBER";
    private static final String ADMIN_ROLE = "ADMIN";

    private final BoardRepository boardRepository;
    private final BoardMapper boardMapper;
    private final UserRepository userRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final NotificationService notificationService;
    private final AuthService authService;

    @Override
    @Transactional
    public BoardDTO createBoard(BoardDTO boardDto, Long userId) {
        Board board = createNewBoard(boardDto);
        Board savedBoard = boardRepository.save(board);
        
        User creator = findUserById(userId);
        addBoardMember(savedBoard, creator, ADMIN_ROLE);
        
        return boardMapper.toSimpleDto(savedBoard);
    }

    @Override
    public List<BoardDTO> getBoardsByUserId(Long userId) {
        return boardRepository.findByMembers_User_Id(userId).stream()
                .map(boardMapper::toSimpleDto)
                .collect(Collectors.toList());
    }

    @Override
    public BoardDTO getBoardById(Long boardId) {
        Board board = findBoardById(boardId);
        return boardMapper.toSimpleDto(board);
    }

    @Override
    @Transactional
    public void deleteBoard(Long boardId) {
        Board board = findBoardById(boardId);        
        notifyMembersAboutBoardDeletion(board);
        boardRepository.deleteById(boardId);
    }

    @Override
    @Transactional
    public BoardDTO updateBoard(BoardUpdateDTO updateDto, Long currentUserId) {
        Board board = findBoardById(updateDto.getBoardId());
        User currentUser = findUserById(currentUserId);

        updateBoardNameIfProvided(board, updateDto.getNewName());
        addNewMembersIfProvided(board, updateDto.getUserIds(), updateDto.getRole());
        
        Board savedBoard = boardRepository.save(board);
        
        notifyMembersAboutBoardUpdate(board, currentUser);
        
        return boardMapper.toSimpleDto(savedBoard);
    }

    private Board createNewBoard(BoardDTO boardDto) {
        Board board = new Board();
        board.setName(boardDto.getName());
        return board;
    }

    private Board findBoardById(Long boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

 

    private void notifyMembersAboutBoardDeletion(Board board) {
        User currentUser = findUserById(authService.getCurrentUserId());
        String notificationMessage = String.format("%s deleted board: %s", 
            currentUser.getUsername(), board.getName());
        
        board.getMembers().stream()
            .filter(member -> !isCurrentUser(member.getUser()))
            .forEach(member -> 
                notificationService.sendNotification(member.getUser(), notificationMessage)
            );
    }

    private void updateBoardNameIfProvided(Board board, String newName) {
        if (isValidName(newName)) {
            board.setName(newName.trim());
        }
    }

    private boolean isValidName(String name) {
        return name != null && !name.trim().isEmpty();
    }

    private void addNewMembersIfProvided(Board board, List<Long> userIds, String role) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        
        userIds.forEach(userId -> addOrUpdateBoardMember(board, userId, role));
    }

    private void addOrUpdateBoardMember(Board board, Long userId, String role) {
        User user = findUserById(userId);
        
        findExistingMember(board, userId)
            .ifPresentOrElse(
                member -> updateMemberRole(member, role),
                () -> addBoardMember(board, user, role)
            );
    }

    private java.util.Optional<BoardMember> findExistingMember(Board board, Long userId) {
        return board.getMembers().stream()
                .filter(member -> member.getUser().getId().equals(userId))
                .findFirst();
    }

    private void updateMemberRole(BoardMember member, String newRole) {
        if (isValidRole(newRole)) {
            member.setRole(newRole.trim());
        }
    }

    private void addBoardMember(Board board, User user, String role) {
        BoardMember member = new BoardMember();
        member.setBoard(board);
        member.setUser(user);
        member.setRole(getValidRole(role));
        
        boardMemberRepository.save(member);
        board.getMembers().add(member);
    }

    private String getValidRole(String role) {
        return isValidRole(role) ? role.trim() : DEFAULT_ROLE;
    }

    private boolean isValidRole(String role) {
        return role != null && !role.trim().isEmpty();
    }

    private void notifyMembersAboutBoardUpdate(Board board, User updatingUser) {
        String notificationMessage = String.format("%s added new users to board: %s", 
            updatingUser.getUsername(), board.getName());
        
        board.getMembers().stream()
            .filter(member -> !isCurrentUser(member.getUser()))
            .forEach(member -> 
                notificationService.sendNotification(member.getUser(), notificationMessage)
            );
    }

    private boolean isCurrentUser(User user) {
        return user.getId().equals(authService.getCurrentUserId());
    }
}