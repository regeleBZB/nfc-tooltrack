package com.nfctools.tooltracker.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

/**
 * Thrown when a business rule is violated — e.g. trying to borrow
 * a tool that is already borrowed, or scanning an unregistered tag.
 * Carries an HttpStatus so the global handler returns the right HTTP code.
 */
@Getter
public class BusinessException extends RuntimeException {
    private final HttpStatus status;

    public BusinessException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
