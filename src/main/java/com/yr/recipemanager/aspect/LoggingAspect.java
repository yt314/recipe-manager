package com.yr.recipemanager.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Pointcut("execution(* com.yr.recipemanager.service..*(..))")
    public void serviceMethods() {
    }

    @Around("serviceMethods()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();

        log.info("Entering method: {}", method);
        try {
            Object result = joinPoint.proceed();
            log.info("Exiting method: {} (success)", method);
            return result;
        } catch (Exception ex) {
            log.error("Exception in method: {} - {}", method, ex.getMessage());
            throw ex;
        }
    }
}
