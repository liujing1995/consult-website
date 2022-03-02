package com.consult;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;

/**
 * @description:
 * @author: LiuJing
 * @time: 2022/3/1 17:14
 */
@EnableZuulProxy
@SpringBootApplication
public class FrontApplication {
    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(FrontApplication.class);
        application.run(args);
    }
}
