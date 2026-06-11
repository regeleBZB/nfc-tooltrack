package com.nfctools.tooltracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class 	TooltrackerApplication {
	public static void main(String[] args) {
		SpringApplication.run(TooltrackerApplication.class, args);
	}
}	