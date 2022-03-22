package com.consult.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.ApplicationPidFileWriter;

/**
 * @description:
 * @author: LiuJing
 * @time: 2022/3/22 17:48
 */

@SpringBootApplication
public class ConsultApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ConsultApplication.class);
        app.addListeners(new ApplicationPidFileWriter());
        app.run(args);
    }
}
