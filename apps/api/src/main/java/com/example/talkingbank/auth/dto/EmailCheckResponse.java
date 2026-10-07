package com.example.talkingbank.auth.dto;

public record EmailCheckResponse(boolean available) {

    public static EmailCheckResponse of(boolean available) {
        return new EmailCheckResponse(available);
    }
}
