package com.brian.ecommerce.config;

import com.brian.ecommerce.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import com.brian.ecommerce.security.JwtAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // ADMIN: bảo vệ toàn bộ API quản trị
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Swagger
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products/*/variants"
                        ).hasRole("ADMIN")

                        // Authentication & registration
                        .requestMatchers(HttpMethod.POST, "/api/users")
                        .permitAll()

                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        // Public: xem sản phẩm, danh mục và thông số
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products",
                                "/api/products/**",
                                "/api/categories",
                                "/api/categories/**",
                                "/api/attribute-groups"
                        ).permitAll()

                        // ADMIN: gán thuộc tính cho danh mục
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/categories/*/attributes/*"
                        ).hasRole("ADMIN")

                        // ADMIN: xóa thuộc tính khỏi danh mục
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/categories/*/attributes/*"
                        ).hasRole("ADMIN")

                        // ADMIN: quản lý sản phẩm
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // ADMIN: quản lý danh mục
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/categories"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/categories/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/categories/**"
                        ).hasRole("ADMIN")

                        // ADMIN: quản lý nhóm thuộc tính
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/attribute-groups"
                        ).hasRole("ADMIN")

                        // ADMIN: xem danh sách thuộc tính
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/attributes"
                        ).hasRole("ADMIN")

                        // ADMIN: tạo thuộc tính
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/attributes"
                        ).hasRole("ADMIN")

                        // ADMIN: gán/cập nhật thuộc tính sản phẩm
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/products/*/attributes/*"
                        ).hasRole("ADMIN")

                        // ADMIN: cập nhật trạng thái đơn hàng
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/*/status"
                        ).hasRole("ADMIN")

                        // Cho phép Spring Boot trả về thông tin lỗi
                        .requestMatchers("/error").permitAll()
                        // Các API còn lại yêu cầu đăng nhập
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .toList()
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept")
        );

        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}