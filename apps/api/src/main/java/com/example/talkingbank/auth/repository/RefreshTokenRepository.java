package com.example.talkingbank.auth.repository;

import com.example.talkingbank.auth.entity.RefreshToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByUserId(Long userId);

    /** 조회 없이 한 문장으로 지운다. 호출하는 쪽이 @Transactional 이어야 한다. */
    @Modifying
    @Query("delete from RefreshToken r where r.userId = :userId")
    void deleteByUserId(Long userId);
}
