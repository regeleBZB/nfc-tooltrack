package com.nfctools.tooltracker;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class TooltrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(TooltrackerApplication.class, args);
	}

	// Pin the JVM's default timezone to Manila so LocalDateTime.now()
	// (used for transactedAt) stores Philippine wall-clock time instead of
	// the container's UTC. Runs once at startup, before any request.
	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Manila"));
	}
}