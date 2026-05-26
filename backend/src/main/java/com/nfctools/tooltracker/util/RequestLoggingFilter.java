package com.nfctools.tooltracker.util;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@Order(1)
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest  request  = (HttpServletRequest)  req;
        HttpServletResponse response = (HttpServletResponse) res;

        long start = System.currentTimeMillis();

        // Log incoming request
        String auth = request.getHeader("Authorization");
        log.info("→ {} {} | Auth: {}",
                request.getMethod(),
                request.getRequestURI(),
                auth != null ? "Bearer ***" : "none"
        );

        chain.doFilter(req, res);

        // Log outgoing response
        long ms = System.currentTimeMillis() - start;
        log.info("← {} {} | {} | {}ms",
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus(),
                ms
        );
    }
}