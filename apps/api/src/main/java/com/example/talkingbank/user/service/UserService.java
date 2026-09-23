package com.example.talkingbank.user.service;

import com.example.talkingbank.common.exception.BusinessException;
import com.example.talkingbank.common.exception.ErrorCode;
import com.example.talkingbank.user.dto.UserResponse;
import com.example.talkingbank.user.entity.User;
import com.example.talkingbank.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse findMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_004));
        return UserResponse.from(user);
    }
}
