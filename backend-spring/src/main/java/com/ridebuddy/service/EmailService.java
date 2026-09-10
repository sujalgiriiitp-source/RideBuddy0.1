package com.ridebuddy.service;
import com.ridebuddy.entity.User;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service
public class EmailService {
 private static final Logger log=LoggerFactory.getLogger(EmailService.class);
 private final JavaMailSender sender; private final boolean enabled; private final String from;
 public EmailService(@Value("${ridebuddy.mail.enabled:false}") boolean enabled,@Value("${ridebuddy.mail.from}") String from, ObjectProvider<JavaMailSender> sender){this.enabled=enabled;this.from=from;this.sender=sender.getIfAvailable();}
 public void sendToken(User user,String type,String token){if(!enabled||sender==null){log.warn("Email delivery disabled or SMTP unavailable type={} userId={}",type,user.getId());return;}SimpleMailMessage message=new SimpleMailMessage();message.setFrom(from);message.setTo(user.getEmail());message.setSubject(type.equals("PASSWORD_RESET")?"RideBuddy password reset":"Verify your RideBuddy email");message.setText("Use this one-time token in the configured client: "+token);sender.send(message);}
}
