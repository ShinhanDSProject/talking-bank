-- MariaDB: #103 앱 배포 전 실행. 기존 테이블이 있으면 자동 덮어쓰지 않는다.
CREATE TABLE banks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(30) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    name VARCHAR(50) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_banks_code UNIQUE (code)
);
