package com.brian.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.cache.CacheManager;

@SpringBootApplication
@EnableCaching
public class EcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }

    @Bean
    ApplicationRunner checkCacheManager(CacheManager cacheManager) {
        return args -> {
            System.out.println("CACHE MANAGER = "
                    + cacheManager.getClass().getName());
        };
    }

}
