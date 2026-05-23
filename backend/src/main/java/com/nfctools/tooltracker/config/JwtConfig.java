package com.nfctools.tooltracker.config;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data @Component @ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig { private String secret; private long expirationMs; }
